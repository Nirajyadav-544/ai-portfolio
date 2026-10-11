package com.niraj.portfolio.auth;

import com.niraj.portfolio.user.AppUser;
import com.niraj.portfolio.user.AppUserRepository;
import com.niraj.portfolio.user.Role;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Secure first-admin procedure. There is NO default account. On startup, if no user exists and both
 * ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD are set, one admin is created with a BCrypt hash.
 * Remove those variables afterwards.
 */
@Component
@Slf4j
public class AdminBootstrap implements ApplicationRunner {

    static final int MIN_PASSWORD_LENGTH = 12;

    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final String email;
    private final String password;

    public AdminBootstrap(AppUserRepository users, PasswordEncoder encoder,
                          @Value("${app.bootstrap.admin-email:}") String email,
                          @Value("${app.bootstrap.admin-password:}") String password) {
        this.users = users;
        this.encoder = encoder;
        this.email = email == null ? "" : email.trim().toLowerCase();
        this.password = password == null ? "" : password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (users.count() > 0) {
            if (!email.isEmpty() || !password.isEmpty()) {
                log.info("An admin already exists; ignoring ADMIN_BOOTSTRAP_* values. Remove them from your environment.");
            }
            return;
        }
        if (email.isEmpty() || password.isEmpty()) {
            log.warn("No admin user exists. Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD "
                    + "(min {} characters) and restart once to create the first admin.", MIN_PASSWORD_LENGTH);
            return;
        }
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new IllegalStateException("ADMIN_BOOTSTRAP_EMAIL is not a valid e-mail address.");
        }
        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalStateException(
                    "ADMIN_BOOTSTRAP_PASSWORD must be at least " + MIN_PASSWORD_LENGTH + " characters.");
        }
        AppUser admin = new AppUser();
        admin.setEmail(email);
        admin.setPasswordHash(encoder.encode(password));
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        users.save(admin);
        log.info("Created initial admin account for {}. Remove ADMIN_BOOTSTRAP_* from your environment now.", email);
    }
}
