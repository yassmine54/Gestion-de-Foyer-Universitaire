package com.dormmanager.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reclamation") // ta table s’appelle "reclamation" et non "reclamations"
public class Reclamation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String statut = "EN_ATTENTE";

    private LocalDateTime dateCreation = LocalDateTime.now();
    @Column(name = "date_envoi")
    private LocalDateTime dateenvoi = LocalDateTime.now();


    @ManyToOne(optional = false)
    @JoinColumn(name = "utilisateur_id")   // CONFIRMÉ PAR TA BASE !!
    private Etudiant etudiant;

    // Getters / setters
    public Long getId() { return id; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public Etudiant getEtudiant() { return etudiant; }
    public void setEtudiant(Etudiant etudiant) { this.etudiant = etudiant; }

    public LocalDateTime getDateenvoi(LocalDateTime now) {
        return dateenvoi;
    }

    public void setDateenvoi(LocalDateTime dateenvoi) {
        this.dateenvoi = dateenvoi;
    }
}
