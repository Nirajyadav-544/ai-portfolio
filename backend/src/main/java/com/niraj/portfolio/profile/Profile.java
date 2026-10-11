package com.niraj.portfolio.profile;

import com.niraj.portfolio.common.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Single-row table holding the owner's editable profile. */
@Entity
@Table(name = "profile")
@Getter
@Setter
@NoArgsConstructor
public class Profile extends Auditable {

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(length = 300)
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "career_goals", columnDefinition = "TEXT")
    private String careerGoals;

    @Column(columnDefinition = "TEXT")
    private String philosophy;

    /** Newline separated. */
    @Column(length = 1000)
    private String interests;

    /** Newline separated; shown as animated hero roles. */
    @Column(length = 1000)
    private String roles;

    @Column(length = 120)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status", nullable = false, length = 30)
    private AvailabilityStatus availabilityStatus = AvailabilityStatus.AVAILABLE;

    @Column(name = "availability_message", length = 200)
    private String availabilityMessage;

    @Column(length = 254)
    private String email;

    @Column(name = "github_username", length = 80)
    private String githubUsername;

    @Column(name = "github_url", length = 300)
    private String githubUrl;

    @Column(name = "linkedin_url", length = 300)
    private String linkedinUrl;

    @Column(name = "twitter_url", length = 300)
    private String twitterUrl;

    @Column(name = "website_url", length = 300)
    private String websiteUrl;

    @Column(name = "resume_url", length = 500)
    private String resumeUrl;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;
}
