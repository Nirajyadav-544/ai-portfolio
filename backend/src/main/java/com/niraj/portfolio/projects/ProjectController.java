package com.niraj.portfolio.projects;

import com.niraj.portfolio.common.PageResponse;
import com.niraj.portfolio.projects.ProjectDtos.Card;
import com.niraj.portfolio.projects.ProjectDtos.Detail;
import com.niraj.portfolio.projects.ProjectDtos.DetailResponse;
import com.niraj.portfolio.projects.ProjectDtos.Request;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Projects")
public class ProjectController {

    private final ProjectService service;

    @GetMapping("/projects")
    public PageResponse<Card> list(@RequestParam(required = false) String q,
                                   @RequestParam(required = false) String category,
                                   @RequestParam(required = false) String tech,
                                   @RequestParam(required = false) Boolean featured,
                                   @RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "9") int size) {
        return service.list(q, category, tech, featured, page, size);
    }

    @GetMapping("/projects/categories")
    public List<String> categories() {
        return service.categories();
    }

    @GetMapping("/projects/technologies")
    public List<String> technologies() {
        return service.technologies();
    }

    @GetMapping("/projects/{slug}")
    public DetailResponse get(@PathVariable String slug) {
        return service.getBySlug(slug);
    }

    @GetMapping("/admin/projects")
    @SecurityRequirement(name = "bearerAuth")
    public PageResponse<Detail> adminList(@RequestParam(required = false) String q,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "10") int size) {
        return service.adminList(q, page, size);
    }

    @PostMapping("/admin/projects")
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = "bearerAuth")
    public Detail create(@Valid @RequestBody Request request) {
        return service.create(request);
    }

    @PutMapping("/admin/projects/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public Detail update(@PathVariable Long id, @Valid @RequestBody Request request) {
        return service.update(id, request);
    }

    @DeleteMapping("/admin/projects/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @SecurityRequirement(name = "bearerAuth")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
