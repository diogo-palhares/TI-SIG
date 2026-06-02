package com.tias.back.service;

import com.tias.back.dto.UserRequestDTO;
import com.tias.back.dto.UserResponseDTO;
import com.tias.back.entity.Login;
import com.tias.back.entity.User;
import com.tias.back.repository.LoginRepository;
import com.tias.back.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepo;
    private final LoginRepository loginRepo;

    public UserService(UserRepository userRepo, LoginRepository loginRepo) {
        this.userRepo = userRepo;
        this.loginRepo = loginRepo;
    }

    private void validateRequest(UserRequestDTO dto) {
        if (!(dto.getName() != null && dto.getName().matches("^[A-Za-zÀ-ú ]+$"))) {
            logger.warn("Validação falhou em UserRequestDTO: Nome inválido: deve conter apenas letras e espaços");
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "Nome inválido: deve conter apenas letras e espaços");
        }
        if (!(dto.getCpf() != null && dto.getCpf().matches("\\d{11}"))) {
            logger.warn("Validação falhou em UserRequestDTO: CPF inválido: deve conter exatamente 11 dígitos numéricos");
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "CPF inválido: deve conter exatamente 11 dígitos numéricos");
        }
        if (!(dto.getEmail() != null && dto.getEmail().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$"))) {
            logger.warn("Validação falhou em UserRequestDTO: Email inválido");
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "Email inválido");
        }
    }

    public UserResponseDTO create(UserRequestDTO dto) {
        validateRequest(dto);
        if (userRepo.existsByCpf(dto.getCpf())) {
            logger.warn("CPF duplicado: {}", dto.getCpf());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado: " + dto.getCpf());
        }
        if (userRepo.existsByEmail(dto.getEmail())) {
            logger.warn("Email duplicado: {}", dto.getEmail());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado: " + dto.getEmail());
        }

        User entity = User.builder()
            .name(dto.getName())
            .cpf(dto.getCpf())
            .email(dto.getEmail())
            .isActive(true)
            .build();

        User saved = userRepo.save(entity);

        Login login = Login.builder()
                .email(saved.getEmail())
                .password(dto.getPassword())
                .lastLogin(LocalDateTime.now())
                .user(saved)
                .isActive(true)
                .build();
                
        loginRepo.save(login);

        logger.info("Usuário criado: {}", saved.getUserId());
        return toResponse(saved);
    }

    public UserResponseDTO getById(UUID id) {
        User u = userRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado: " + id));
        return toResponse(u);
    }

    public List<UserResponseDTO> getAll() {
        return userRepo.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public UserResponseDTO update(UUID id, UserRequestDTO dto) {
        validateRequest(dto);
        User user = userRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado: " + id));
        Login login = loginRepo.findByUser(user)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Login não encontrado: " + id));

        if (!user.getCpf().equals(dto.getCpf()) && userRepo.existsByCpf(dto.getCpf())) {
            logger.warn("Atualização com CPF duplicado: {}", dto.getCpf());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado: " + dto.getCpf());
        }
        if (!user.getEmail().equals(dto.getEmail()) && userRepo.existsByEmail(dto.getEmail())) {
            logger.warn("Atualização com email duplicado: {}", dto.getEmail());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado: " + dto.getEmail());
        }

        user.setName(dto.getName());
        user.setCpf(dto.getCpf());
        user.setEmail(dto.getEmail());
        login.setEmail(dto.getEmail());

        User updated = userRepo.save(user);
        loginRepo.save(login);
        logger.info("Usuário atualizado: {}", id);
        return toResponse(updated);
    }

    public UserResponseDTO deactivate(UUID id) {
        User entity = userRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado: " + id));
        Login login = loginRepo.findByUser(entity)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado: " + id));

        if (!entity.isActive()) {
            logger.warn("Usuário já inativo: {}", id);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuário já está inativo: " + id);
        }

        login.setIsActive(false);
        entity.setActive(false);
        User saved = userRepo.save(entity);
        logger.info("Usuário desativado: {}", id);
        return toResponse(saved);
    }

    public UserResponseDTO activate(UUID id) {
        User entity = userRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado: " + id));
        Login login = loginRepo.findByUser(entity)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado: " + id));

        if (entity.isActive()) {
            logger.warn("Usuário já ativo: {}", id);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuário já está ativo: " + id);
        }

        login.setIsActive(true);
        entity.setActive(true);
        User saved = userRepo.save(entity);
        logger.info("Usuário ativado: {}", id);
        return toResponse(saved);
    }

    public ResponseEntity<String> delete(UUID id) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Usuário não encontrado: " + id));
        loginRepo.findByUser(user).ifPresent(loginRepo::delete);
        userRepo.deleteById(id);
        logger.info("Usuário deletado: {}", id);
        return ResponseEntity.ok("Usuario deletado com sucesso");
    }

    private UserResponseDTO toResponse(User u) {
        return UserResponseDTO.builder()
            .userId(u.getUserId())
            .name(u.getName())
            .cpf(u.getCpf())
            .email(u.getEmail())
            .isActive(u.isActive())
            .build();
    }
}