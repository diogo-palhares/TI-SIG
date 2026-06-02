package com.tias.back.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medication")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medication {

    @Id
    @GeneratedValue
    private UUID id;

    private String description;

    private Long quantity;

    private LocalDate expirationDate;

    private String dosage;

    private LocalDateTime addedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patientId", referencedColumnName = "patientId", nullable = false)
    private Patient patient;

    @Enumerated(EnumType.STRING)
    private MedicationStatus status;
}
