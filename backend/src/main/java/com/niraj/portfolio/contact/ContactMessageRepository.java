package com.niraj.portfolio.contact;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ContactMessageRepository
        extends JpaRepository<ContactMessage, Long>, JpaSpecificationExecutor<ContactMessage> {

    long countByStatus(ContactStatus status);
}
