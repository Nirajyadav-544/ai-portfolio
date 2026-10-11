package com.niraj.portfolio.education;

import com.niraj.portfolio.common.PageResponse;
import com.niraj.portfolio.common.Text;
import com.niraj.portfolio.education.EducationDtos.Request;
import com.niraj.portfolio.education.EducationDtos.Response;
import com.niraj.portfolio.exception.BadRequestException;
import com.niraj.portfolio.exception.NotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EducationService {

    private final EducationRepository repository;

    @Transactional(readOnly = true)
    public List<Response> list() {
        return repository.findAllByOrderByStartDateDesc().stream().map(EducationDtos::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<Response> adminList(int page, int size) {
        return PageResponse.of(repository.findAll(PageResponse.pageRequest(page, size, Sort.by(Sort.Order.desc("startDate"))))
                .map(EducationDtos::toResponse));
    }

    @Transactional
    public Response create(Request r) {
        Education e = new Education();
        apply(e, r);
        return EducationDtos.toResponse(repository.save(e));
    }

    @Transactional
    public Response update(Long id, Request r) {
        Education e = repository.findById(id).orElseThrow(() -> new NotFoundException("Education entry not found."));
        apply(e, r);
        return EducationDtos.toResponse(repository.save(e));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Education entry not found.");
        }
        repository.deleteById(id);
    }

    private void apply(Education e, Request r) {
        if (r.startDate() != null && r.endDate() != null && r.endDate().isBefore(r.startDate())) {
            throw new BadRequestException("End date cannot be before the start date.");
        }
        e.setInstitution(r.institution().trim());
        e.setDegree(r.degree().trim());
        e.setFieldOfStudy(Text.blankToNull(r.fieldOfStudy()));
        e.setStartDate(r.startDate());
        e.setEndDate(r.endDate());
        e.setDescription(Text.blankToNull(r.description()));
        e.setSample(r.sample());
    }
}
