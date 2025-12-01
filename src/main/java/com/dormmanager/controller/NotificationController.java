package com.dormmanager.controller;

import com.dormmanager.entity.Notification;
import com.dormmanager.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    // 🔹 Récupérer les notifications d’un étudiant
    @GetMapping("/etudiant/{id}")
    public List<Notification> getNotifications(@PathVariable Long id) {
        return notificationRepository.findByDestinataireIdOrderByDateDesc(id);
    }

    // 🔹 Marquer une notification comme lue
    @PostMapping("/mark-read/{id}")
    public Notification markAsRead(@PathVariable Long id) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification introuvable"));
        notif.setLu(true);
        return notificationRepository.save(notif);
    }

    // 🔹 Marquer toutes comme lues
    @PostMapping("/mark-all-read/{studentId}")
    public String markAllRead(@PathVariable Long studentId) {
        List<Notification> list = notificationRepository.findByDestinataireIdOrderByDateDesc(studentId);
        list.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(list);
        return "OK";
    }
}
