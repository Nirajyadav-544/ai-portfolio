
package com.niraj.portfolio.auth;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/password-reset")
public class PasswordResetController {

    private final PasswordResetService service;

    public PasswordResetController(PasswordResetService service) {
        this.service = service;
    }

    @PostMapping("/request")
    public ResponseEntity<Map<String, String>> requestOtp(
            @RequestBody Map<String, String> body) {

        String email = body.get("email");

        if (email == null || email.isBlank()
                || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Please enter a valid email address.")
            );
        }

        service.requestReset(email);

        return ResponseEntity.ok(Map.of(
                "message",
                "If an eligible account exists, a password reset OTP will be sent."
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(
            @RequestBody Map<String, String> body) {

        String email = body.get("email");
        String otp = body.get("otp");

        if (email == null || email.isBlank()
                || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
                || otp == null || !otp.matches("\\d{6}")) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Enter a valid email and 6-digit OTP.")
            );
        }

        String resetToken = service.verifyOtp(email, otp);

        return ResponseEntity.ok(Map.of(
                "message", "OTP verified successfully.",
                "resetToken", resetToken
        ));
    }

    @PostMapping("/confirm")
    public ResponseEntity<Map<String, String>> confirmReset(
            @RequestBody Map<String, String> body) {

        String resetToken = body.get("resetToken");
        String newPassword = body.get("newPassword");

        if (resetToken == null || resetToken.isBlank()
                || newPassword == null
                || newPassword.length() < 12
                || newPassword.length() > 72) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "A valid reset session and password of 12–72 characters are required."
                    )
            );
        }

        service.confirmReset(resetToken, newPassword);

        return ResponseEntity.ok(Map.of(
                "message",
                "Password changed successfully. Please sign in with your new password."
        ));
    }
}
