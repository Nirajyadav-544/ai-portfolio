package com.niraj.portfolio.github;

import com.niraj.portfolio.github.GithubDtos.GithubRepo;
import java.util.List;

/** Boundary to the GitHub REST API (kept as an interface so the service is easy to test). */
public interface GithubClient {

    List<GithubRepo> fetchPublicRepos(String username) throws GithubUnavailableException;
}
