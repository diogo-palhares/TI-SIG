package com.tias.back.service;

import com.tias.back.dto.PatientRequestDTO;
import com.tias.back.dto.PatientResponseDTO;
import com.tias.back.entity.Patient;
import com.tias.back.repository.MedicationRepository;
import com.tias.back.repository.PatientRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    PatientRepository patientRepo;
    @Mock
    MedicationRepository medicationRepo;
    @InjectMocks
    PatientService service;

    private PatientRequestDTO validRequest() {
        return PatientRequestDTO.builder()
            .name("Maria Silva")
            .cpf("12345678901")
            .rg("1234567")
            .birthdate(LocalDate.of(1940, 1, 30))
            .bloodType("A+")
            .plano("Plano Ouro")
            .carteirinha("112233")
            .conditions("Diabetes")
            .contactName("Jose Silva")
            .contactEmail("jose@email.com")
            .contactPhone("11912345678")
            .contactRelation("Filho")
            .build();
    }

    private Patient patientEntity(UUID id) {
        return Patient.builder()
            .patientId(id)
            .name("Maria Silva")
            .cpf("12345678901")
            .rg("1234567")
            .birthdate(LocalDate.of(1940, 1, 30))
            .bloodType("A+")
            .plano("Plano Ouro")
            .carteirinha("112233")
            .conditions("Diabetes")
            .contactName("Jose Silva")
            .contactEmail("jose@email.com")
            .contactPhone("11912345678")
            .contactRelation("Filho")
            .isActive(true)
            .addedAt(LocalDate.now())
            .build();
    }

    @Test
    void create_success() {
        UUID id = UUID.randomUUID();
        when(patientRepo.existsByCpf("12345678901")).thenReturn(false);
        when(patientRepo.existsByRg("1234567")).thenReturn(false);
        when(patientRepo.existsByCarteirinha("112233")).thenReturn(false);
        when(patientRepo.save(any(Patient.class))).thenReturn(patientEntity(id));

        PatientResponseDTO result = service.create(validRequest());

        assertNotNull(result);
        assertEquals(id, result.getPatientId());
        assertEquals("Maria Silva", result.getName());
        assertTrue(result.isActive());
        verify(patientRepo).save(any(Patient.class));
    }

    @Test
    void create_duplicateCpf_conflict() {
        when(patientRepo.existsByCpf("12345678901")).thenReturn(true);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.create(validRequest()));
        assertEquals(409, ex.getStatusCode().value());
        verify(patientRepo, never()).save(any());
    }

    @Test
    void create_duplicateRg_conflict() {
        when(patientRepo.existsByCpf(anyString())).thenReturn(false);
        when(patientRepo.existsByRg("1234567")).thenReturn(true);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.create(validRequest()));
        assertEquals(409, ex.getStatusCode().value());
    }

    @Test
    void create_duplicateCarteirinha_conflict() {
        when(patientRepo.existsByCpf(anyString())).thenReturn(false);
        when(patientRepo.existsByRg(anyString())).thenReturn(false);
        when(patientRepo.existsByCarteirinha("112233")).thenReturn(true);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.create(validRequest()));
        assertEquals(409, ex.getStatusCode().value());
    }

    @Test
    void create_invalidName_unprocessable() {
        PatientRequestDTO dto = validRequest();
        dto.setName("Maria123");
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.create(dto));
        assertEquals(422, ex.getStatusCode().value());
    }

    @Test
    void create_invalidCpf_unprocessable() {
        PatientRequestDTO dto = validRequest();
        dto.setCpf("123");
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.create(dto));
        assertEquals(422, ex.getStatusCode().value());
    }

    @Test
    void create_futureBirthdate_unprocessable() {
        PatientRequestDTO dto = validRequest();
        dto.setBirthdate(LocalDate.now().plusDays(1));
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.create(dto));
        assertEquals(422, ex.getStatusCode().value());
    }

    @Test
    void create_invalidBloodType_unprocessable() {
        PatientRequestDTO dto = validRequest();
        dto.setBloodType("XYZ");
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.create(dto));
        assertEquals(422, ex.getStatusCode().value());
    }

    @Test
    void getById_found() {
        UUID id = UUID.randomUUID();
        when(patientRepo.findById(id)).thenReturn(Optional.of(patientEntity(id)));
        assertEquals(id, service.getById(id).getPatientId());
    }

    @Test
    void getById_notFound() {
        UUID id = UUID.randomUUID();
        when(patientRepo.findById(id)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.getById(id));
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void getAll_returnsList() {
        when(patientRepo.findAll()).thenReturn(List.of(
            patientEntity(UUID.randomUUID()), patientEntity(UUID.randomUUID())));
        assertEquals(2, service.getAll().size());
    }

    @Test
    void update_success() {
        UUID id = UUID.randomUUID();
        Patient existing = patientEntity(id);
        when(patientRepo.findById(id)).thenReturn(Optional.of(existing));
        when(patientRepo.save(any(Patient.class))).thenReturn(existing);
        PatientRequestDTO dto = validRequest();
        dto.setName("Maria Souza");
        PatientResponseDTO result = service.update(id, dto);
        assertNotNull(result);
        assertEquals("Maria Souza", existing.getName());
        verify(patientRepo).save(existing);
    }

    @Test
    void update_notFound() {
        UUID id = UUID.randomUUID();
        when(patientRepo.findById(id)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.update(id, validRequest()));
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void update_duplicateCpf_conflict() {
        UUID id = UUID.randomUUID();
        Patient existing = patientEntity(id);
        existing.setCpf("99999999999");
        when(patientRepo.findById(id)).thenReturn(Optional.of(existing));
        when(patientRepo.existsByCpf("12345678901")).thenReturn(true);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.update(id, validRequest()));
        assertEquals(409, ex.getStatusCode().value());
    }

    @Test
    void deactivate_success() {
        UUID id = UUID.randomUUID();
        Patient p = patientEntity(id);
        p.setActive(true);
        when(patientRepo.findById(id)).thenReturn(Optional.of(p));
        when(patientRepo.save(any(Patient.class))).thenReturn(p);
        service.deactivate(id);
        assertFalse(p.isActive());
    }

    @Test
    void deactivate_alreadyInactive_badRequest() {
        UUID id = UUID.randomUUID();
        Patient p = patientEntity(id);
        p.setActive(false);
        when(patientRepo.findById(id)).thenReturn(Optional.of(p));
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.deactivate(id));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void activate_success() {
        UUID id = UUID.randomUUID();
        Patient p = patientEntity(id);
        p.setActive(false);
        when(patientRepo.findById(id)).thenReturn(Optional.of(p));
        when(patientRepo.save(any(Patient.class))).thenReturn(p);
        service.activate(id);
        assertTrue(p.isActive());
    }

    @Test
    void activate_alreadyActive_badRequest() {
        UUID id = UUID.randomUUID();
        Patient p = patientEntity(id);
        p.setActive(true);
        when(patientRepo.findById(id)).thenReturn(Optional.of(p));
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.activate(id));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void delete_success_removesMedicationsAndPatient() {
        UUID id = UUID.randomUUID();
        when(patientRepo.findById(id)).thenReturn(Optional.of(patientEntity(id)));
        when(medicationRepo.findByPatient_PatientId(id)).thenReturn(List.of());
        ResponseEntity<String> response = service.delete(id);
        assertEquals(200, response.getStatusCode().value());
        verify(patientRepo).deleteById(id);
    }

    @Test
    void delete_notFound() {
        UUID id = UUID.randomUUID();
        when(patientRepo.findById(id)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.delete(id));
        assertEquals(404, ex.getStatusCode().value());
        verify(patientRepo, never()).deleteById(any());
    }
}
