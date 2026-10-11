package com.niraj.portfolio.common;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Resolves the caller address used only as an in-memory rate-limit key (never stored).
 * Forwarded headers are honoured only when app.security.trust-proxy=true, and the LAST entry is used because
 * that is the one appended by the platform's own proxy.
 */
@Component
public class ClientIp {

    private final boolean trustProxy;

    public ClientIp(@Value("${app.security.trust-proxy:false}") boolean trustProxy) {
        this.trustProxy = trustProxy;
    }

    public String resolve(HttpServletRequest request) {
        if (trustProxy) {
            String xff = request.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) {
                String[] parts = xff.split(",");
                return parts[parts.length - 1].trim();
            }
        }
        return request.getRemoteAddr();
    }
}
