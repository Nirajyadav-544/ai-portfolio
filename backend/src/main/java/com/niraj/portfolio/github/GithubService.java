package com.niraj.portfolio.github;

import com.niraj.portfolio.common.Text;
import com.niraj.portfolio.github.GithubDtos.GithubRepo;
import com.niraj.portfolio.github.GithubDtos.GithubResult;
import com.niraj.portfolio.profile.ProfileService;
import com.niraj.portfolio.projects.Project;
import com.niraj.portfolio.projects.ProjectRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Live public repos with an in-memory cache. Falls back to GitHub links saved on projects (no stats invented). */
@Service
public class GithubService {

    private record Cached(String username, List<GithubRepo> repos, Instant at) {
    }

    private final GithubClient client;
    private final ProfileService profiles;
    private final ProjectRepository projects;
    private final String configuredUsername;
    private final Duration ttl;
    private volatile Cached cache;

    public GithubService(GithubClient client, ProfileService profiles, ProjectRepository projects,
                         @Value("${app.github.username:}") String configuredUsername,
                         @Value("${app.github.cache-minutes:30}") long cacheMinutes) {
        this.client = client;
        this.profiles = profiles;
        this.projects = projects;
        this.configuredUsername = configuredUsername;
        this.ttl = Duration.ofMinutes(Math.max(1, cacheMinutes));
    }

    @Transactional
    public GithubResult repos() {
        String username = Text.hasText(configuredUsername) ? configuredUsername.trim()
                : Text.blankToNull(profiles.getOrCreate().getGithubUsername());
        if (username == null) {
            return fallback(null, "NOT_CONFIGURED", "No GitHub username is configured yet.");
        }
        Cached c = cache;
        if (c != null && c.username().equalsIgnoreCase(username) && c.at().plus(ttl).isAfter(Instant.now())) {
            return new GithubResult("OK", "cache", null, username, c.repos());
        }
        try {
            List<GithubRepo> live = client.fetchPublicRepos(username);
            cache = new Cached(username, live, Instant.now());
            return new GithubResult("OK", "live", null, username, live);
        } catch (GithubUnavailableException ex) {
            if (c != null && c.username().equalsIgnoreCase(username)) {
                return new GithubResult("STALE", "cache", "GitHub is unavailable; showing recently cached data.",
                        username, c.repos());
            }
            String status = ex.getReason() == GithubUnavailableException.Reason.RATE_LIMITED
                    ? "RATE_LIMITED" : "UNAVAILABLE";
            return fallback(username, status, ex.getMessage());
        }
    }

    private GithubResult fallback(String username, String status, String message) {
        List<GithubRepo> repos = new ArrayList<>();
        for (Project p : projects.findByGithubUrlIsNotNullOrderByDisplayOrderAsc()) {
            if (p.isSample()) {
                continue;
            }
            repos.add(new GithubRepo(p.getTitle(), p.getSummary(), p.getGithubUrl(), null, null, null, null,
                    List.of()));
        }
        return new GithubResult(status, repos.isEmpty() ? "none" : "projects", message, username, repos);
    }
}
