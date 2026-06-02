package com.tias.back.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tias.back.dto.LoginRequestDTO;
import com.tias.back.service.LoginService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LoginController.class)
class LoginControllerTest {

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper objectMapper;
    @MockitoBean
    LoginService loginService;

    private LoginRequestDTO request(String password) {
        return LoginRequestDTO.builder().email("diogo@teste.com").password(password).build();
    }

    @Test
    void authenticate_success_returns200() throws Exception {
        when(loginService.authenticate(any())).thenReturn(ResponseEntity.ok("Login bem-sucedido"));
        mockMvc.perform(post("/api/logins/authenticate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request("12345"))))
            .andExpect(status().isOk())
            .andExpect(content().string("Login bem-sucedido"));
    }

    @Test
    void authenticate_wrongPassword_returns401() throws Exception {
        when(loginService.authenticate(any()))
            .thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Senha incorreta"));
        mockMvc.perform(post("/api/logins/authenticate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request("errada"))))
            .andExpect(status().isUnauthorized());
    }
}
