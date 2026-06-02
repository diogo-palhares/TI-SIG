package com.tias.back.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tias.back.dto.UserRequestDTO;
import com.tias.back.dto.UserResponseDTO;
import com.tias.back.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper objectMapper;
    @MockitoBean
    UserService userService;

    private UserResponseDTO response(UUID id) {
        return UserResponseDTO.builder()
            .userId(id).name("diogo").cpf("08807332680")
            .email("diogo@teste.com").isActive(true).build();
    }

    private UserRequestDTO request() {
        return UserRequestDTO.builder()
            .name("diogo").password("12345").cpf("08807332680")
            .email("diogo@teste.com").build();
    }

    @Test
    void create_returns201() throws Exception {
        UUID id = UUID.randomUUID();
        when(userService.create(any())).thenReturn(response(id));
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request())))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.userId").value(id.toString()))
            .andExpect(jsonPath("$.email").value("diogo@teste.com"));
    }

    @Test
    void getById_notFound_returns404() throws Exception {
        UUID id = UUID.randomUUID();
        when(userService.getById(id))
            .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
        mockMvc.perform(get("/api/users/{id}", id))
            .andExpect(status().isNotFound());
    }

    @Test
    void getAll_returns200() throws Exception {
        when(userService.getAll()).thenReturn(List.of(response(UUID.randomUUID())));
        mockMvc.perform(get("/api/users"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1));
    }
}
