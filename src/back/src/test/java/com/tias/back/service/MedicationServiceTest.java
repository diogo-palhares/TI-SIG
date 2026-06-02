package com.tias.back.service;

import com.tias.back.dto.MedicationRequestDTO;
import com.tias.back.dto.MedicationResponseDTO;
import com.tias.back.entity.Medication;
import com.tias.back.entity.MedicationStatus;
import com.tias.back.entity.Patient;
import com.tias.back.repository.MedicationRepository;
import com.tias.back.repository.PatientRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MedicationServiceTest {

    @Mock
    MedicationRepository repository;
    @Mock
    PatientRepository patientRepo;
    @InjectMocks
    MedicationService service;

    private final UUID patientId = UUID.randomUUID();

    private MedicationRequestDTO validRequest(long quantity) {
        return MedicationRequestDTO.builder()
            .patientId(patientId)
            .description("Metformina")
            .dosage("2x ao dia")
            .quantity(quantity)
            .expirationDate(LocalDate.of(2030, 12, 31))
            .build();
    }

    private Patient patient() {
        return Patient.builder().patientId(patientId).name("Maria").build();
    }

    private Medication medicationEntity(UUID id, long quantity) {
        return Medication.builder()
            .id(id)
            .patient(patient())
            .description("Metformina")
            .dosage("2x ao dia")
            .quantity(quantity)
            .expirationDate(LocalDate.of(2030, 12, 31))
            .addedAt(LocalDateTime.now())
            .status(MedicationStatus.fromQuantity(quantity))
            .build();
    }

    @Test
    void create_success_setsStatusOk() {
        UUID id = UUID.randomUUID();
        when(patientRepo.findById(patientId)).thenReturn(Optional.of(patient()));
        when(repository.save(any(Medication.class))).thenReturn(medicationEntity(id, 30L));
        MedicationResponseDTO result = service.create(validRequest(30L));
        assertEquals(id, result.getId());
        assertEquals(patientId, result.getPatientId());
        assertEquals(MedicationStatus.OK, result.getStatus());
        verify(repository).save(any(Medication.class));
    }

    @Test
    void create_lowQuantity_setsStatusBaixo() {
        UUID id = UUID.randomUUID();
        when(patientRepo.findById(patientId)).thenReturn(Optional.of(patient()));
        when(repository.save(any(Medication.class))).thenReturn(medicationEntity(id, 10L));
        assertEquals(MedicationStatus.BAIXO, service.create(validRequest(10L)).getStatus());
    }

    @Test
    void create_criticalQuantity_setsStatusCritico() {
        UUID id = UUID.randomUUID();
        when(patientRepo.findById(patientId)).thenReturn(Optional.of(patient()));
        when(repository.save(any(Medication.class))).thenReturn(medicationEntity(id, 3L));
        assertEquals(MedicationStatus.CRITICO, service.create(validRequest(3L)).getStatus());
    }

    @Test
    void create_patientNotFound() {
        when(patientRepo.findById(patientId)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.create(validRequest(10L)));
        assertEquals(404, ex.getStatusCode().value());
        verify(repository, never()).save(any());
    }

    @Test
    void create_missingPatientId_unprocessable() {
        MedicationRequestDTO dto = validRequest(10L);
        dto.setPatientId(null);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.create(dto));
        assertEquals(422, ex.getStatusCode().value());
    }

    @Test
    void create_blankDescription_unprocessable() {
        MedicationRequestDTO dto = validRequest(10L);
        dto.setDescription("  ");
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.create(dto));
        assertEquals(422, ex.getStatusCode().value());
    }

    @Test
    void create_zeroQuantity_unprocessable() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.create(validRequest(0L)));
        assertEquals(422, ex.getStatusCode().value());
    }

    @Test
    void create_nullExpiration_unprocessable() {
        MedicationRequestDTO dto = validRequest(10L);
        dto.setExpirationDate(null);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.create(dto));
        assertEquals(422, ex.getStatusCode().value());
    }

    @Test
    void getById_found() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.of(medicationEntity(id, 30L)));
        assertEquals(id, service.getById(id).getId());
    }

    @Test
    void getById_notFound() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.getById(id));
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void getAll_returnsList() {
        when(repository.findAll()).thenReturn(List.of(medicationEntity(UUID.randomUUID(), 30L)));
        assertEquals(1, service.getAll().size());
    }

    @Test
    void update_success_recalculatesStatus() {
        UUID id = UUID.randomUUID();
        Medication existing = medicationEntity(id, 30L);
        when(repository.findById(id)).thenReturn(Optional.of(existing));
        when(repository.save(any(Medication.class))).thenReturn(existing);
        service.update(id, validRequest(3L));
        assertEquals(MedicationStatus.CRITICO, existing.getStatus());
    }

    @Test
    void update_notFound() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.update(id, validRequest(10L)));
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void delete_success() {
        UUID id = UUID.randomUUID();
        Medication m = medicationEntity(id, 30L);
        when(repository.findById(id)).thenReturn(Optional.of(m));
        service.delete(id);
        verify(repository).delete(m);
    }

    @Test
    void delete_notFound() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.delete(id));
        assertEquals(404, ex.getStatusCode().value());
        verify(repository, never()).delete(any());
    }
}
