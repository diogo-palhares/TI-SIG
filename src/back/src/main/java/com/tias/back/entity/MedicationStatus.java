package com.tias.back.entity;

public enum MedicationStatus {
    CRITICO,
    BAIXO,
    OK;

    // Limites de estoque usados para classificar a situação do medicamento (RF-008).
    public static final long CRITICAL_THRESHOLD = 5;
    public static final long LOW_THRESHOLD = 15;

    // Baixa automática de estoque (RF-008): define a situação a partir da quantidade disponível.
    public static MedicationStatus fromQuantity(Long quantity) {
        if (quantity == null || quantity <= CRITICAL_THRESHOLD) {
            return CRITICO;
        }
        if (quantity <= LOW_THRESHOLD) {
            return BAIXO;
        }
        return OK;
    }
}
