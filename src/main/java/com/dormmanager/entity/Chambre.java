package com.dormmanager.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chambres")
public class Chambre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String numero;

    private String batiment; // Exemple : A, B, C...

    @Enumerated(EnumType.STRING)
    private TypeChambre type; // SIMPLE, DOUBLE, TRIPLE

    @Enumerated(EnumType.STRING)
    private EtatChambre etat; // DISPONIBLE, OCCUPEE, MAINTENANCE

    private int capacite = 1;

    @OneToMany(mappedBy = "chambre")
    private List<Affectation> affectations = new ArrayList<>();

    // Getters / Setters
    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getNumero() { return numero; }

    public void setNumero(String numero) { this.numero = numero; }

    public String getBatiment() { return batiment; }

    public void setBatiment(String batiment) { this.batiment = batiment; }

    public TypeChambre getType() { return type; }

    public void setType(TypeChambre type) { this.type = type; }

    public EtatChambre getEtat() { return etat; }

    public void setEtat(EtatChambre etat) { this.etat = etat; }

    public int getCapacite() { return capacite; }

    public void setCapacite(int capacite) { this.capacite = capacite; }

    public List<Affectation> getAffectations() { return affectations; }

    public void setAffectations(List<Affectation> affectations) { this.affectations = affectations; }
}
