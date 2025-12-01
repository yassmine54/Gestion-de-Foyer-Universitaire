import {
    Bell, CheckCircle, AlertTriangle, Info, MessageSquare,
    Calendar, ArrowLeft, Check
} from "lucide-react";
import { DashboardLayout } from "../layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { useEffect, useState } from "react";
import type { Page } from "../../App";

interface NotificationsPageProps {
    navigate: (page: Page) => void;
    onLogout: () => void;
}

export function NotificationsPage({ navigate, onLogout }: NotificationsPageProps) {
    const [notifications, setNotifications] = useState<any[]>([]);

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = storedUser?.id;

    // 🔹 Charger notifications
    useEffect(() => {
        fetch(`http://localhost:8080/api/notifications/etudiant/${userId}`)
            .then(res => res.json())
            .then(setNotifications)
            .catch(err => console.error("Erreur notifications :", err));
    }, [userId]);

    // 🔹 Marquer une notification comme lue
    const markAsRead = async (notifId: number) => {
        await fetch(`http://localhost:8080/api/notifications/mark-read/${notifId}`, {
            method: "POST"
        });

        setNotifications(notifs =>
            notifs.map(n => (n.id === notifId ? { ...n, lu: true } : n))
        );
    };

    // 🔹 Tout marquer comme lu
    const markAllAsRead = async () => {
        await fetch(`http://localhost:8080/api/notifications/mark-all-read/${userId}`, {
            method: "POST"
        });

        setNotifications(notifs => notifs.map(n => ({ ...n, lu: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "DEMANDE_VALIDEE":
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case "MAINTENANCE":
                return <AlertTriangle className="w-5 h-5 text-orange-600" />;
            case "RECLAMATION_REPONSE":
                return <MessageSquare className="w-5 h-5 text-blue-600" />;
            default:
                return <Info className="w-5 h-5 text-blue-600" />;
        }
    };

    const unread = notifications.filter(n => !n.lu);
    const all = notifications;

    return (
        <DashboardLayout
            userName={`${storedUser.prenom} ${storedUser.nom}`}
            userRole="Étudiant"
            navigate={navigate}
            onLogout={onLogout}
        >
            <div className="max-w-4xl mx-auto">

                {/* Back Button */}
                <Button variant="ghost" className="mb-4"
                        onClick={() => navigate("dashboard-etudiant")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour au dashboard
                </Button>

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl mb-2">Notifications</h1>
                        <p className="text-gray-600">Restez informé de vos mises à jour</p>
                    </div>
                    <Button variant="outline" onClick={markAllAsRead}>
                        <Check className="w-4 h-4 mr-2" /> Tout marquer comme lu
                    </Button>
                </div>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle>Liste des notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="non-lues">
                            <TabsList className="mb-4">
                                <TabsTrigger value="non-lues">
                                    Non lues ({unread.length})
                                </TabsTrigger>
                                <TabsTrigger value="toutes">
                                    Toutes ({all.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="non-lues">
                                {unread.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">Aucune notification non lue</p>
                                ) : (
                                    unread.map(n => (
                                        <div key={n.id}
                                             className="p-4 mb-3 bg-blue-50 rounded-md border-l-4 border-blue-600 flex gap-3"
                                        >
                                            {getIcon(n.type)}
                                            <div className="flex-1">
                                                <p className="font-semibold">{n.message}</p>
                                                <p className="text-xs text-gray-500">{n.date}</p>
                                            </div>
                                            <Button size="sm" variant="ghost" onClick={() => markAsRead(n.id)}>
                                                Marquer comme lu
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </TabsContent>

                            <TabsContent value="toutes">
                                {all.map(n => (
                                    <div key={n.id}
                                         className={`p-4 mb-3 rounded-md flex gap-3 ${
                                             n.lu ? "bg-gray-100" : "bg-blue-50 border-l-4 border-blue-600"
                                         }`}
                                    >
                                        {getIcon(n.type)}
                                        <div className="flex-1">
                                            <p className={n.lu ? "text-gray-600" : ""}>{n.message}</p>
                                            <p className="text-xs text-gray-500">{n.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

            </div>
        </DashboardLayout>
    );
}
