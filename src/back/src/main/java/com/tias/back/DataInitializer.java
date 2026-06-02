package com.tias.back; 

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.tias.back.entity.Login;
import com.tias.back.entity.Medication;
import com.tias.back.entity.MedicationStatus;
import com.tias.back.entity.Patient;
import com.tias.back.entity.User;
import com.tias.back.repository.LoginRepository;
import com.tias.back.repository.MedicationRepository;
import com.tias.back.repository.PatientRepository;
import com.tias.back.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepo;
    private final PatientRepository patientRepo;
    private final LoginRepository loginRepo;
    private final MedicationRepository medicationRepo;

    public DataInitializer(UserRepository userRepository, PatientRepository patientRepository, 
                           LoginRepository loginRepo, MedicationRepository medicationRepo) {
        this.userRepo = userRepository;
        this.patientRepo = patientRepository;
        this.loginRepo = loginRepo;
        this.medicationRepo = medicationRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        // Evitar duplicidade ao reiniciar
        if (userRepo.count() == 0) {
            User user = User.builder()
                .name("diogo")
                .cpf("08807332680")
                .email("diogo@teste.com")
                .isActive(true)
                .build();

            userRepo.save(user);

            Login login = Login.builder()
                .email(user.getEmail())
                .password("12345")
                .lastLogin(LocalDateTime.now())
                .user(user)
                .isActive(true)
                .build();

            loginRepo.save(login);
        }

        if (patientRepo.count() == 0) {
            Patient patient1 = patientRepo.save(new Patient(null, "Maria Silva", "12345678901", "1234567", 
                LocalDate.ofYearDay(1940,30), "A+", "Plano Ouro", "112233", "Diabetes", "José Silva", 
                "jose@email.com", "11912345678", "Filho", true, LocalDate.now()));

            Patient patient2 = patientRepo.save(new Patient(null, "João Santos", "98765432100", "2345678", 
                LocalDate.ofYearDay(1950,30), "O+", "Plano Prata", "445566", "Hipertensão", "Ana Santos", 
                "ana@email.com", "11987654321", "Esposa", true, LocalDate.now()));

            Patient patient3 = patientRepo.save(new Patient(null, "Lúcia Ferreira", "45678912300", "3456789", 
                LocalDate.ofYearDay(1960,30), "B+", "Plano Saúde", "778899", "Asma", "Carlos Ferreira", 
                "carlos@email.com", "11911112222", "Filho",  true, LocalDate.now()));

            Patient patient4 = patientRepo.save(new Patient(null, "Carlos Pereira", "65498732100", "4567890", 
                LocalDate.ofYearDay(1970,30), "AB-", "Plano Bronze", "998877", "Cardiopatia", "Maria Pereira", 
                "maria@email.com", "11922223333", "Irmã", true, LocalDate.now()));

            Patient patient5 = patientRepo.save(new Patient(null, "Ana Oliveira", "78912345600", "5678901", 
                LocalDate.ofYearDay(1930,30), "A-", "Plano Básico", "112244", "Alzheimer", "João Oliveira", 
                "joao@email.com", "11933334444", "Filho", true, LocalDate.now()));
            
            // Adicionar medicamentos para cada paciente
            addMedication(patient1, "Metformina", 30L, "2x ao dia", LocalDate.of(2024, 12, 31));
            addMedication(patient2, "Losartana", 60L, "1x ao dia", LocalDate.of(2025, 6, 30));
            addMedication(patient3, "Salbutamol", 10L, "Inalar 3x ao dia", LocalDate.of(2025, 5, 15));
            addMedication(patient4, "Atenolol", 45L, "1x ao dia", LocalDate.of(2025, 3, 20));
            addMedication(patient5, "Rivastigmina", 15L, "2x ao dia", LocalDate.of(2025, 7, 10));
        }
    }

    private void addMedication(Patient patient, String description, Long quantity, String dosage, LocalDate expirationDate) {
        Medication medication = Medication.builder()
            .patient(patient)
            .description(description)
            .quantity(quantity)
            .dosage(dosage)
            .expirationDate(expirationDate)
            .addedAt(LocalDateTime.now())
            .status(MedicationStatus.fromQuantity(quantity))
            .build();

        medicationRepo.save(medication);
    }
}
