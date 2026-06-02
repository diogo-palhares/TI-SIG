package com.tias.back.service;

import com.tias.back.dto.UserRequestDTO;
import com.tias.back.dto.UserResponseDTO;
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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    UserRepository userRepo;
    @Mock
    LoginRepository loginRepo;
    @InjectMocks
    UserService service;

    private UserRequestDTO validRequest() {
        return UserRequestDTO.builder()
            .name("diogo")
            .password("12345")
            .cpf("08807332680")
            .email("diogo@teste.com")
            .build();
    }

    private User userEntity(UUID id) {
        return User.builder()
            .userId(id)
            .name("diogo")
            .cpf("08807332680")
            .email("diogo@teste.com")
            .isActive(true)
            .build();
    }

    private Login loginEntity(User user) {
        return Login.builder()
            .loginId(UUID.randomUUID())
            .email(user.getEmail())
            .password("12345")
            .isActive(true)
            .user(user)
            .build();
    }

    @Test
    void create_success_savesUserAndLogin() {
        UUID id = UUID.randomUUID();
        when(userRepo.existsByCpf("08807332680")).thenReturn(false);
        when(userRepo.existsByEmail("diogo@teste.com")).thenReturn(false);
        when(userRepo.save(any(User.class))).thenReturn(userEntity(id));
        when(loginRepo.save(any(Login.class))).thenReturn(loginEntity(userEntity(id)));

        UserResponseDTO result = service.create(validRequest());

        assertEquals(id, result.getUserId());
        assertTrue(result.isActive());
        verify(userRepo).save(any(User.class));
        verify(loginRepo).save(any(Login.class));
    }

    @Test
    void create_duplicateCpf_conflict() {
        when(userRepo.existsByCpf("08807332680")).thenReturn(true);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.create(validRequest()));
        assertEquals(409, ex.getStatusCode().value());
        verify(userRepo, never()).save(any());
    }

    @Test
    void create_duplicateEmail_conflict() {
        when(userRepo.existsByCpf(anyString())).thenReturn(false);
        when(userRepo.existsByEmail("diogo@teste.com")).thenReturn(true);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.create(validRequest()));
        assertEquals(409, ex.getStatusCode().value());
    }

    @Test
    void create_invalidName_unprocessable() {
        UserRequestDTO dto = validRequest();
        dto.setName("diogo123");
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.create(dto));
        assertEquals(422, ex.getStatusCode().value());
    }

    @Test
    void create_invalidCpf_unprocessable() {
        UserRequestDTO dto = validRequest();
        dto.setCpf("123");
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.create(dto));
        assertEquals(422, ex.getStatusCode().value());
    }

    @Test
    void create_invalidEmail_unprocessable() {
        UserRequestDTO dto = validRequest();
        dto.setEmail("not-an-email");
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.create(dto));
        assertEquals(422, ex.getStatusCode().value());
    }

    @Test
    void getById_found() {
        UUID id = UUID.randomUUID();
        when(userRepo.findById(id)).thenReturn(Optional.of(userEntity(id)));
        assertEquals(id, service.getById(id).getUserId());
    }

    @Test
    void getById_notFound() {
        UUID id = UUID.randomUUID();
        when(userRepo.findById(id)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.getById(id));
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void getAll_returnsList() {
        when(userRepo.findAll()).thenReturn(List.of(userEntity(UUID.randomUUID())));
        assertEquals(1, service.getAll().size());
    }

    @Test
    void update_success() {
        UUID id = UUID.randomUUID();
        User existing = userEntity(id);
        Login login = loginEntity(existing);
        when(userRepo.findById(id)).thenReturn(Optional.of(existing));
        when(loginRepo.findByUser(existing)).thenReturn(Optional.of(login));
        when(userRepo.save(any(User.class))).thenReturn(existing);
        when(loginRepo.save(any(Login.class))).thenReturn(login);
        UserRequestDTO dto = validRequest();
        dto.setName("diogo silva");
        service.update(id, dto);
        assertEquals("diogo silva", existing.getName());
    }

    @Test
    void update_userNotFound() {
        UUID id = UUID.randomUUID();
        when(userRepo.findById(id)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.update(id, validRequest()));
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void update_loginNotFound() {
        UUID id = UUID.randomUUID();
        User existing = userEntity(id);
        when(userRepo.findById(id)).thenReturn(Optional.of(existing));
        when(loginRepo.findByUser(existing)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.update(id, validRequest()));
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void update_duplicateCpf_conflict() {
        UUID id = UUID.randomUUID();
        User existing = userEntity(id);
        existing.setCpf("11111111111");
        Login login = loginEntity(existing);
        when(userRepo.findById(id)).thenReturn(Optional.of(existing));
        when(loginRepo.findByUser(existing)).thenReturn(Optional.of(login));
        when(userRepo.existsByCpf("08807332680")).thenReturn(true);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.update(id, validRequest()));
        assertEquals(409, ex.getStatusCode().value());
    }

    @Test
    void deactivate_success() {
        UUID id = UUID.randomUUID();
        User u = userEntity(id);
        u.setActive(true);
        Login login = loginEntity(u);
        when(userRepo.findById(id)).thenReturn(Optional.of(u));
        when(loginRepo.findByUser(u)).thenReturn(Optional.of(login));
        when(userRepo.save(any(User.class))).thenReturn(u);
        service.deactivate(id);
        assertFalse(u.isActive());
        assertFalse(login.getIsActive());
    }

    @Test
    void deactivate_alreadyInactive_badRequest() {
        UUID id = UUID.randomUUID();
        User u = userEntity(id);
        u.setActive(false);
        Login login = loginEntity(u);
        when(userRepo.findById(id)).thenReturn(Optional.of(u));
        when(loginRepo.findByUser(u)).thenReturn(Optional.of(login));
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.deactivate(id));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void activate_success() {
        UUID id = UUID.randomUUID();
        User u = userEntity(id);
        u.setActive(false);
        Login login = loginEntity(u);
        login.setIsActive(false);
        when(userRepo.findById(id)).thenReturn(Optional.of(u));
        when(loginRepo.findByUser(u)).thenReturn(Optional.of(login));
        when(userRepo.save(any(User.class))).thenReturn(u);
        service.activate(id);
        assertTrue(u.isActive());
        assertTrue(login.getIsActive());
    }

    @Test
    void activate_alreadyActive_badRequest() {
        UUID id = UUID.randomUUID();
        User u = userEntity(id);
        u.setActive(true);
        Login login = loginEntity(u);
        when(userRepo.findById(id)).thenReturn(Optional.of(u));
        when(loginRepo.findByUser(u)).thenReturn(Optional.of(login));
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.activate(id));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void delete_success() {
        UUID id = UUID.randomUUID();
        User u = userEntity(id);
        Login login = loginEntity(u);
        when(userRepo.findById(id)).thenReturn(Optional.of(u));
        when(loginRepo.findByUser(u)).thenReturn(Optional.of(login));
        ResponseEntity<String> response = service.delete(id);
        assertEquals(200, response.getStatusCode().value());
        verify(loginRepo).delete(login);
        verify(userRepo).deleteById(id);
    }

    @Test
    void delete_notFound() {
        UUID id = UUID.randomUUID();
        when(userRepo.findById(id)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.delete(id));
        assertEquals(404, ex.getStatusCode().value());
        verify(userRepo, never()).deleteById(any());
    }
}
