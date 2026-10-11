package com.niraj.portfolio.projects;

import com.niraj.portfolio.common.PageResponse;
import com.niraj.portfolio.common.Text;
import com.niraj.portfolio.exception.ConflictException;
import com.niraj.portfolio.exception.NotFoundException;
import com.niraj.portfolio.projects.ProjectDtos.Card;
import com.niraj.portfolio.projects.ProjectDtos.Detail;
import com.niraj.portfolio.projects.ProjectDtos.DetailResponse;
import com.niraj.portfolio.projects.ProjectDtos.Request;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private static final Sort DEFAULT_SORT = Sort.by(Sort.Order.asc("displayOrder"), Sort.Order.desc("createdAt"));

    private final ProjectRepository repository;

    @Transactional(readOnly = true)
    public PageResponse<Card> list(String q, String category, String tech, Boolean featured, int page, int size) {
        PageRequest pageable = PageResponse.pageRequest(page, size, DEFAULT_SORT);
        Page<Project> result = repository.findAll(spec(q, category, tech, featured), pageable);
        return PageResponse.of(result.map(ProjectDtos::toCard));
    }

    @Transactional(readOnly = true)
    public PageResponse<Detail> adminList(String q, int page, int size) {
        PageRequest pageable = PageResponse.pageRequest(page, size, DEFAULT_SORT);
        Page<Project> result = repository.findAll(spec(q, null, null, null), pageable);
        return PageResponse.of(result.map(ProjectDtos::toDetail));
    }

    @Transactional(readOnly = true)
    public DetailResponse getBySlug(String slug) {
        Project project = repository.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Project not found."));
        return new DetailResponse(ProjectDtos.toDetail(project), related(project));
    }

    @Transactional(readOnly = true)
    public List<String> categories() {
        return repository.findCategories();
    }

    @Transactional(readOnly = true)
    public List<String> technologies() {
        return repository.findTechnologies();
    }

    @Transactional
    public Detail create(Request r) {
        Project p = new Project();
        String slug = Text.hasText(r.slug()) ? r.slug().trim() : uniqueSlug(Text.slugify(r.title()));
        if (repository.existsBySlug(slug)) {
            throw new ConflictException("A project with this slug already exists.");
        }
        p.setSlug(slug);
        apply(p, r);
        return ProjectDtos.toDetail(repository.save(p));
    }

    @Transactional
    public Detail update(Long id, Request r) {
        Project p = repository.findById(id).orElseThrow(() -> new NotFoundException("Project not found."));
        if (Text.hasText(r.slug()) && !r.slug().trim().equals(p.getSlug())) {
            if (repository.existsBySlugAndIdNot(r.slug().trim(), id)) {
                throw new ConflictException("A project with this slug already exists.");
            }
            p.setSlug(r.slug().trim());
        }
        apply(p, r);
        return ProjectDtos.toDetail(repository.save(p));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Project not found.");
        }
        repository.deleteById(id);
    }

    private void apply(Project p, Request r) {
        p.setTitle(r.title().trim());
        p.setSummary(r.summary().trim());
        p.setDescription(Text.blankToNull(r.description()));
        p.setProblem(Text.blankToNull(r.problem()));
        p.setSolution(Text.blankToNull(r.solution()));
        p.setArchitecture(Text.blankToNull(r.architecture()));
        p.setCategory(r.category().trim());
        p.setStatus(r.status());
        p.setFeatured(r.featured());
        p.setSample(r.sample());
        p.setDisplayOrder(r.displayOrder());
        p.setCoverImageUrl(Text.blankToNull(r.coverImageUrl()));
        p.setGithubUrl(Text.blankToNull(r.githubUrl()));
        p.setLiveUrl(Text.blankToNull(r.liveUrl()));
        replace(p.getTechnologies(), r.technologies());
        replace(p.getKeyFeatures(), r.keyFeatures());
        replace(p.getScreenshots(), r.screenshots());
    }

    private static void replace(List<String> target, List<String> source) {
        target.clear();
        target.addAll(Text.cleanList(source));
    }

    private String uniqueSlug(String base) {
        String candidate = base;
        int n = 2;
        while (repository.existsBySlug(candidate)) {
            candidate = base + "-" + n++;
        }
        return candidate;
    }

    private List<Card> related(Project project) {
        PageRequest top = PageRequest.of(0, 3, DEFAULT_SORT);
        Map<Long, Project> found = new LinkedHashMap<>();
        for (Project p : repository.findByCategoryAndIdNotOrderByDisplayOrderAscCreatedAtDesc(
                project.getCategory(), project.getId(), top)) {
            found.put(p.getId(), p);
        }
        if (found.size() < 3) {
            for (Project p : repository.findByFeaturedTrueAndIdNotOrderByDisplayOrderAscCreatedAtDesc(
                    project.getId(), top)) {
                if (found.size() >= 3) {
                    break;
                }
                found.putIfAbsent(p.getId(), p);
            }
        }
        List<Card> cards = new ArrayList<>();
        found.values().forEach(p -> cards.add(ProjectDtos.toCard(p)));
        return cards;
    }

    static Specification<Project> spec(String q, String category, String tech, Boolean featured) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (Text.hasText(q)) {
                String like = Text.likePattern(q);
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like, '\\'),
                        cb.like(cb.lower(root.get("summary")), like, '\\')));
            }
            if (Text.hasText(category)) {
                predicates.add(cb.equal(cb.lower(root.get("category")), category.trim().toLowerCase()));
            }
            if (Text.hasText(tech)) {
                predicates.add(cb.isMember(tech.trim(), root.<List<String>>get("technologies")));
            }
            if (featured != null) {
                predicates.add(cb.equal(root.get("featured"), featured));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
