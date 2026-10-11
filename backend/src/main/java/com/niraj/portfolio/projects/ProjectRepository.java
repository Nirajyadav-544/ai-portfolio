package com.niraj.portfolio.projects;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {

    Optional<Project> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    @Query("select distinct p.category from Project p order by p.category")
    List<String> findCategories();

    @Query("select distinct t from Project p join p.technologies t order by t")
    List<String> findTechnologies();

    List<Project> findByCategoryAndIdNotOrderByDisplayOrderAscCreatedAtDesc(String category, Long id, Pageable pageable);

    List<Project> findByFeaturedTrueAndIdNotOrderByDisplayOrderAscCreatedAtDesc(Long id, Pageable pageable);

    List<Project> findByGithubUrlIsNotNullOrderByDisplayOrderAsc();

    List<Project> findAllByOrderByDisplayOrderAscCreatedAtDesc();
}
