package com.niraj.portfolio.experience;

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
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "experience")
@Getter
@Setter
@NoArgsConstructor
public class Experience extends Auditable {

    @Column(nullable = false, length = 200)
    private String company;

    @Column(name = "job_title", nullable = false, length = 200)
    private String jobTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ExperienceType type = ExperienceType.WORK;

    @Column(length = 120)
    private String location;

    @Column(name = "start_date")
    private LocalDate startDate;

    /** Null means current. */
    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(name = "experience_achievements", joinColumns = @JoinColumn(name = "experience_id"))
    @OrderColumn(name = "sort_index")
    @Column(name = "achievement", nullable = false, length = 500)
    private List<String> achievements = new ArrayList<>();

    @Column(name = "is_sample", nullable = false)
    private boolean sample;
}
