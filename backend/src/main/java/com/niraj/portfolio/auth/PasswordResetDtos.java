
package com.niraj.portfolio.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class PasswordResetDtos {

    private PasswordResetDtos() {}

    public record Request(
        @NotBlank
        @Email
        @Size(max = 254)
        String email
    ) {}

    public record Confirm(
        @NotBlank
        @Size(min = 40, max = 100)
        String token,

        @NotBlank
        @Size(min = 12, max = 128)
        String newPassword
    ) {}

    public record Message(String message) {}
}
