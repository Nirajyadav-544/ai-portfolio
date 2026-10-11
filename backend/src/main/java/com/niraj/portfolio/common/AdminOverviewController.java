package com.niraj.portfolio.common;

import com.niraj.portfolio.certificates.CertificateRepository;
import com.niraj.portfolio.contact.ContactMessageRepository;
import com.niraj.portfolio.contact.ContactStatus;
import com.niraj.portfolio.education.EducationRepository;
import com.niraj.portfolio.experience.ExperienceRepository;
import com.niraj.portfolio.projects.ProjectRepository;
import com.niraj.portfolio.skills.SkillRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin")
@SecurityRequirement(name = "bearerAuth")
public class AdminOverviewController {

    public record Overview(long projects, long skills, long certificates, long education, long experience,
                           long messages, long unreadMessages) {
    }

    private final ProjectRepository projects;
    private final SkillRepository skills;
    private final CertificateRepository certificates;
    private final EducationRepository education;
    private final ExperienceRepository experience;
    private final ContactMessageRepository messages;

    @GetMapping("/overview")
    public Overview overview() {
        return new Overview(projects.count(), skills.count(), certificates.count(), education.count(),
                experience.count(), messages.count(), messages.countByStatus(ContactStatus.NEW));
    }
}
