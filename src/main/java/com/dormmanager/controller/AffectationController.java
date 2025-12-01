package com.dormmanager.controller;

import com.dormmanager.entity.Affectation;
import com.dormmanager.repository.AffectationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/affectations")

public class AffectationController {

    @Autowired
    private AffectationRepository affectationRepository;

    // ✔ Dashboard étudiant
    @GetMapping("/etudiant/{id}")
    public List<Affectation> getAffectationsByEtudiant(@PathVariable Long id) {
        return affectationRepository.findByEtudiantId(id);
    }

    // ✔ Gestionnaire : affecter une chambre
    @PostMapping("/assign")
    public Affectation assignChambre(@RequestBody Affectation affectation) {
        return affectationRepository.save(affectation);
    }

    // ✔ Gestionnaire : lister toutes les affectations d’une chambre
    @GetMapping("/chambre/{id}")
    public List<Affectation> getByChambre(@PathVariable Long id) {
        return affectationRepository.findByChambreId(id);
    }
}
