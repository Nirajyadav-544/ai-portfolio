package com.niraj.portfolio.experience;

import com.niraj.portfolio.common.PageResponse;
import com.niraj.portfolio.experience.ExperienceDtos.Request;
import com.niraj.portfolio.experience.ExperienceDtos.Response;
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
@Tag(name = "Experience")
public class ExperienceController {

    private final ExperienceService service;

    @GetMapping("/experience")
    public List<Response> list() {
        return service.list();
    }

    @GetMapping("/admin/experience")
    @SecurityRequirement(name = "bearerAuth")
    public PageResponse<Response> adminList(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        return service.adminList(page, size);
    }

    @PostMapping("/admin/experience")
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = "bearerAuth")
    public Response create(@Valid @RequestBody Request request) {
        return service.create(request);
    }

    @PutMapping("/admin/experience/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public Response update(@PathVariable Long id, @Valid @RequestBody Request request) {
        return service.update(id, request);
    }

    @DeleteMapping("/admin/experience/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @SecurityRequirement(name = "bearerAuth")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
