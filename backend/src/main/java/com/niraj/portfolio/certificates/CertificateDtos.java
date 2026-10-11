package com.niraj.portfolio.certificates;

import com.niraj.portfolio.common.Patterns;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public final class CertificateDtos {

    private CertificateDtos() {
    }

    public record Request(
            @NotBlank @Size(max = 200) String title,
            @NotBlank @Size(max = 160) String issuer,
            LocalDate issueDate,
            LocalDate expiryDate,
            @Size(max = 120) String credentialId,
            @Size(max = 500) @Pattern(regexp = Patterns.URL_OR_PATH, message = "must be an http(s) URL or a /path") String imageUrl,
            @Size(max = 500) @Pattern(regexp = Patterns.URL_OR_PATH, message = "must be an http(s) URL or a /path") String pdfUrl,
            @Size(max = 500) @Pattern(regexp = Patterns.HTTP_URL, message = "must be an http(s) URL") String verificationUrl,
            boolean verified,
            boolean sample) {
    }

    public record Response(Long id, String title, String issuer, LocalDate issueDate, LocalDate expiryDate,
                           boolean expired, String credentialId, String imageUrl, String pdfUrl,
                           String verificationUrl, boolean verified, boolean sample) {
    }

    public static Response toResponse(Certificate c) {
        boolean expired = c.getExpiryDate() != null && c.getExpiryDate().isBefore(LocalDate.now());
        return new Response(c.getId(), c.getTitle(), c.getIssuer(), c.getIssueDate(), c.getExpiryDate(), expired,
                c.getCredentialId(), c.getImageUrl(), c.getPdfUrl(), c.getVerificationUrl(), c.isVerified(),
                c.isSample());
    }
}
