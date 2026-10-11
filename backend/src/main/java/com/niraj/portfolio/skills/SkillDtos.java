package com.niraj.portfolio.skills;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class SkillDtos {

    private SkillDtos() {
    }

    public record Request(
            @NotBlank @Size(max = 80) String name,
            @NotNull SkillCategory category,
            @Size(max = 40) @Pattern(regexp = "^[a-z0-9-]*$", message = "must be a lowercase icon key") String icon,
            @Min(0) @Max(100) Integer proficiency,
            boolean sample,
            @Min(0) @Max(100000) int displayOrder) {
    }

    public record Response(Long id, String name, SkillCategory category, String icon, Integer proficiency,
                           boolean sample, int displayOrder) {
    }

    public static Response toResponse(Skill s) {
        return new Response(s.getId(), s.getName(), s.getCategory(), s.getIcon(), s.getProficiency(),
                s.isSample(), s.getDisplayOrder());
    }
}
