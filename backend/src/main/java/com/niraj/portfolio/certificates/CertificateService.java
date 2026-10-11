package com.niraj.portfolio.certificates;

import com.niraj.portfolio.certificates.CertificateDtos.Request;
import com.niraj.portfolio.certificates.CertificateDtos.Response;
import com.niraj.portfolio.common.PageResponse;
import com.niraj.portfolio.common.Text;
import com.niraj.portfolio.exception.BadRequestException;
import com.niraj.portfolio.exception.NotFoundException;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private static final Sort SORT = Sort.by(Sort.Order.desc("issueDate"), Sort.Order.asc("title"));

    private final CertificateRepository repository;

    @Transactional(readOnly = true)
    public PageResponse<Response> list(String q, String issuer, Boolean verified, int page, int size) {
        PageRequest pageable = PageResponse.pageRequest(page, size, SORT);
        return PageResponse.of(repository.findAll(spec(q, issuer, verified), pageable).map(CertificateDtos::toResponse));
    }

    @Transactional(readOnly = true)
    public List<String> issuers() {
        return repository.findIssuers();
    }

    @Transactional
    public Response create(Request r) {
        Certificate c = new Certificate();
        apply(c, r);
        return CertificateDtos.toResponse(repository.save(c));
    }

    @Transactional
    public Response update(Long id, Request r) {
        Certificate c = repository.findById(id).orElseThrow(() -> new NotFoundException("Certificate not found."));
        apply(c, r);
        return CertificateDtos.toResponse(repository.save(c));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Certificate not found.");
        }
        repository.deleteById(id);
    }

    private void apply(Certificate c, Request r) {
        if (r.issueDate() != null && r.expiryDate() != null && r.expiryDate().isBefore(r.issueDate())) {
            throw new BadRequestException("Expiry date cannot be before the issue date.");
        }
        if (r.verified() && !Text.hasText(r.verificationUrl())) {
            throw new BadRequestException("A certificate can only be marked verified when an official verification URL is provided.");
        }
        if (r.verified() && r.sample()) {
            throw new BadRequestException("A sample entry cannot be marked verified.");
        }
        c.setTitle(r.title().trim());
        c.setIssuer(r.issuer().trim());
        c.setIssueDate(r.issueDate());
        c.setExpiryDate(r.expiryDate());
        c.setCredentialId(Text.blankToNull(r.credentialId()));
        c.setImageUrl(Text.blankToNull(r.imageUrl()));
        c.setPdfUrl(Text.blankToNull(r.pdfUrl()));
        c.setVerificationUrl(Text.blankToNull(r.verificationUrl()));
        c.setVerified(r.verified());
        c.setSample(r.sample());
    }

    static Specification<Certificate> spec(String q, String issuer, Boolean verified) {
        return (root, query, cb) -> {
            List<Predicate> ps = new ArrayList<>();
            if (Text.hasText(q)) {
                String like = Text.likePattern(q);
                ps.add(cb.or(cb.like(cb.lower(root.get("title")), like, '\\'),
                        cb.like(cb.lower(root.get("issuer")), like, '\\')));
            }
            if (Text.hasText(issuer)) {
                ps.add(cb.equal(cb.lower(root.get("issuer")), issuer.trim().toLowerCase()));
            }
            if (verified != null) {
                ps.add(cb.equal(root.get("verified"), verified));
            }
            return cb.and(ps.toArray(new Predicate[0]));
        };
    }
}
