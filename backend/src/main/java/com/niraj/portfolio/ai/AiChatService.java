package com.niraj.portfolio.ai;

import com.niraj.portfolio.ai.AiProvider.Message;
import com.niraj.portfolio.ai.ChatDtos.AiStatus;
import com.niraj.portfolio.ai.ChatDtos.ChatRequest;
import com.niraj.portfolio.ai.ChatDtos.ChatResponse;
import com.niraj.portfolio.ai.ChatDtos.Turn;
import com.niraj.portfolio.common.RateLimiterService;
import com.niraj.portfolio.exception.ExternalServiceException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class AiChatService {

    static final String EMPTY_REPLY_FALLBACK =
            "I could not produce an answer to that. Could you rephrase, or use the contact form?";
    private static final int MAX_HISTORY_TURNS = 8;

    private final AiProvider provider;
    private final PortfolioContextService context;
    private final RateLimiterService limiter;
    private final int maxRequests;
    private final long windowSeconds;
    private final long timeoutSeconds;

    public AiChatService(AiProvider provider, PortfolioContextService context, RateLimiterService limiter,
                         @Value("${app.ai.rate-limit.max-requests:15}") int maxRequests,
                         @Value("${app.ai.rate-limit.window-seconds:600}") long windowSeconds,
                         @Value("${app.ai.timeout-seconds:20}") long timeoutSeconds) {
        this.provider = provider;
        this.context = context;
        this.limiter = limiter;
        this.maxRequests = maxRequests;
        this.windowSeconds = windowSeconds;
        this.timeoutSeconds = timeoutSeconds;
    }

    /** @param clientKey in-memory rate limit key (never persisted). */
    public ChatResponse chat(ChatRequest request, String clientKey) {
        if (!provider.isConfigured()) {
            throw new ExternalServiceException(HttpStatus.SERVICE_UNAVAILABLE,
                    "The AI assistant is not configured yet.");
        }
        limiter.check("ai", clientKey, maxRequests, Duration.ofSeconds(windowSeconds));

        List<Message> conversation = new ArrayList<>();
        List<Turn> history = request.history() == null ? List.of() : request.history();
        int from = Math.max(0, history.size() - MAX_HISTORY_TURNS);
        for (Turn t : history.subList(from, history.size())) {
            conversation.add(new Message(t.role(), t.content().trim()));
        }
        conversation.add(new Message(Message.USER, request.message().trim()));

        String reply = provider.generate(new AiProvider.Prompt(context.buildSystemPrompt(), conversation));
        return new ChatResponse(reply == null || reply.isBlank() ? EMPTY_REPLY_FALLBACK : reply.trim());
    }

    public AiStatus status() {
        return new AiStatus(provider.isConfigured(), provider.providerName(), provider.modelName(), maxRequests,
                windowSeconds, timeoutSeconds, false);
    }
}
