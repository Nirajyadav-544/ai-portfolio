package com.niraj.portfolio.common;

import com.niraj.portfolio.projects.ProjectDtos.Card;
import com.niraj.portfolio.projects.ProjectService;
import com.niraj.portfolio.skills.SkillDtos;
import com.niraj.portfolio.skills.SkillDtos.Response;
import com.niraj.portfolio.skills.SkillRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Search")
public class SearchController {

    public record SearchResult(List<Card> projects, List<Response> skills) {
    }

    private final ProjectService projectService;
    private final SkillRepository skills;

    @GetMapping("/search")
    public SearchResult search(@RequestParam String q) {
        String term = q == null ? "" : q.trim();
        if (term.length() < 2 || term.length() > 80) {
            return new SearchResult(List.of(), List.of());
        }
        List<Card> p = projectService.list(term, null, null, null, 0, 6).content();
        List<Response> s = skills.findByNameContainingIgnoreCaseOrderByNameAsc(term, PageRequest.of(0, 8))
                .stream().map(SkillDtos::toResponse).toList();
        return new SearchResult(p, s);
    }
}
