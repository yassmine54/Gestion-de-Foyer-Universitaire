package com.dormmanager.controller;

import com.dormmanager.entity.EtatDesLieux;
import com.dormmanager.repository.EtatDesLieuxRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/etat")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class EtatDesLieuxController {

    @Autowired
    private EtatDesLieuxRepository etatDesLieuxRepository;

    @GetMapping("/affectation/{id}")
    public EtatDesLieux getEtatByAffectation(@PathVariable Long id) {
        return etatDesLieuxRepository.findByAffectationId(id);
    }
}