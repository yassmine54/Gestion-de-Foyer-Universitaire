package com.dormmanager.controller;

import com.dormmanager.controller.AuthController;
import com.dormmanager.entity.Etudiant;
import com.dormmanager.repository.EtudiantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.dormmanager.entity.Utilisateur;

import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/etudiants")
public class EtudiantController {

    private final EtudiantRepository etudiantRepository;

    public EtudiantController(EtudiantRepository etudiantRepository) {
        this.etudiantRepository = etudiantRepository;
    }

    // ================================================
    // 🔥 SECURED REGISTER WITH EMAIL DUPLICATE CHECK
    // ================================================
    @PostMapping("/register")
    public ResponseEntity<?> registerEtudiant(@RequestBody Etudiant etudiant) {

        // 🔍 Vérifier si email existe déjà
        if (etudiantRepository.findByEmail(etudiant.getEmail()).isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email déjà utilisé !");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        // 🔍 Vérifier si le matricule existe déjà
        if (etudiantRepository.findByMatricule(etudiant.getMatricule()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Matricule déjà utilisé !"));
        }
        // Définir le rôle
        etudiant.setRole(Utilisateur.Role.ETUDIANT);

        // Enregistrer
        Etudiant saved = etudiantRepository.save(etudiant);

        // Génération du token
        String token = UUID.randomUUID().toString();
        AuthController.activeTokens.put(token, saved.getEmail());

        // Réponse
        Map<String, Object> response = new HashMap<>();
        response.put("user", saved);
        response.put("token", token);

        return ResponseEntity.ok(response);
    }

    // ================================================
    // CRUD
    // ================================================

    @GetMapping
    public List<Etudiant> getAllEtudiants() {
        return etudiantRepository.findAll();
    }

    @GetMapping("/{id}")
    public Etudiant getEtudiant(@PathVariable Long id) {
        return etudiantRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Etudiant createEtudiant(@RequestBody Etudiant etudiant) {
        return etudiantRepository.save(etudiant);
    }

    @PutMapping("/{id}")
    public Etudiant updateEtudiant(@PathVariable Long id, @RequestBody Etudiant etudiant) {
        Etudiant existing = etudiantRepository.findById(id).orElseThrow();
        existing.setFiliere(etudiant.getFiliere());
        existing.setMatricule(etudiant.getMatricule());
        return etudiantRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void deleteEtudiant(@PathVariable Long id) {
        etudiantRepository.deleteById(id);
    }
}
