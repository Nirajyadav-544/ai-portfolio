package com.niraj.portfolio.profile;

import com.niraj.portfolio.common.Text;
import com.niraj.portfolio.profile.ProfileDtos.Request;
import com.niraj.portfolio.profile.ProfileDtos.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository repository;

    /** Returns the profile entity, creating a neutral placeholder row on first use. */
    @Transactional
    public Profile getOrCreate() {
        return repository.findFirstByOrderByIdAsc().orElseGet(() -> {
            Profile p = new Profile();
            p.setFullName("Niraj Yadav");
            p.setTitle("Full-Stack Developer");
            p.setHeadline("Placeholder headline. Edit it from the admin dashboard.");
            p.setBio("This is placeholder text. Add your real biography from the admin dashboard.");
            p.setAvailabilityStatus(AvailabilityStatus.OPEN_TO_OFFERS);
            p.setAvailabilityMessage("Open to opportunities");
            return repository.save(p);
        });
    }

    @Transactional
    public Response get() {
        return ProfileDtos.toResponse(getOrCreate());
    }

    @Transactional
    public Response update(Request r) {
        Profile p = getOrCreate();
        p.setFullName(r.fullName().trim());
        p.setTitle(r.title().trim());
        p.setHeadline(Text.blankToNull(r.headline()));
        p.setBio(Text.blankToNull(r.bio()));
        p.setCareerGoals(Text.blankToNull(r.careerGoals()));
        p.setPhilosophy(Text.blankToNull(r.philosophy()));
        p.setInterests(Text.joinLines(r.interests()));
        p.setRoles(Text.joinLines(r.roles()));
        p.setLocation(Text.blankToNull(r.location()));
        p.setAvailabilityStatus(r.availabilityStatus());
        p.setAvailabilityMessage(Text.blankToNull(r.availabilityMessage()));
        p.setEmail(Text.blankToNull(r.email()));
        p.setGithubUsername(Text.blankToNull(r.githubUsername()));
        p.setGithubUrl(Text.blankToNull(r.githubUrl()));
        p.setLinkedinUrl(Text.blankToNull(r.linkedinUrl()));
        p.setTwitterUrl(Text.blankToNull(r.twitterUrl()));
        p.setWebsiteUrl(Text.blankToNull(r.websiteUrl()));
        p.setResumeUrl(Text.blankToNull(r.resumeUrl()));
        p.setAvatarUrl(Text.blankToNull(r.avatarUrl()));
        return ProfileDtos.toResponse(repository.save(p));
    }
}
