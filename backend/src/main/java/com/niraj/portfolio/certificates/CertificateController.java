package com.niraj.portfolio.certificates;

import com.niraj.portfolio.certificates.CertificateDtos.Request;
import com.niraj.portfolio.certificates.CertificateDtos.Response;
import com.niraj.portfolio.common.PageResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Certificates")
public class CertificateController {

    private final CertificateService service;

    @GetMapping("/certificates")
    public PageResponse<Response> list(@RequestParam(required = false) String q,
                                       @RequestParam(required = false) String issuer,
                                       @RequestParam(required = false) Boolean verified,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "12") int size) {
        return service.list(q, issuer, verified, page, size);
    }

    @GetMapping("/certificates/issuers")
    public List<String> issuers() {
        return service.issuers();
    }

    @GetMapping("/admin/certificates")
    @SecurityRequirement(name = "bearerAuth")
    public PageResponse<Response> adminList(@RequestParam(required = false) String q,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        return service.list(q, null, null, page, size);
    }

    @PostMapping("/admin/certificates")
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = "bearerAuth")
    public Response create(@Valid @RequestBody Request request) {
        return service.create(request);
    }

    @PutMapping("/admin/certificates/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public Response update(@PathVariable Long id, @Valid @RequestBody Request request) {
        return service.update(id, request);
    }

    @DeleteMapping("/admin/certificates/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @SecurityRequirement(name = "bearerAuth")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
