package com.niraj.portfolio.profile;

import com.niraj.portfolio.profile.ProfileDtos.Request;
import com.niraj.portfolio.profile.ProfileDtos.Response;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Profile")
public class ProfileController {

    private final ProfileService service;

    @GetMapping("/profile")
    public Response get() {
        return service.get();
    }

    @PutMapping("/admin/profile")
    @SecurityRequirement(name = "bearerAuth")
    public Response update(@Valid @RequestBody Request request) {
        return service.update(request);
    }
}
