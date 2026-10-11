package com.niraj.portfolio.auth;

import com.niraj.portfolio.auth.AuthDtos.AuthResponse;
import com.niraj.portfolio.auth.AuthDtos.UserInfo;
import com.niraj.portfolio.exception.UnauthorizedException;
import com.niraj.portfolio.security.JwtService;
import com.niraj.portfolio.user.AppUser;
import com.niraj.portfolio.user.AppUserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    /** Result of login/refresh: the JSON body plus the raw refresh token destined for the cookie. */
    public record Session(AuthResponse response, String refreshToken) {
    }

    private static final SecureRandom RANDOM = new SecureRandom();

    private final AppUserRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final Duration refreshTtl;
    private final String dummyHash;

    public AuthService(AppUserRepository users, RefreshTokenRepository refreshTokens, PasswordEncoder encoder,
                       JwtService jwt, @Value("${app.jwt.refresh-token-days:7}") long refreshDays) {
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.encoder = encoder;
        this.jwt = jwt;
        this.refreshTtl = Duration.ofDays(refreshDays);
        // Used to spend similar time when the e-mail is unknown, so response timing does not reveal valid accounts.
        this.dummyHash = encoder.encode("timing-equalisation-placeholder");
    }

    public Duration refreshTtl() {
        return refreshTtl;
    }

    @Transactional
    public Session login(String email, String password) {
        AppUser user = users.findByEmailIgnoreCase(email.trim()).orElse(null);
        if (user == null) {
            encoder.matches(password, dummyHash); // result intentionally ignored
            throw new UnauthorizedException("Invalid e-mail or password.");
        }
        if (!encoder.matches(password, user.getPasswordHash()) || !user.isEnabled()) {
            throw new UnauthorizedException("Invalid e-mail or password.");
        }
        return issue(user);
    }

    /** noRollbackFor keeps the "revoke everything" side effect when a replayed token is detected. */
    @Transactional(noRollbackFor = UnauthorizedException.class)
    public Session refresh(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new UnauthorizedException("Authentication required.");
        }
        RefreshToken stored = refreshTokens.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new UnauthorizedException("Session expired. Please sign in again."));
        AppUser user = stored.getUser();
        if (stored.isRevoked()) {
            // A revoked token being replayed suggests theft: invalidate every session for this user.
            refreshTokens.revokeAllForUser(user.getId());
            throw new UnauthorizedException("Session expired. Please sign in again.");
        }
        if (stored.getExpiresAt().isBefore(Instant.now()) || !user.isEnabled()) {
            throw new UnauthorizedException("Session expired. Please sign in again.");
        }
        stored.setRevoked(true);
        refreshTokens.save(stored);
        return issue(user);
    }

    @Transactional
    public void logout(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        refreshTokens.findByTokenHash(hash(rawToken)).ifPresent(t -> {
            t.setRevoked(true);
            refreshTokens.save(t);
        });
    }

    @Transactional(readOnly = true)
    public UserInfo me(String email) {
        AppUser user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UnauthorizedException("Authentication required."));
        return new UserInfo(user.getId(), user.getEmail(), user.getRole().name());
    }

    @Scheduled(cron = "0 15 3 * * *")
    @Transactional
    public void purgeExpiredTokens() {
        refreshTokens.deleteExpired(Instant.now());
    }

    private Session issue(AppUser user) {
        byte[] bytes = new byte[48];
        RANDOM.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(hash(raw));
        token.setExpiresAt(Instant.now().plus(refreshTtl));
        refreshTokens.save(token);

        AuthResponse body = new AuthResponse(jwt.createAccessToken(user), "Bearer", jwt.accessTtlSeconds(),
                new UserInfo(user.getId(), user.getEmail(), user.getRole().name()));
        return new Session(body, raw);
    }

    static String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(raw.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
