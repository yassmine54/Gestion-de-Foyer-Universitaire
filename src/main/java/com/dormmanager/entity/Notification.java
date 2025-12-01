package com.dormmanager.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Notification {

    public enum Type {
        INFO,
        URGENT,
        MAINTENANCE,
        DEMANDE_VALIDEE,
        RECLAMATION_REPONSE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    private LocalDateTime date = LocalDateTime.now();

    private boolean lu = false;   // ← obligatoire car présent dans la DB

    @Enumerated(EnumType.STRING)
    private Type type;            // ← obligatoire car présent dans la DB

    @ManyToOne(optional = false)
    @JoinColumn(name = "destinataire_id")
    private Utilisateur destinataire;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public boolean isLu() { return lu; }
    public void setLu(boolean lu) { this.lu = lu; }

    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }

    public Utilisateur getDestinataire() { return destinataire; }
    public void setDestinataire(Utilisateur destinataire) {
        this.destinataire = destinataire;
    }
}
