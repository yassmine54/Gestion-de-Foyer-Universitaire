package com.dormmanager.controller;

import com.dormmanager.entity.Etudiant;
import com.dormmanager.entity.Reclamation;
import com.dormmanager.repository.EtudiantRepository;
import com.dormmanager.repository.ReclamationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reclamations")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ReclamationController {

    @Autowired
    private ReclamationRepository reclamationRepository;

    @Autowired
    private EtudiantRepository etudiantRepository;

    // 🔹 1) Récupérer les réclamations d'un étudiant
    @GetMapping("/etudiant/{id}")
    public List<Reclamation> getReclamationsByEtudiant(@PathVariable Long id) {
        return reclamationRepository.findByEtudiantId(id);
    }

    // 🔹 2) Créer une nouvelle réclamation
    @PostMapping("/create/{etudiantId}")
    public Reclamation createReclamation(
            @PathVariable Long etudiantId,
            @RequestBody Reclamation req
    ) {
        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable : " + etudiantId));

        Reclamation r = new Reclamation();
        r.setTitre(req.getTitre());
        r.setMessage(req.getMessage()); // ou message selon ton entité
        r.setDateCreation(LocalDateTime.now());
        r.getDateenvoi(LocalDateTime.now());
        r.setStatut("EN_ATTENTE");
        r.setEtudiant(etudiant);

        return reclamationRepository.save(r);
    }
}
