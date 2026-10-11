package com.niraj.portfolio.projects;

import com.niraj.portfolio.common.Auditable;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
public class Project extends Auditable {

    @Column(nullable = false, unique = true, length = 160)
    private String slug;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 500)
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String problem;

    @Column(columnDefinition = "TEXT")
    private String solution;

    @Column(columnDefinition = "TEXT")
    private String architecture;

    @Column(nullable = false, length = 80)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProjectStatus status = ProjectStatus.IN_PROGRESS;

    @Column(nullable = false)
    private boolean featured;

    /** True for demo/sample entries that are not real projects. */
    @Column(name = "is_sample", nullable = false)
    private boolean sample;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(name = "github_url", length = 500)
    private String githubUrl;

    @Column(name = "live_url", length = 500)
    private String liveUrl;

    @ElementCollection
    @CollectionTable(name = "project_technologies", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "sort_index")
    @Column(name = "technology", nullable = false, length = 80)
    private List<String> technologies = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "project_features", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "sort_index")
    @Column(name = "feature", nullable = false, length = 300)
    private List<String> keyFeatures = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "project_screenshots", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "sort_index")
    @Column(name = "url", nullable = false, length = 500)
    private List<String> screenshots = new ArrayList<>();
}
