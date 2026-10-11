package com.niraj.portfolio.certificates;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface CertificateRepository extends JpaRepository<Certificate, Long>, JpaSpecificationExecutor<Certificate> {

    List<Certificate> findByVerifiedTrueAndSampleFalseOrderByIssueDateDesc();

    @Query("select distinct c.issuer from Certificate c order by c.issuer")
    List<String> findIssuers();
}
