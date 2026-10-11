package com.niraj.portfolio.experience;

import com.niraj.portfolio.common.PageResponse;
import com.niraj.portfolio.common.Text;
import com.niraj.portfolio.exception.BadRequestException;
import com.niraj.portfolio.exception.NotFoundException;
import com.niraj.portfolio.experience.ExperienceDtos.Request;
import com.niraj.portfolio.experience.ExperienceDtos.Response;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExperienceService {

    private final ExperienceRepository repository;

    @Transactional(readOnly = true)
    public List<Response> list() {
        return repository.findAllByOrderByStartDateDesc().stream().map(ExperienceDtos::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<Response> adminList(int page, int size) {
        return PageResponse.of(repository.findAll(PageResponse.pageRequest(page, size, Sort.by(Sort.Order.desc("startDate"))))
                .map(ExperienceDtos::toResponse));
    }

    @Transactional
    public Response create(Request r) {
        Experience e = new Experience();
        apply(e, r);
        return ExperienceDtos.toResponse(repository.save(e));
    }

    @Transactional
    public Response update(Long id, Request r) {
        Experience e = repository.findById(id).orElseThrow(() -> new NotFoundException("Experience entry not found."));
        apply(e, r);
        return ExperienceDtos.toResponse(repository.save(e));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Experience entry not found.");
        }
        repository.deleteById(id);
    }

    private void apply(Experience e, Request r) {
        if (r.startDate() != null && r.endDate() != null && r.endDate().isBefore(r.startDate())) {
            throw new BadRequestException("End date cannot be before the start date.");
        }
        e.setCompany(r.company().trim());
        e.setJobTitle(r.jobTitle().trim());
        e.setType(r.type());
        e.setLocation(Text.blankToNull(r.location()));
        e.setStartDate(r.startDate());
        e.setEndDate(r.endDate());
        e.setDescription(Text.blankToNull(r.description()));
        e.getAchievements().clear();
        e.getAchievements().addAll(Text.cleanList(r.achievements()));
        e.setSample(r.sample());
    }
}
