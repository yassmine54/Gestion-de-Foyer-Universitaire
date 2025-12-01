package com.dormmanager.repository;

import com.dormmanager.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByChambreId(Long chambreId);

    List<Incident> findByStatut(String statut);
}
