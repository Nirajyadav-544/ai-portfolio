package com.niraj.portfolio.exception;

import org.springframework.http.HttpStatus;

/** A downstream provider (AI, GitHub) failed or is not configured. The message is safe to show to visitors. */
public class ExternalServiceException extends RuntimeException {

    private final HttpStatus status;

    public ExternalServiceException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public ExternalServiceException(HttpStatus status, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
