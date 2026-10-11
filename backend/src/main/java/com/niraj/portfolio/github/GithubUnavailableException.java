package com.niraj.portfolio.github;

public class GithubUnavailableException extends Exception {

    public enum Reason { RATE_LIMITED, NOT_FOUND, ERROR }

    private final Reason reason;

    public GithubUnavailableException(Reason reason, String message) {
        super(message);
        this.reason = reason;
    }

    public GithubUnavailableException(Reason reason, String message, Throwable cause) {
        super(message, cause);
        this.reason = reason;
    }

    public Reason getReason() {
        return reason;
    }
}
