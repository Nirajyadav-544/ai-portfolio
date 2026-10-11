package com.niraj.portfolio.profile;

import com.niraj.portfolio.common.Patterns;
import com.niraj.portfolio.common.Text;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public final class ProfileDtos {

    private ProfileDtos() {
    }

    public record Request(
            @NotBlank @Size(max = 120) String fullName,
            @NotBlank @Size(max = 160) String title,
            @Size(max = 300) String headline,
            @Size(max = 10000) String bio,
            @Size(max = 5000) String careerGoals,
            @Size(max = 5000) String philosophy,
            @Size(max = 20) List<@NotBlank @Size(max = 80) String> interests,
            @Size(max = 10) List<@NotBlank @Size(max = 60) String> roles,
            @Size(max = 120) String location,
            @NotNull AvailabilityStatus availabilityStatus,
            @Size(max = 200) String availabilityMessage,
            @Email @Size(max = 254) String email,
            @Pattern(regexp = Patterns.GITHUB_USERNAME, message = "must be a valid GitHub username") String githubUsername,
            @Size(max = 300) @Pattern(regexp = Patterns.HTTP_URL, message = "must be an http(s) URL") String githubUrl,
            @Size(max = 300) @Pattern(regexp = Patterns.HTTP_URL, message = "must be an http(s) URL") String linkedinUrl,
            @Size(max = 300) @Pattern(regexp = Patterns.HTTP_URL, message = "must be an http(s) URL") String twitterUrl,
            @Size(max = 300) @Pattern(regexp = Patterns.HTTP_URL, message = "must be an http(s) URL") String websiteUrl,
            @Size(max = 500) @Pattern(regexp = Patterns.URL_OR_PATH, message = "must be an http(s) URL or a /path") String resumeUrl,
            @Size(max = 500) @Pattern(regexp = Patterns.URL_OR_PATH, message = "must be an http(s) URL or a /path") String avatarUrl) {
    }

    public record Response(
            String fullName, String title, String headline, String bio, String careerGoals, String philosophy,
            List<String> interests, List<String> roles, String location,
            AvailabilityStatus availabilityStatus, String availabilityMessage,
            String email, String githubUsername, String githubUrl, String linkedinUrl, String twitterUrl,
            String websiteUrl, String resumeUrl, String avatarUrl, Instant updatedAt) {
    }

    public static Response toResponse(Profile p) {
        return new Response(p.getFullName(), p.getTitle(), p.getHeadline(), p.getBio(), p.getCareerGoals(),
                p.getPhilosophy(), Text.splitLines(p.getInterests()), Text.splitLines(p.getRoles()),
                p.getLocation(), p.getAvailabilityStatus(), p.getAvailabilityMessage(), p.getEmail(),
                p.getGithubUsername(), p.getGithubUrl(), p.getLinkedinUrl(), p.getTwitterUrl(),
                p.getWebsiteUrl(), p.getResumeUrl(), p.getAvatarUrl(), p.getUpdatedAt());
    }
}
