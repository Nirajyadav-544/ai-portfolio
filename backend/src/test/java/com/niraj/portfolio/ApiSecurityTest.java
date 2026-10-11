package com.niraj.portfolio;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiSecurityTest {

    @Autowired
    MockMvc mvc;

    @Test
    void publicProfileIsOpen() throws Exception {
        mvc.perform(get("/api/profile")).andExpect(status().isOk()).andExpect(jsonPath("$.fullName").exists());
    }

    @Test
    void adminEndpointsRequireAuthentication() throws Exception {
        mvc.perform(get("/api/admin/messages")).andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/admin/projects/1")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/analytics/summary")).andExpect(status().isUnauthorized());
    }

    @Test
    void adminRoleCanReachAdminEndpoints() throws Exception {
        mvc.perform(get("/api/admin/overview").with(user("a@b.c").roles("ADMIN"))).andExpect(status().isOk());
    }

    @Test
    void unknownRoutesAreDenied() throws Exception {
        mvc.perform(get("/api/unknown")).andExpect(status().isUnauthorized());
    }

    @Test
    void loginWithBadCredentialsIs401() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"x@y.z\",\"password\":\"nope-nope-nope\"}")).andExpect(status().isUnauthorized());
    }

    @Test
    void contactValidationRejectsBadInput() throws Exception {
        mvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"\",\"email\":\"not-an-email\",\"subject\":\"\",\"message\":\"short\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.fieldErrors.email").exists());
    }

    @Test
    void contactAcceptsValidMessage() throws Exception {
        mvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Ada\",\"email\":\"ada@example.com\",\"subject\":\"Hello\",\"message\":\"Hello there, nice portfolio.\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void aiChatReportsUnconfiguredProvider() throws Exception {
        mvc.perform(post("/api/ai/chat").contentType(MediaType.APPLICATION_JSON).content("{\"message\":\"hi\"}"))
                .andExpect(status().isServiceUnavailable());
    }
}
