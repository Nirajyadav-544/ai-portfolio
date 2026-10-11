package com.niraj.portfolio.github;

import java.util.List;

public final class GithubDtos {

    private GithubDtos() {
    }

    /** stars/forks are null when unknown (manual fallback data). They are never invented. */
    public record GithubRepo(String name, String description, String url, String language, Integer stars,
                             Integer forks, String updatedAt, List<String> topics) {
    }

    /**
     * status: OK | STALE | RATE_LIMITED | UNAVAILABLE | NOT_CONFIGURED
     * source: live | cache | projects | none
     */
    public record GithubResult(String status, String source, String message, String username,
                               List<GithubRepo> repos) {
    }
}
