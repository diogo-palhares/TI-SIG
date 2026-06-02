package com.tias.back.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tias.back.dto.PatientRequestDTO;
import com.tias.back.dto.PatientResponseDTO;
import com.tias.back.service.PatientService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PatientController.class)
class PatientControllerTest {

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper objectMapper;
    @MockitoBean
    PatientService patientService;

    private PatientResponseDTO response(UUID id) {
        return PatientResponseDTO.builder()
            .patientId(id).name("Maria Silva").cpf("12345678901").rg("1234567")
            .birthdate(LocalDate.of(1940, 1, 30)).bloodType("A+").plano("Plano Ouro")
            .carteirinha("112233").isActive(true).addedAt(LocalDate.now()).build();
    }

    private PatientRequestDTO request() {
        return PatientRequestDTO.builder()
            .name("Maria Silva").cpf("12345678901").rg("1234567")
            .birthdate(LocalDate.of(1940, 1, 30)).bloodType("A+").plano("Plano Ouro")
            .carteirinha("112233").contactName("Jose").contactEmail("jose@email.com")
            .contactPhone("11912345678").contactRelation("Filho").build();
    }

    @Test
    void create_returns201() throws Exception {
        UUID id = UUID.randomUUID();
        when(patientService.create(any())).thenReturn(response(id));
        mockMvc.perform(post("/api/patients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request())))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.patientId").value(id.toString()))
            .andExpect(jsonPath("$.name").value("Maria Silva"));
    }

    @Test
    void getById_returns200() throws Exception {
        UUID id = UUID.randomUUID();
        when(patientService.getById(id)).thenReturn(response(id));
        mockMvc.perform(get("/api/patients/{id}", id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.patientId").value(id.toString()));
    }

    @Test
    void getById_notFound_returns404() throws Exception {
        UUID id = UUID.randomUUID();
        when(patientService.getById(id))
            .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente não encontrado"));
        mockMvc.perform(get("/api/patients/{id}", id))
            .andExpect(status().isNotFound());
    }

    @Test
    void getAll_returns200() throws Exception {
        when(patientService.getAll()).thenReturn(List.of(response(UUID.randomUUID())));
        mockMvc.perform(get("/api/patients"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void create_conflict_returns409() throws Exception {
        when(patientService.create(any()))
            .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "CPF já existe"));
        mockMvc.perform(post("/api/patients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request())))
            .andExpect(status().isConflict());
    }
}
