package com.tias.back.service;

import com.tias.back.dto.PatientRequestDTO;
import com.tias.back.dto.PatientResponseDTO;
import com.tias.back.entity.Patient;
import com.tias.back.repository.MedicationRepository;
import com.tias.back.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatientService {

    private static final Logger logger = LoggerFactory.getLogger(PatientService.class);
    private final PatientRepository patientRepo;
    private final MedicationRepository medicationRepo;

    public PatientService(PatientRepository patientRepo, MedicationRepository medicationRepo) {
        this.patientRepo = patientRepo;
        this.medicationRepo = medicationRepo;
    }

    private void validateRequest(PatientRequestDTO dto) {
        if (!(dto.getName() != null && dto.getName().matches("^[A-Za-zÀ-ú ]+$"))) {
            logger.warn("Validação falhou: Nome inválido");
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "Nome inválido: deve conter apenas letras e espaços");
        }
        if (!(dto.getCpf() != null && dto.getCpf().matches("\\d{11}"))) {
            logger.warn("Validação falhou: CPF inválido");
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "CPF inválido: deve conter exatamente 11 dígitos numéricos");
        }
        if (!(dto.getRg() != null && dto.getRg().matches("\\d{7,14}"))) {
            logger.warn("Validação falhou: RG inválido");
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "RG inválido: deve conter apenas dígitos (7 a 14 caracteres)");
        }
        if (dto.getBirthdate() == null) {
            logger.warn("Validação falhou: Birthdate obrigatório");
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "Birthdate é obrigatório");
        }
        if (dto.getBirthdate().isAfter(LocalDate.now())) {
            logger.warn("Validação falhou: Birthdate no futuro");
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "Birthdate não pode ser uma data futura");
        }
        if (!(dto.getBloodType() != null && dto.getBloodType().matches("^(A|B|AB|O)[+-]$"))) {
            logger.warn("Validação falhou: bloodType inválido");
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "bloodType inválido: use A+, A-, B+, B-, AB+, AB-, O+ ou O-");
        }
        if (!(dto.getPlano() != null && !dto.getPlano().isBlank())) {
            logger.warn("Validação falhou: Plano vazio");
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "Plano não pode ser vazio");
        }
        if (!(dto.getCarteirinha() != null && !dto.getCarteirinha().isBlank())) {
            logger.warn("Validação falhou: Carteirinha vazia");
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "Carteirinha não pode ser vazia");
        }
    }

    public PatientResponseDTO create(PatientRequestDTO dto) {
        validateRequest(dto);

        if (patientRepo.existsByCpf(dto.getCpf())) {
            logger.warn("Paciente com CPF duplicado: {}", dto.getCpf());
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Paciente com CPF '" + dto.getCpf() + "' já existe.");
        }
        if (patientRepo.existsByRg(dto.getRg())) {
            logger.warn("Paciente com RG duplicado: {}", dto.getRg());
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Paciente com RG '" + dto.getRg() + "' já existe.");
        }
        if (patientRepo.existsByCarteirinha(dto.getCarteirinha())) {
            logger.warn("Paciente com carteirinha duplicada: {}", dto.getCarteirinha());
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Paciente com carteirinha '" + dto.getCarteirinha() + "' já existe.");
        }

        Patient p = Patient.builder()
            .name(dto.getName())
            .cpf(dto.getCpf())
            .rg(dto.getRg())
            .birthdate(dto.getBirthdate())
            .bloodType(dto.getBloodType())
            .plano(dto.getPlano())
            .carteirinha(dto.getCarteirinha())
            .conditions(dto.getConditions())
            .contactName(dto.getContactName())
            .contactEmail(dto.getContactEmail())
            .contactPhone(dto.getContactPhone())
            .contactRelation(dto.getContactRelation())
            .isActive(true)
            .addedAt(LocalDate.now())
            .build();

        Patient saved = patientRepo.save(p);
        logger.info("Paciente criado: {} (addedAt={})",
                    saved.getPatientId(), saved.getAddedAt());
        return toDto(saved);
    }

    public PatientResponseDTO getById(UUID id) {
        Patient p = patientRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Paciente não encontrado: " + id));
        return toDto(p);
    }

    public List<PatientResponseDTO> getAll() {
        return patientRepo.findAll().stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    public PatientResponseDTO update(UUID id, PatientRequestDTO dto) {
        validateRequest(dto);

        Patient p = patientRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Paciente não encontrado: " + id));

        if (!p.getCpf().equals(dto.getCpf()) && patientRepo.existsByCpf(dto.getCpf())) {
            logger.warn("Atualização com CPF duplicado: {}", dto.getCpf());
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "CPF '" + dto.getCpf() + "' já está cadastrado.");
        }
        if (!p.getRg().equals(dto.getRg()) && patientRepo.existsByRg(dto.getRg())) {
            logger.warn("Atualização com RG duplicado: {}", dto.getRg());
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "RG '" + dto.getRg() + "' já está cadastrado.");
        }
        if (!p.getCarteirinha().equals(dto.getCarteirinha())
            && patientRepo.existsByCarteirinha(dto.getCarteirinha())) {
            logger.warn("Atualização com carteirinha duplicada: {}", dto.getCarteirinha());
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Carteirinha '" + dto.getCarteirinha() + "' já está cadastrada.");
        }

        // NÃO altera addedAt
        p.setName(dto.getName());
        p.setCpf(dto.getCpf());
        p.setRg(dto.getRg());
        p.setBirthdate(dto.getBirthdate());
        p.setBloodType(dto.getBloodType());
        p.setPlano(dto.getPlano());
        p.setCarteirinha(dto.getCarteirinha());
        p.setConditions(dto.getConditions());
        p.setContactName(dto.getContactName());
        p.setContactEmail(dto.getContactEmail());
        p.setContactPhone(dto.getContactPhone());
        p.setContactRelation(dto.getContactRelation());

        Patient updated = patientRepo.save(p);
        logger.info("Paciente atualizado: {}", id);
        return toDto(updated);
    }

    public PatientResponseDTO deactivate(UUID id) {
        Patient p = patientRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Paciente não encontrado: " + id));

        if (!p.isActive()) {
            logger.warn("Paciente já inativo: {}", id);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Paciente '" + id + "' já está inativo.");
        }

        p.setActive(false);
        Patient saved = patientRepo.save(p);
        logger.info("Paciente desativado: {}", id);
        return toDto(saved);
    }

    public PatientResponseDTO activate(UUID id) {
        Patient p = patientRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Paciente não encontrado: " + id));

        if (p.isActive()) {
            logger.warn("Paciente já ativo: {}", id);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Paciente '" + id + "' já está ativo.");
        }

        p.setActive(true);
        Patient saved = patientRepo.save(p);
        logger.info("Paciente ativado: {}", id);
        return toDto(saved);
    }

    public ResponseEntity<String> delete(UUID id) {
        Patient patient = patientRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Paciente não encontrado: " + id));
        medicationRepo.findByPatient_PatientId(patient.getPatientId())
            .forEach(medicationRepo::delete);
        patientRepo.deleteById(id);
        logger.info("Paciente deletado: {}", id);
        return ResponseEntity.ok("Paciente deletado com sucesso");
    }

    private PatientResponseDTO toDto(Patient p) {
        return PatientResponseDTO.builder()
            .patientId(p.getPatientId())
            .name(p.getName())
            .cpf(p.getCpf())
            .rg(p.getRg())
            .birthdate(p.getBirthdate())
            .bloodType(p.getBloodType())
            .plano(p.getPlano())
            .carteirinha(p.getCarteirinha())
            .conditions(p.getConditions())
            .contactName(p.getContactName())
            .contactEmail(p.getContactEmail())
            .contactPhone(p.getContactPhone())
            .contactRelation(p.getContactRelation())
            .isActive(p.isActive())
            .addedAt(p.getAddedAt())
            .build();
    }
}
