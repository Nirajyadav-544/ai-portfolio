package com.niraj.portfolio.education;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public final class EducationDtos {

    private EducationDtos() {
    }

    public record Request(
            @NotBlank @Size(max = 200) String institution,
            @NotBlank @Size(max = 200) String degree,
            @Size(max = 200) String fieldOfStudy,
            LocalDate startDate,
            LocalDate endDate,
            @Size(max = 5000) String description,
            boolean sample) {
    }

    public record Response(Long id, String institution, String degree, String fieldOfStudy, LocalDate startDate,
                           LocalDate endDate, String description, boolean sample) {
    }

    public static Response toResponse(Education e) {
        return new Response(e.getId(), e.getInstitution(), e.getDegree(), e.getFieldOfStudy(), e.getStartDate(),
                e.getEndDate(), e.getDescription(), e.isSample());
    }
}
