package com.niraj.portfolio.analytics;

import com.niraj.portfolio.analytics.AnalyticsDtos.EventRequest;
import com.niraj.portfolio.analytics.AnalyticsDtos.Summary;
import com.niraj.portfolio.common.ClientIp;
import com.niraj.portfolio.common.RateLimiterService;
import com.niraj.portfolio.exception.BadRequestException;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Duration;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Analytics")
public class AnalyticsController {

    private static final Set<EventType> CLIENT_EVENTS =
            Set.of(EventType.PAGE_VIEW, EventType.PROJECT_VIEW, EventType.RESUME_DOWNLOAD);

    private final AnalyticsService service;
    private final RateLimiterService limiter;
    private final ClientIp clientIp;
    private final int max;
    private final Duration window;

    public AnalyticsController(AnalyticsService service, RateLimiterService limiter, ClientIp clientIp,
                              @Value("${app.analytics.rate-limit.max-requests:120}") int max,
                              @Value("${app.analytics.rate-limit.window-seconds:60}") long windowSeconds) {
        this.service = service;
        this.limiter = limiter;
        this.clientIp = clientIp;
        this.max = max;
        this.window = Duration.ofSeconds(windowSeconds);
    }

    @PostMapping("/analytics/events")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void track(@Valid @RequestBody EventRequest request, HttpServletRequest http) {
        if (!CLIENT_EVENTS.contains(request.type())) {
            throw new BadRequestException("This event type cannot be reported by the browser.");
        }
        limiter.check("analytics", clientIp.resolve(http), max, window);
        service.record(request.type(), request.path(), request.referrer(), request.targetId());
    }

    @GetMapping("/admin/analytics/summary")
    @SecurityRequirement(name = "bearerAuth")
    public Summary summary(@RequestParam(defaultValue = "30") int days) {
        return service.summary(days);
    }
}
