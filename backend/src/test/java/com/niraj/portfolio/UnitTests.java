package com.niraj.portfolio;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.niraj.portfolio.ai.AiChatService;
import com.niraj.portfolio.ai.AiProvider;
import com.niraj.portfolio.ai.ChatDtos.ChatRequest;
import com.niraj.portfolio.ai.PortfolioContextService;
import com.niraj.portfolio.common.RateLimiterService;
import com.niraj.portfolio.common.Text;
import com.niraj.portfolio.exception.ExternalServiceException;
import com.niraj.portfolio.exception.RateLimitException;
import com.niraj.portfolio.security.JwtService;
import com.niraj.portfolio.user.AppUser;
import com.niraj.portfolio.user.Role;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;

class UnitTests {

    @Test
    void slugify() {
        assertEquals("hello-world-2", Text.slugify("  Hello, World! 2 "));
        assertEquals("item", Text.slugify("!!!"));
    }

    @Test
    void rateLimiterBlocksAfterMax() {
        RateLimiterService limiter = new RateLimiterService();
        limiter.check("t", "k", 2, Duration.ofMinutes(1));
        limiter.check("t", "k", 2, Duration.ofMinutes(1));
        assertThrows(RateLimitException.class, () -> limiter.check("t", "k", 2, Duration.ofMinutes(1)));
        limiter.check("t", "other", 2, Duration.ofMinutes(1));
    }

    @Test
    void jwtRoundTripAndTamper() {
        JwtService jwt = new JwtService("unit-test-secret-unit-test-secret-1234", "iss", 5);
        AppUser u = new AppUser();
        u.setId(7L);
        u.setEmail("a@b.c");
        u.setRole(Role.ADMIN);
        String token = jwt.createAccessToken(u);
        assertEquals(7L, jwt.parse(token).orElseThrow().userId());
        assertTrue(jwt.parse(token + "x").isEmpty());
    }

    @Test
    void jwtRejectsShortSecret() {
        assertThrows(IllegalStateException.class, () -> new JwtService("short", "iss", 5));
    }

    @Test
    void chatStopsWhenProviderNotConfigured() {
        AiProvider provider = mock(AiProvider.class);
        when(provider.isConfigured()).thenReturn(false);
        AiChatService svc = new AiChatService(provider, mock(PortfolioContextService.class),
                new RateLimiterService(), 5, 60, 10);
        assertThrows(ExternalServiceException.class, () -> svc.chat(new ChatRequest("hi", null), "ip"));
        verify(provider, never()).generate(any());
    }

    @Test
    void chatReturnsProviderReply() {
        AiProvider provider = mock(AiProvider.class);
        PortfolioContextService ctx = mock(PortfolioContextService.class);
        when(provider.isConfigured()).thenReturn(true);
        when(ctx.buildSystemPrompt()).thenReturn("sys");
        when(provider.generate(any())).thenReturn("  answer  ");
        AiChatService svc = new AiChatService(provider, ctx, new RateLimiterService(), 5, 60, 10);
        assertEquals("answer", svc.chat(new ChatRequest("hi", List.of()), "ip").reply());
    }
}
