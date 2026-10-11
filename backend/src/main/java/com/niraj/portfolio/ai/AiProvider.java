package com.niraj.portfolio.ai;

import java.util.List;

/**
 * Provider abstraction. To switch vendors, implement this interface as a Spring bean and make it the only
 * active AiProvider (for example with @ConditionalOnProperty or @Primary). Nothing else needs to change.
 */
public interface AiProvider {

    record Message(String role, String content) {
        public static final String USER = "user";
        public static final String ASSISTANT = "assistant";
    }

    record Prompt(String systemInstruction, List<Message> conversation) {
    }

    /** True when credentials are present and the provider can be called. */
    boolean isConfigured();

    String providerName();

    String modelName();

    /**
     * Generates one reply.
     *
     * @throws com.niraj.portfolio.exception.ExternalServiceException with a visitor-safe message on failure
     */
    String generate(Prompt prompt);
}
