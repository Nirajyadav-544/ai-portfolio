package com.niraj.portfolio.ai;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public final class ChatDtos {

    private ChatDtos() {
    }

    public record Turn(
            @Pattern(regexp = "^(user|assistant)$", message = "must be user or assistant") String role,
            @NotBlank @Size(max = 2000) String content) {
    }

    public record ChatRequest(
            @NotBlank @Size(max = 1000) String message,
            @Size(max = 12) List<@Valid Turn> history) {
    }

    public record ChatResponse(String reply) {
    }

    /** Safe to show in the admin dashboard: never includes the key itself. */
    public record AiStatus(boolean configured, String provider, String model, int maxRequests,
                           long windowSeconds, long timeoutSeconds, boolean conversationsStored) {
    }
}
