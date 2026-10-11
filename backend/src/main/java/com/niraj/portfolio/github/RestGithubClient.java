package com.niraj.portfolio.github;

import com.fasterxml.jackson.databind.JsonNode;
import com.niraj.portfolio.common.Text;
import com.niraj.portfolio.github.GithubDtos.GithubRepo;
import com.niraj.portfolio.github.GithubUnavailableException.Reason;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class RestGithubClient implements GithubClient {

    private final RestClient client;
    private final String token;

    public RestGithubClient(@Value("${app.github.token:}") String token) {
        this.token = token == null ? "" : token.trim();
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(10));
        this.client = RestClient.builder()
                .baseUrl("https://api.github.com")
                .requestFactory(factory)
                .defaultHeader(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
                .defaultHeader(HttpHeaders.USER_AGENT, "niraj-portfolio-api")
                .build();
    }

    @Override
    public List<GithubRepo> fetchPublicRepos(String username) throws GithubUnavailableException {
        try {
            RestClient.RequestHeadersSpec<?> request = client.get()
                    .uri("/users/{u}/repos?per_page=100&sort=updated&type=owner", username);
            if (!token.isEmpty()) {
                request = client.get().uri("/users/{u}/repos?per_page=100&sort=updated&type=owner", username)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
            }
            JsonNode body = request.retrieve().body(JsonNode.class);
            return map(body);
        } catch (HttpClientErrorException ex) {
            int code = ex.getStatusCode().value();
            if (code == 429 || (code == 403 && "0".equals(ex.getResponseHeaders() == null ? null
                    : ex.getResponseHeaders().getFirst("x-ratelimit-remaining")))) {
                throw new GithubUnavailableException(Reason.RATE_LIMITED, "GitHub API rate limit reached.", ex);
            }
            if (code == 404) {
                throw new GithubUnavailableException(Reason.NOT_FOUND, "GitHub user not found.", ex);
            }
            throw new GithubUnavailableException(Reason.ERROR, "GitHub responded with HTTP " + code + ".", ex);
        } catch (RestClientException ex) {
            throw new GithubUnavailableException(Reason.ERROR, "GitHub could not be reached.", ex);
        }
    }

    static List<GithubRepo> map(JsonNode array) {
        List<GithubRepo> repos = new ArrayList<>();
        if (array == null || !array.isArray()) {
            return repos;
        }
        for (JsonNode n : array) {
            if (n.path("fork").asBoolean(false) || n.path("archived").asBoolean(false)) {
                continue;
            }
            List<String> topics = new ArrayList<>();
            for (JsonNode t : n.path("topics")) {
                topics.add(t.asText());
            }
            repos.add(new GithubRepo(
                    n.path("name").asText(),
                    Text.blankToNull(n.path("description").asText(null)),
                    n.path("html_url").asText(),
                    Text.blankToNull(n.path("language").asText(null)),
                    n.has("stargazers_count") ? n.path("stargazers_count").asInt() : null,
                    n.has("forks_count") ? n.path("forks_count").asInt() : null,
                    Text.blankToNull(n.path("pushed_at").asText(null)),
                    topics));
        }
        return repos;
    }
}
