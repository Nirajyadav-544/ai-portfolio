package com.niraj.portfolio.skills;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SkillRepository extends JpaRepository<Skill, Long>, JpaSpecificationExecutor<Skill> {

    List<Skill> findAllByOrderByCategoryAscDisplayOrderAscNameAsc();

    List<Skill> findByCategoryOrderByDisplayOrderAscNameAsc(SkillCategory category);

    List<Skill> findByNameContainingIgnoreCaseOrderByNameAsc(String name, Pageable pageable);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
