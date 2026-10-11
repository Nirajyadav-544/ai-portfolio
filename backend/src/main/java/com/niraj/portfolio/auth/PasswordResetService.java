
package com.niraj.portfolio.auth;

import com.niraj.portfolio.user.AppUser;
import com.niraj.portfolio.user.AppUserRepository;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PasswordResetService {

    private static final int OTP_MINUTES = 10;
    private static final int RESET_TOKEN_MINUTES = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final AppUserRepository users;
    private final PasswordResetTokenRepository tokens;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final String fromEmail;

    public PasswordResetService(
            AppUserRepository users,
            PasswordResetTokenRepository tokens,
            RefreshTokenRepository refreshTokens,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender,
            @Value("${spring.mail.username:}") String fromEmail
    ) {
        this.users = users;
        this.tokens = tokens;
        this.refreshTokens = refreshTokens;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    @Transactional
    public void requestReset(String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank()) {
            return;
        }

        String email = rawEmail.trim().toLowerCase(Locale.ROOT);
        var optionalUser = users.findByEmailIgnoreCase(email);

        // Do not reveal whether an account exists.
        if (optionalUser.isEmpty()) {
            return;
        }

        AppUser user = optionalUser.get();

        if (!user.isEnabled()) {
            return;
        }

        String otp = String.format(
                Locale.ROOT,
                "%06d",
                RANDOM.nextInt(1_000_000)
        );

        // Invalidate previous reset credentials.
        tokens.deleteForUser(user.getId());

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setTokenHash(AuthService.hash(email + ":" + otp));
        token.setExpiresAt(
                Instant.now().plus(OTP_MINUTES, ChronoUnit.MINUTES)
        );
        token.setUsed(false);

        tokens.save(token);

        SimpleMailMessage message = new SimpleMailMessage();

        if (fromEmail != null && !fromEmail.isBlank()) {
            message.setFrom(fromEmail);
        }

        message.setTo(email);
        message.setSubject("Your password reset verification code");
        message.setText(
                "Your password reset OTP is: " + otp + "\n\n"
                + "This code expires in " + OTP_MINUTES + " minutes.\n"
                + "If you did not request a password reset, ignore this email."
        );

        mailSender.send(message);
    }

    /**
     * Verifies the email OTP and exchanges it for a temporary reset token.
     * The raw reset token is returned only to the client; its hash is stored.
     */
    @Transactional
    public String verifyOtp(String rawEmail, String otp) {
        if (rawEmail == null || rawEmail.isBlank()
                || otp == null || !otp.matches("\\d{6}")) {
            throw invalidOtp();
        }

        String email = rawEmail.trim().toLowerCase(Locale.ROOT);
        String otpHash = AuthService.hash(email + ":" + otp);

        PasswordResetToken token = tokens.findByTokenHash(otpHash)
                .orElseThrow(this::invalidOtp);

        Instant now = Instant.now();

        if (token.isUsed()
                || token.getExpiresAt() == null
                || !token.getExpiresAt().isAfter(now)) {
            throw invalidOtp();
        }

        AppUser user = token.getUser();

        if (user == null || !user.isEnabled()
                || !email.equalsIgnoreCase(user.getEmail())) {
            throw invalidOtp();
        }

        // Generate a cryptographically random, high-entropy token.
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String resetToken = HexFormat.of().formatHex(bytes);

        // Replace the OTP hash so that the OTP cannot be reused.
        token.setTokenHash(AuthService.hash(resetToken));
        token.setExpiresAt(
                now.plus(RESET_TOKEN_MINUTES, ChronoUnit.MINUTES)
        );
        token.setUsed(false);
        tokens.save(token);

        return resetToken;
    }

    /**
     * Changes the password using the temporary reset token.
     */
    @Transactional
    public void confirmReset(String resetToken, String newPassword) {
        if (resetToken == null || resetToken.isBlank()
                || newPassword == null
                || newPassword.length() < 12
                || newPassword.length() > 72) {
            throw invalidResetToken();
        }

        String hash = AuthService.hash(resetToken);

        PasswordResetToken token = tokens.findByTokenHash(hash)
                .orElseThrow(this::invalidResetToken);

        if (token.isUsed()
                || token.getExpiresAt() == null
                || !token.getExpiresAt().isAfter(Instant.now())) {
            throw invalidResetToken();
        }

        AppUser user = token.getUser();

        if (user == null || !user.isEnabled()) {
            throw invalidResetToken();
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        users.save(user);

        // Consume the reset token after successful password change.
        token.setUsed(true);
        tokens.save(token);

        // Revoke existing refresh sessions.
        refreshTokens.revokeAllForUser(user.getId());
    }

    private ResponseStatusException invalidOtp() {
        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid or expired verification code."
        );
    }

    private ResponseStatusException invalidResetToken() {
        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid or expired password reset session. Please verify your OTP again."
        );
    }
}
