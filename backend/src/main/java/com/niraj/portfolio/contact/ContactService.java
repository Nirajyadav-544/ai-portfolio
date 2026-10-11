package com.niraj.portfolio.contact;

import com.niraj.portfolio.common.PageResponse;
import com.niraj.portfolio.common.Text;
import com.niraj.portfolio.contact.ContactDtos.MessageResponse;
import com.niraj.portfolio.contact.ContactDtos.Request;
import com.niraj.portfolio.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactService {

    private final ContactMessageRepository repository;
    private final ContactNotifier notifier;

    /** @return true when the message was stored; false when the honeypot caught a bot (nothing is stored). */
    @Transactional
    public boolean submit(Request r) {
        if (Text.hasText(r.website())) {
            log.info("Contact honeypot triggered; message discarded.");
            return false;
        }
        ContactMessage m = new ContactMessage();
        m.setName(Text.stripLineBreaks(r.name()));
        m.setEmail(r.email().trim().toLowerCase());
        m.setSubject(Text.stripLineBreaks(r.subject()));
        m.setMessage(r.message().trim());
        m.setStatus(ContactStatus.NEW);
        repository.save(m);
        notifier.notifyNewMessage(m.getName(), m.getEmail(), m.getSubject(), m.getMessage());
        return true;
    }

    @Transactional(readOnly = true)
    public PageResponse<MessageResponse> list(ContactStatus status, int page, int size) {
        Specification<ContactMessage> spec = (root, query, cb) ->
                status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
        Page<ContactMessage> result = repository.findAll(spec,
                PageResponse.pageRequest(page, size, Sort.by(Sort.Order.desc("createdAt"))));
        return PageResponse.of(result.map(ContactDtos::toResponse));
    }

    @Transactional
    public MessageResponse updateStatus(Long id, ContactStatus status) {
        ContactMessage m = repository.findById(id).orElseThrow(() -> new NotFoundException("Message not found."));
        m.setStatus(status);
        return ContactDtos.toResponse(repository.save(m));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Message not found.");
        }
        repository.deleteById(id);
    }
}
