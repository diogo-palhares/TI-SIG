package com.tias.back.service;

import com.tias.back.dto.MedicationRequestDTO;
import com.tias.back.dto.MedicationResponseDTO;
import com.tias.back.entity.Medication;
import com.tias.back.entity.MedicationStatus;
import com.tias.back.entity.Patient;
import com.tias.back.repository.MedicationRepository;
import com.tias.back.repository.PatientRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class MedicationService {

    private static final Logger logger = LoggerFactory.getLogger(MedicationService.class);
    private final MedicationRepository repository;
    private final PatientRepository patientRepo;

    public MedicationService(MedicationRepository repository, PatientRepository patientRepo) {
        this.repository = repository;
        this.patientRepo = patientRepo;
    }

    private void validateRequest(MedicationRequestDTO dto) {
        if (dto.getPatientId() == null) {
            logger.warn("Validação falhou em MedicationRequestDTO: PatientId obrigatório");
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "PatientId é obrigatório");
        }
        if (dto.getDescription() == null || dto.getDescription().isBlank()) {
            logger.warn("Validação falhou em MedicationRequestDTO: Description vazia");
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "Description não pode ser vazio");
        }
        if (dto.getDosage() == null || dto.getDosage().isBlank()) {
            logger.warn("Validação falhou em MedicationRequestDTO: Dosage vazia");
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "Dosage não pode ser vazio");
        }
        if (dto.getQuantity() == null || dto.getQuantity() <= 0) {
            logger.warn("Validação falhou em MedicationRequestDTO: Quantidade inválida");
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "Quantidade deve ser maior que zero");
        }
        if (dto.getExpirationDate() == null) {
            logger.warn("Validação falhou em MedicationRequestDTO: Validade obrigatória");
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "Validade é obrigatória");
        }
    }

    public MedicationResponseDTO create(MedicationRequestDTO dto) {
        validateRequest(dto);
        Patient patient = patientRepo.findById(dto.getPatientId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Paciente não encontrado: " + dto.getPatientId()));
        Medication m = Medication.builder()
            .patient(patient)
            .description(dto.getDescription())
            .dosage(dto.getDosage())
            .quantity(dto.getQuantity())
            .expirationDate(dto.getExpirationDate())
            .addedAt(LocalDateTime.now())
            .status(MedicationStatus.fromQuantity(dto.getQuantity()))
            .build();
        Medication saved = repository.save(m);
        logger.info("Medication criada: {} (status={})", saved.getId(), saved.getStatus());
        return toDto(saved);
    }

    public MedicationResponseDTO getById(UUID id) {
        Medication m = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Medication não encontrada: " + id));
        return toDto(m);
    }

    public List<MedicationResponseDTO> getAll() {
        return repository.findAll().stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    public MedicationResponseDTO update(UUID id, MedicationRequestDTO dto) {
        validateRequest(dto);
        Medication m = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Medication não encontrada: " + id));
        m.setDescription(dto.getDescription());
        m.setDosage(dto.getDosage());
        m.setQuantity(dto.getQuantity());
        m.setExpirationDate(dto.getExpirationDate());
        m.setStatus(MedicationStatus.fromQuantity(dto.getQuantity()));
        Medication updated = repository.save(m);
        logger.info("Medication atualizada: {} (status={})", id, updated.getStatus());
        return toDto(updated);
    }

    public void delete(UUID id) {
        Medication m = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Medication não encontrada: " + id));
        repository.delete(m);  // Excluir permanentemente o medicamento
        logger.info("Medication deletada: {}", id);
    }

    public MedicationResponseDTO toDto(Medication m) {
        return MedicationResponseDTO.builder()
            .id(m.getId())
            .patientId(m.getPatient().getPatientId())
            .description(m.getDescription())
            .dosage(m.getDosage())
            .quantity(m.getQuantity())
            .expirationDate(m.getExpirationDate())
            .status(m.getStatus())
            .addedAt(m.getAddedAt().toString())
            .build();
    }
}
