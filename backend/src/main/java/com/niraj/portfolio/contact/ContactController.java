package com.niraj.portfolio.contact;

import com.niraj.portfolio.analytics.AnalyticsService;
import com.niraj.portfolio.analytics.EventType;
import com.niraj.portfolio.common.ClientIp;
import com.niraj.portfolio.common.PageResponse;
import com.niraj.portfolio.common.RateLimiterService;
import com.niraj.portfolio.contact.ContactDtos.MessageResponse;
import com.niraj.portfolio.contact.ContactDtos.Receipt;
import com.niraj.portfolio.contact.ContactDtos.Request;
import com.niraj.portfolio.contact.ContactDtos.StatusRequest;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Contact")
public class ContactController {

    private final ContactService service;
    private final RateLimiterService limiter;
    private final ClientIp clientIp;
    private final AnalyticsService analytics;
    private final int max;
    private final Duration window;

    public ContactController(ContactService service, RateLimiterService limiter, ClientIp clientIp,
                             AnalyticsService analytics,
                             @Value("${app.contact.rate-limit.max-requests:5}") int max,
                             @Value("${app.contact.rate-limit.window-seconds:3600}") long windowSeconds) {
        this.service = service;
        this.limiter = limiter;
        this.clientIp = clientIp;
        this.analytics = analytics;
        this.max = max;
        this.window = Duration.ofSeconds(windowSeconds);
    }

    @PostMapping("/contact")
    @ResponseStatus(HttpStatus.CREATED)
    public Receipt submit(@Valid @RequestBody Request request, HttpServletRequest http) {
        limiter.check("contact", clientIp.resolve(http), max, window);
        boolean stored = service.submit(request);
        if (stored) {
            analytics.record(EventType.CONTACT_SUBMIT, "/contact", null, null);
        }
        // Same response for bots caught by the honeypot, so they learn nothing.
        return new Receipt("Thanks! Your message has been received.");
    }

    @GetMapping("/admin/messages")
    @SecurityRequirement(name = "bearerAuth")
    public PageResponse<MessageResponse> list(@RequestParam(required = false) ContactStatus status,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        return service.list(status, page, size);
    }

    @PatchMapping("/admin/messages/{id}/status")
    @SecurityRequirement(name = "bearerAuth")
    public MessageResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest request) {
        return service.updateStatus(id, request.status());
    }

    @DeleteMapping("/admin/messages/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @SecurityRequirement(name = "bearerAuth")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
