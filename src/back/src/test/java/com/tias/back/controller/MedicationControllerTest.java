package com.tias.back.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tias.back.dto.MedicationRequestDTO;
import com.tias.back.dto.MedicationResponseDTO;
import com.tias.back.entity.MedicationStatus;
import com.tias.back.service.MedicationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MedicationController.class)
class MedicationControllerTest {

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper objectMapper;
    @MockitoBean
    MedicationService medicationService;

    private MedicationResponseDTO response(UUID id, UUID patientId) {
        return MedicationResponseDTO.builder()
            .id(id).patientId(patientId).description("Metformina").dosage("2x ao dia")
            .quantity(30L).expirationDate(LocalDate.of(2030, 12, 31))
            .status(MedicationStatus.OK).addedAt(LocalDateTime.now().toString()).build();
    }

    private MedicationRequestDTO request(UUID patientId) {
        return MedicationRequestDTO.builder()
            .patientId(patientId).description("Metformina").dosage("2x ao dia")
            .quantity(30L).expirationDate(LocalDate.of(2030, 12, 31)).build();
    }

    @Test
    void create_returns201WithStatus() throws Exception {
        UUID id = UUID.randomUUID();
        UUID patientId = UUID.randomUUID();
        when(medicationService.create(any())).thenReturn(response(id, patientId));
        mockMvc.perform(post("/api/medications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request(patientId))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("OK"));
    }

    @Test
    void delete_returns204() throws Exception {
        mockMvc.perform(delete("/api/medications/{id}", UUID.randomUUID()))
            .andExpect(status().isNoContent());
    }

    @Test
    void getById_notFound_returns404() throws Exception {
        UUID id = UUID.randomUUID();
        when(medicationService.getById(id))
            .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Medication não encontrada"));
        mockMvc.perform(get("/api/medications/{id}", id))
            .andExpect(status().isNotFound());
    }
}
