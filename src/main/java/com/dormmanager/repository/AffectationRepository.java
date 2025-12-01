package com.dormmanager.repository;

import com.dormmanager.entity.Affectation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AffectationRepository extends JpaRepository<Affectation, Long> {

    List<Affectation> findByEtudiantId(Long etudiantId);

    List<Affectation> findByChambreId(Long chambreId);

    // Facultatif si tu veux récupérer les affectations encore ouvertes
    List<Affectation> findByDateFinIsNull();
}
