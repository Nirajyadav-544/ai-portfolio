package com.niraj.portfolio.experience;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public final class ExperienceDtos {

    private ExperienceDtos() {
    }

    public record Request(
            @NotBlank @Size(max = 200) String company,
            @NotBlank @Size(max = 200) String jobTitle,
            @NotNull ExperienceType type,
            @Size(max = 120) String location,
            LocalDate startDate,
            LocalDate endDate,
            @Size(max = 5000) String description,
            @Size(max = 20) List<@NotBlank @Size(max = 500) String> achievements,
            boolean sample) {
    }

    public record Response(Long id, String company, String jobTitle, ExperienceType type, String location,
                           LocalDate startDate, LocalDate endDate, String description, List<String> achievements,
                           boolean sample) {
    }

    public static Response toResponse(Experience e) {
        return new Response(e.getId(), e.getCompany(), e.getJobTitle(), e.getType(), e.getLocation(),
                e.getStartDate(), e.getEndDate(), e.getDescription(), new ArrayList<>(e.getAchievements()),
                e.isSample());
    }
}
