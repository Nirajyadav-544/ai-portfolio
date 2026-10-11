package com.niraj.portfolio.skills;

import com.niraj.portfolio.common.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "skills")
@Getter
@Setter
@NoArgsConstructor
public class Skill extends Auditable {

    @Column(nullable = false, unique = true, length = 80)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SkillCategory category;

    /** Key of an icon known to the frontend (for example "react" or "database"). */
    @Column(length = 40)
    private String icon;

    /** 0-100, only when honestly supplied by the owner. */
    @Column
    private Integer proficiency;

    @Column(name = "is_sample", nullable = false)
    private boolean sample;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
