package com.niraj.portfolio.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record LoginRequest(
            @NotBlank @Size(max = 254) String email,
            @NotBlank @Size(max = 128) String password) {
    }

    public record UserInfo(Long id, String email, String role) {
    }

    /** The refresh token is delivered only as an HttpOnly cookie, never in this body. */
    public record AuthResponse(String accessToken, String tokenType, long expiresInSeconds, UserInfo user) {
    }
}
