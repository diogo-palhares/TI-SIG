package com.tias.back.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MedicationStatusTest {

    @Test
    void fromQuantity_null_returnsCritico() {
        assertEquals(MedicationStatus.CRITICO, MedicationStatus.fromQuantity(null));
    }

    @Test
    void fromQuantity_atOrBelowCriticalThreshold_returnsCritico() {
        assertEquals(MedicationStatus.CRITICO, MedicationStatus.fromQuantity(0L));
        assertEquals(MedicationStatus.CRITICO, MedicationStatus.fromQuantity(5L));
    }

    @Test
    void fromQuantity_betweenThresholds_returnsBaixo() {
        assertEquals(MedicationStatus.BAIXO, MedicationStatus.fromQuantity(6L));
        assertEquals(MedicationStatus.BAIXO, MedicationStatus.fromQuantity(15L));
    }

    @Test
    void fromQuantity_aboveLowThreshold_returnsOk() {
        assertEquals(MedicationStatus.OK, MedicationStatus.fromQuantity(16L));
        assertEquals(MedicationStatus.OK, MedicationStatus.fromQuantity(100L));
    }
}
