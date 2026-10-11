
package com.niraj.portfolio.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.niraj.portfolio.exception.ExternalServiceException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@Slf4j
public class GeminiProvider implements AiProvider {

    private static final int MAX_ATTEMPTS = 3;
    private static final long INITIAL_RETRY_DELAY_MS = 1000;

    private final RestClient client;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;
    private final int maxOutputTokens;

    public GeminiProvider(
            @Value("${app.ai.api-key:}") String apiKey,
            @Value("${app.ai.model:gemini-2.5-flash}") String model,
            @Value("${app.ai.base-url:https://generativelanguage.googleapis.com/v1beta}") String baseUrl,
            @Value("${app.ai.timeout-seconds:20}") long timeoutSeconds,
            @Value("${app.ai.max-output-tokens:600}") int maxOutputTokens,
            ObjectMapper objectMapper) {

        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = model;
        this.maxOutputTokens = maxOutputTokens;
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory factory =
                new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(
                Duration.ofSeconds(Math.max(1, timeoutSeconds)));

        this.client = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }

    @Override
    public boolean isConfigured() {
        return !apiKey.isEmpty();
    }

    @Override
    public String providerName() {
        return "gemini";
    }

    @Override
    public String modelName() {
        return model;
    }

    @Override
    public String generate(Prompt prompt) {
        if (!isConfigured()) {
            throw new ExternalServiceException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "The AI assistant is not configured yet.");
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("systemInstruction", Map.of(
                "parts", List.of(
                        Map.of("text", prompt.systemInstruction()))));

        List<Map<String, Object>> contents = new ArrayList<>();

        for (Message message : prompt.conversation()) {
            String role = Message.ASSISTANT.equals(message.role())
                    ? "model" : "user";

            contents.add(Map.of(
                    "role", role,
                    "parts", List.of(
                            Map.of("text", message.content()))));
        }

        body.put("contents", contents);
        body.put("generationConfig", Map.of(
                "temperature", 0.3,
                "maxOutputTokens", maxOutputTokens));

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                // Read as String first so the response does not depend
                // on Google's Content-Type being application/json.
                String rawResponse = client.post()
                        .uri("/models/{model}:generateContent", model)
                        .header("x-goog-api-key", apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .body(String.class);

                JsonNode response = rawResponse == null
                        ? null : objectMapper.readTree(rawResponse);

                String answer = extractText(response);

                if (answer.isBlank()) {
                    log.warn("Gemini returned an empty answer");
                    throw new ExternalServiceException(
                            HttpStatus.BAD_GATEWAY,
                            "The AI assistant returned an empty answer. Please try again.");
                }

                return answer;

            } catch (HttpStatusCodeException ex) {
                int status = ex.getStatusCode().value();

                // Do not log the response body or API key.
                log.warn("Gemini returned HTTP {} (attempt {}/{})",
                        status, attempt, MAX_ATTEMPTS);

                if (isRetryableStatus(status) && attempt < MAX_ATTEMPTS) {
                    waitBeforeRetry(attempt);
                    continue;
                }

                if (status == 429 || status == 503 || status == 500
                        || status == 502 || status == 504) {
                    throw new ExternalServiceException(
                            HttpStatus.SERVICE_UNAVAILABLE,
                            "The AI assistant is temporarily busy. Please try again in a moment.",
                            ex);
                }

                throw new ExternalServiceException(
                        HttpStatus.BAD_GATEWAY,
                        "The AI assistant could not answer right now. Please try again.",
                        ex);

            } catch (ResourceAccessException ex) {
                log.warn("Gemini connection/timeout error (attempt {}/{})",
                        attempt, MAX_ATTEMPTS);

                if (attempt < MAX_ATTEMPTS) {
                    waitBeforeRetry(attempt);
                    continue;
                }

                throw new ExternalServiceException(
                        HttpStatus.GATEWAY_TIMEOUT,
                        "The AI assistant took too long to respond. Please try again.",
                        ex);

            } catch (JsonProcessingException ex) {
                log.warn("Gemini returned an unreadable response");
                throw new ExternalServiceException(
                        HttpStatus.BAD_GATEWAY,
                        "The AI assistant returned an invalid response. Please try again.",
                        ex);

            } catch (RestClientException ex) {
                log.warn("Gemini request failed: {}",
                        ex.getClass().getSimpleName());

                throw new ExternalServiceException(
                        HttpStatus.BAD_GATEWAY,
                        "The AI assistant could not answer right now. Please try again.",
                        ex);
            }
        }

        throw new ExternalServiceException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "The AI assistant is temporarily busy. Please try again.");
    }

    private static boolean isRetryableStatus(int status) {
        return status == 429
                || status == 500
                || status == 502
                || status == 503
                || status == 504;
    }

    private static void waitBeforeRetry(int attempt) {
        long delay = INITIAL_RETRY_DELAY_MS * (1L << (attempt - 1));

        try {
            Thread.sleep(delay);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();

            throw new ExternalServiceException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "The AI request was interrupted. Please try again.",
                    ex);
        }
    }

    static String extractText(JsonNode response) {
        if (response == null) {
            return "";
        }

        StringBuilder result = new StringBuilder();

        for (JsonNode part : response.path("candidates")
                .path(0).path("content").path("parts")) {
            result.append(part.path("text").asText(""));
        }

        return result.toString().trim();
    }
}
