package com.niraj.portfolio.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public final class ContactDtos {

    private ContactDtos() {
    }

    /** "website" is a honeypot: real visitors never see or fill it. */
    public record Request(
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(max = 150) String subject,
            @NotBlank @Size(min = 10, max = 5000) String message,
            @Size(max = 200) String website) {
    }

    public record Receipt(String message) {
    }

    public record StatusRequest(@NotNull ContactStatus status) {
    }

    public record MessageResponse(Long id, String name, String email, String subject, String message,
                                  ContactStatus status, Instant createdAt) {
    }

    public static MessageResponse toResponse(ContactMessage m) {
        return new MessageResponse(m.getId(), m.getName(), m.getEmail(), m.getSubject(), m.getMessage(),
                m.getStatus(), m.getCreatedAt());
    }
}
