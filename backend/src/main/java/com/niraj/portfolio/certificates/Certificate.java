package com.niraj.portfolio.certificates;

import com.niraj.portfolio.common.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "certificates")
@Getter
@Setter
@NoArgsConstructor
public class Certificate extends Auditable {

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 160)
    private String issuer;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "credential_id", length = 120)
    private String credentialId;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "pdf_url", length = 500)
    private String pdfUrl;

    @Column(name = "verification_url", length = 500)
    private String verificationUrl;

    /** Only true when the owner has confirmed the credential and supplied an official verification link. */
    @Column(nullable = false)
    private boolean verified;

    @Column(name = "is_sample", nullable = false)
    private boolean sample;
}
