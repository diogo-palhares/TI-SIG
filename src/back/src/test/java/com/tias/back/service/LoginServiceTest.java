package com.tias.back.service;

import com.tias.back.dto.LoginRequestDTO;
import com.tias.back.dto.LoginResponseDTO;
import com.tias.back.entity.Login;
import com.tias.back.entity.User;
import com.tias.back.repository.LoginRepository;
import com.tias.back.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoginServiceTest {

    @Mock
    LoginRepository repository;
    @Mock
    UserRepository userRepo;
    @InjectMocks
    LoginService service;

    private User user(UUID id) {
        return User.builder().userId(id).name("diogo").cpf("08807332680")
            .email("diogo@teste.com").isActive(true).build();
    }

    private Login login(UUID id, User user, boolean active, String password) {
        return Login.builder()
            .loginId(id)
            .email(user.getEmail())
            .password(password)
            .isActive(active)
            .user(user)
            .build();
    }

    private LoginRequestDTO request(String email, String password) {
        return LoginRequestDTO.builder().email(email).password(password).build();
    }

    @Test
    void authenticate_success() {
        User u = user(UUID.randomUUID());
        when(repository.findByEmail("diogo@teste.com"))
            .thenReturn(Optional.of(login(UUID.randomUUID(), u, true, "12345")));
        ResponseEntity<String> response = service.authenticate(request("diogo@teste.com", "12345"));
        assertEquals(200, response.getStatusCode().value());
        assertEquals("Login bem-sucedido", response.getBody());
    }

    @Test
    void authenticate_emailNotFound() {
        when(repository.findByEmail("x@x.com")).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.authenticate(request("x@x.com", "12345")));
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void authenticate_inactiveLogin_forbidden() {
        User u = user(UUID.randomUUID());
        when(repository.findByEmail("diogo@teste.com"))
            .thenReturn(Optional.of(login(UUID.randomUUID(), u, false, "12345")));
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.authenticate(request("diogo@teste.com", "12345")));
        assertEquals(403, ex.getStatusCode().value());
    }

    @Test
    void authenticate_wrongPassword_unauthorized() {
        User u = user(UUID.randomUUID());
        when(repository.findByEmail("diogo@teste.com"))
            .thenReturn(Optional.of(login(UUID.randomUUID(), u, true, "12345")));
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.authenticate(request("diogo@teste.com", "senhaErrada")));
        assertEquals(401, ex.getStatusCode().value());
    }

    @Test
    void authenticate_blankEmail_unprocessable() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.authenticate(request("", "12345")));
        assertEquals(422, ex.getStatusCode().value());
    }

    @Test
    void authenticate_blankPassword_unprocessable() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.authenticate(request("diogo@teste.com", "")));
        assertEquals(422, ex.getStatusCode().value());
    }

    @Test
    void getById_found() {
        UUID id = UUID.randomUUID();
        User u = user(UUID.randomUUID());
        when(repository.findById(id)).thenReturn(Optional.of(login(id, u, true, "12345")));
        LoginResponseDTO result = service.getById(id);
        assertEquals(id, result.getLoginId());
        assertEquals(u.getUserId(), result.getUserId());
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
        User u = user(UUID.randomUUID());
        when(repository.findAll()).thenReturn(List.of(login(UUID.randomUUID(), u, true, "12345")));
        assertEquals(1, service.getAll().size());
    }

    @Test
    void update_success() {
        UUID id = UUID.randomUUID();
        User u = user(UUID.randomUUID());
        Login existing = login(id, u, true, "12345");
        when(repository.findById(id)).thenReturn(Optional.of(existing));
        when(userRepo.findByEmail("diogo@teste.com")).thenReturn(Optional.of(u));
        when(repository.save(any(Login.class))).thenReturn(existing);
        service.update(id, request("diogo@teste.com", "novaSenha"));
        assertEquals("novaSenha", existing.getPassword());
    }

    @Test
    void update_loginNotFound() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.update(id, request("diogo@teste.com", "novaSenha")));
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void update_emailNotFound() {
        UUID id = UUID.randomUUID();
        User u = user(UUID.randomUUID());
        Login existing = login(id, u, true, "12345");
        when(repository.findById(id)).thenReturn(Optional.of(existing));
        when(userRepo.findByEmail("diogo@teste.com")).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.update(id, request("diogo@teste.com", "novaSenha")));
        assertEquals(404, ex.getStatusCode().value());
    }
}
