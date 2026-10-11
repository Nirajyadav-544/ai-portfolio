package com.niraj.portfolio.ai;

import com.niraj.portfolio.ai.ChatDtos.AiStatus;
import com.niraj.portfolio.ai.ChatDtos.ChatRequest;
import com.niraj.portfolio.ai.ChatDtos.ChatResponse;
import com.niraj.portfolio.analytics.AnalyticsService;
import com.niraj.portfolio.analytics.EventType;
import com.niraj.portfolio.common.ClientIp;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "AI assistant")
public class AiController {

    private final AiChatService chatService;
    private final AnalyticsService analytics;
    private final ClientIp clientIp;

    @PostMapping("/ai/chat")
    public ChatResponse chat(@Valid @RequestBody ChatRequest request, HttpServletRequest http) {
        ChatResponse response = chatService.chat(request, clientIp.resolve(http));
        // Only the fact that a chat happened is counted. The conversation itself is never stored.
        analytics.record(EventType.AI_CHAT, null, null, null);
        return response;
    }

    @GetMapping("/admin/ai/status")
    @SecurityRequirement(name = "bearerAuth")
    public AiStatus status() {
        return chatService.status();
    }
}
