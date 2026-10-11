package com.niraj.portfolio.common;

/** Regexes shared by request DTOs. Only http(s) links or site-relative paths are accepted (no javascript: URLs). */
public final class Patterns {

    private Patterns() {
    }

    /** Empty or an absolute http(s) URL. */
    public static final String HTTP_URL = "^(https?://[^\\s]+)?$";

    /** Empty, an absolute http(s) URL, or a site-relative path such as /resume.pdf. */
    public static final String URL_OR_PATH = "^((https?://|/)[^\\s]*)?$";

    /** Empty or a lowercase slug. */
    public static final String SLUG = "^([a-z0-9]+(-[a-z0-9]+)*)?$";

    public static final String GITHUB_USERNAME = "^([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))?$";
}
