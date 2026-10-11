package com.niraj.portfolio.contact;

import com.niraj.portfolio.common.Text;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/** Optional e-mail notification. Does nothing unless CONTACT_NOTIFY_ENABLED=true and a mail server is configured. */
@Component
@Slf4j
public class ContactNotifier {

    private final ObjectProvider<JavaMailSender> mailSender;
    private final boolean enabled;
    private final String to;
    private final String from;

    public ContactNotifier(ObjectProvider<JavaMailSender> mailSender,
                           @Value("${app.contact.notify-enabled:false}") boolean enabled,
                           @Value("${app.contact.notify-to:}") String to,
                           @Value("${app.contact.notify-from:}") String from) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.to = to;
        this.from = from;
    }

    @Async
    public void notifyNewMessage(String name, String email, String subject, String body) {
        if (!enabled || !Text.hasText(to)) {
            return;
        }
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            log.warn("CONTACT_NOTIFY_ENABLED is true but no mail server is configured (spring.mail.host).");
            return;
        }
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(to.trim());
            if (Text.hasText(from)) {
                mail.setFrom(from.trim());
            }
            mail.setSubject("[Portfolio] " + Text.stripLineBreaks(Text.truncate(subject, 120)));
            mail.setText("From: " + Text.stripLineBreaks(name) + " <" + Text.stripLineBreaks(email) + ">\n\n" + body);
            sender.send(mail);
        } catch (RuntimeException ex) {
            log.warn("Could not send contact notification: {}", ex.toString());
        }
    }
}
