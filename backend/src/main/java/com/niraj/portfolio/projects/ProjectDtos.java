package com.niraj.portfolio.projects;

import com.niraj.portfolio.common.Patterns;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public final class ProjectDtos {

    private ProjectDtos() {
    }

    public record Request(
            @Size(max = 160) @Pattern(regexp = Patterns.SLUG, message = "must be lowercase letters, numbers and hyphens") String slug,
            @NotBlank @Size(max = 200) String title,
            @NotBlank @Size(max = 500) String summary,
            @Size(max = 10000) String description,
            @Size(max = 5000) String problem,
            @Size(max = 5000) String solution,
            @Size(max = 5000) String architecture,
            @NotBlank @Size(max = 80) String category,
            @NotNull ProjectStatus status,
            boolean featured,
            boolean sample,
            @Min(0) @Max(100000) int displayOrder,
            @Size(max = 500) @Pattern(regexp = Patterns.URL_OR_PATH, message = "must be an http(s) URL or a /path") String coverImageUrl,
            @Size(max = 500) @Pattern(regexp = Patterns.HTTP_URL, message = "must be an http(s) URL") String githubUrl,
            @Size(max = 500) @Pattern(regexp = Patterns.HTTP_URL, message = "must be an http(s) URL") String liveUrl,
            @Size(max = 30) List<@NotBlank @Size(max = 80) String> technologies,
            @Size(max = 20) List<@NotBlank @Size(max = 300) String> keyFeatures,
            @Size(max = 10) List<@NotBlank @Size(max = 500) @Pattern(regexp = Patterns.URL_OR_PATH, message = "must be an http(s) URL or a /path") String> screenshots) {
    }

    /** Compact representation used in lists and search. */
    public record Card(Long id, String slug, String title, String summary, String category, ProjectStatus status,
                       boolean featured, boolean sample, String coverImageUrl, String githubUrl, String liveUrl,
                       List<String> technologies) {
    }

    public record Detail(Long id, String slug, String title, String summary, String description, String problem,
                         String solution, String architecture, String category, ProjectStatus status,
                         boolean featured, boolean sample, int displayOrder, String coverImageUrl,
                         String githubUrl, String liveUrl, List<String> technologies, List<String> keyFeatures,
                         List<String> screenshots, Instant createdAt, Instant updatedAt) {
    }

    public record DetailResponse(Detail project, List<Card> related) {
    }

    public static Card toCard(Project p) {
        return new Card(p.getId(), p.getSlug(), p.getTitle(), p.getSummary(), p.getCategory(), p.getStatus(),
                p.isFeatured(), p.isSample(), p.getCoverImageUrl(), p.getGithubUrl(), p.getLiveUrl(),
                new ArrayList<>(p.getTechnologies()));
    }

    public static Detail toDetail(Project p) {
        return new Detail(p.getId(), p.getSlug(), p.getTitle(), p.getSummary(), p.getDescription(), p.getProblem(),
                p.getSolution(), p.getArchitecture(), p.getCategory(), p.getStatus(), p.isFeatured(), p.isSample(),
                p.getDisplayOrder(), p.getCoverImageUrl(), p.getGithubUrl(), p.getLiveUrl(),
                new ArrayList<>(p.getTechnologies()), new ArrayList<>(p.getKeyFeatures()),
                new ArrayList<>(p.getScreenshots()), p.getCreatedAt(), p.getUpdatedAt());
    }
}
