package com.niraj.portfolio.auth;

import com.niraj.portfolio.auth.AuthDtos.AuthResponse;
import com.niraj.portfolio.auth.AuthDtos.LoginRequest;
import com.niraj.portfolio.auth.AuthDtos.UserInfo;
import com.niraj.portfolio.common.ClientIp;
import com.niraj.portfolio.common.RateLimiterService;
import com.niraj.portfolio.common.Text;
import com.niraj.portfolio.exception.BadRequestException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication")
public class AuthController {

    static final String REFRESH_COOKIE = "refresh_token";
    private static final String COOKIE_PATH = "/api/auth";

    private final AuthService auth;
    private final RateLimiterService limiter;
    private final ClientIp clientIp;
    private final boolean cookieSecure;
    private final String cookieSameSite;
    private final String cookieDomain;
    private final int loginMax;
    private final Duration loginWindow;

    public AuthController(AuthService auth, RateLimiterService limiter, ClientIp clientIp,
                          @Value("${app.cookie.secure:true}") boolean cookieSecure,
                          @Value("${app.cookie.same-site:Lax}") String cookieSameSite,
                          @Value("${app.cookie.domain:}") String cookieDomain,
                          @Value("${app.security.login-rate-limit.max-requests:10}") int loginMax,
                          @Value("${app.security.login-rate-limit.window-seconds:900}") long loginWindowSeconds) {
        this.auth = auth;
        this.limiter = limiter;
        this.clientIp = clientIp;
        this.cookieSecure = cookieSecure;
        this.cookieSameSite = cookieSameSite;
        this.cookieDomain = cookieDomain;
        this.loginMax = loginMax;
        this.loginWindow = Duration.ofSeconds(loginWindowSeconds);
    }

    @PostMapping("/login")
    @Operation(summary = "Sign in. Returns an access token; the refresh token is set as an HttpOnly cookie.")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest http) {
        limiter.check("login", clientIp.resolve(http), loginMax, loginWindow);
        AuthService.Session session = auth.login(request.email(), request.password());
        return withCookie(session);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Exchange the refresh cookie for a new access token (rotates the refresh token).")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken, HttpServletRequest http) {
        requireAjaxHeader(http);
        limiter.check("refresh", clientIp.resolve(http), loginMax * 6, loginWindow);
        return withCookie(auth.refresh(refreshToken));
    }

    @PostMapping("/logout")
    @Operation(summary = "Revoke the refresh token and clear the cookie.")
    public ResponseEntity<Void> logout(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken, HttpServletRequest http) {
        requireAjaxHeader(http);
        auth.logout(refreshToken);
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookie("", Duration.ZERO).toString()).build();
    }

    @GetMapping("/me")
    @Operation(summary = "Current admin user", security = @SecurityRequirement(name = "bearerAuth"))
    public UserInfo me(Authentication authentication) {
        return auth.me(authentication.getName());
    }

    /**
     * Cross-site forms cannot set custom headers, and cross-origin scripts need a CORS preflight to do so, which
     * only our configured origins pass. This protects the cookie-based endpoints from CSRF.
     */
    private void requireAjaxHeader(HttpServletRequest http) {
        if (!"XMLHttpRequest".equals(http.getHeader("X-Requested-With"))) {
            throw new BadRequestException("Missing X-Requested-With header.");
        }
    }

    private ResponseEntity<AuthResponse> withCookie(AuthService.Session session) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie(session.refreshToken(), auth.refreshTtl()).toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(session.response());
    }

    private ResponseCookie cookie(String value, Duration maxAge) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(REFRESH_COOKIE, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path(COOKIE_PATH)
                .maxAge(maxAge);
        if (Text.hasText(cookieDomain)) {
            builder.domain(cookieDomain.trim());
        }
        return builder.build();
    }
}
