package com.niraj.portfolio.github;

import com.niraj.portfolio.github.GithubDtos.GithubResult;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/github")
@RequiredArgsConstructor
@Tag(name = "GitHub")
public class GithubController {

    private final GithubService service;

    @GetMapping("/repos")
    public GithubResult repos() {
        return service.repos();
    }
}
