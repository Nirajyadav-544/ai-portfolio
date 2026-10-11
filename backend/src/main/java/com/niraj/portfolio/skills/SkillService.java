package com.niraj.portfolio.skills;

import com.niraj.portfolio.common.PageResponse;
import com.niraj.portfolio.common.Text;
import com.niraj.portfolio.exception.ConflictException;
import com.niraj.portfolio.exception.NotFoundException;
import com.niraj.portfolio.skills.SkillDtos.Request;
import com.niraj.portfolio.skills.SkillDtos.Response;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository repository;

    @Transactional(readOnly = true)
    public List<Response> list(SkillCategory category) {
        List<Skill> skills = category == null
                ? repository.findAllByOrderByCategoryAscDisplayOrderAscNameAsc()
                : repository.findByCategoryOrderByDisplayOrderAscNameAsc(category);
        return skills.stream().map(SkillDtos::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<Response> adminList(String q, int page, int size) {
        Specification<Skill> spec = (root, query, cb) -> Text.hasText(q)
                ? cb.like(cb.lower(root.get("name")), Text.likePattern(q), '\\')
                : cb.conjunction();
        PageRequest pageable = PageResponse.pageRequest(page, size,
                Sort.by(Sort.Order.asc("category"), Sort.Order.asc("displayOrder"), Sort.Order.asc("name")));
        return PageResponse.of(repository.findAll(spec, pageable).map(SkillDtos::toResponse));
    }

    @Transactional
    public Response create(Request r) {
        if (repository.existsByNameIgnoreCase(r.name().trim())) {
            throw new ConflictException("A skill with this name already exists.");
        }
        Skill s = new Skill();
        apply(s, r);
        return SkillDtos.toResponse(repository.save(s));
    }

    @Transactional
    public Response update(Long id, Request r) {
        Skill s = repository.findById(id).orElseThrow(() -> new NotFoundException("Skill not found."));
        if (repository.existsByNameIgnoreCaseAndIdNot(r.name().trim(), id)) {
            throw new ConflictException("A skill with this name already exists.");
        }
        apply(s, r);
        return SkillDtos.toResponse(repository.save(s));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Skill not found.");
        }
        repository.deleteById(id);
    }

    private void apply(Skill s, Request r) {
        s.setName(r.name().trim());
        s.setCategory(r.category());
        s.setIcon(Text.blankToNull(r.icon()));
        s.setProficiency(r.proficiency());
        s.setSample(r.sample());
        s.setDisplayOrder(r.displayOrder());
    }
}
