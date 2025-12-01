import { useEffect, useState } from 'react';
import { Home, FileText, MessageSquare, Bell, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { Page } from '../../App';

interface DashboardEtudiantProps {
    navigate: (page: Page) => void;
    onLogout: () => void;
    notificationsCount?: number;
}

// Helper pour parser JSON seulement si body existe et res.ok
async function safeJson(res: Response) {
    // si status 204 No Content -> pas de body
    if (res.status === 204) return null;
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (e) {
        // texte non-JSON -> renvoyer raw text
        return text;
    }
}

// Normalisation d'une affectation : l'API peut renvoyer un tableau ou un objet
function normalizeAffectation(data: any) {
    if (!data) return null;
    if (Array.isArray(data)) return data.length > 0 ? data[0] : null;
    return data;
}

export function DashboardEtudiant({ navigate, onLogout }: DashboardEtudiantProps) {
    const [userName, setUserName] = useState('Étudiant');
    const [verifying, setVerifying] = useState(true);

    const [affectation, setAffectation] = useState<any | null>(null);
    const [demandesCount, setDemandesCount] = useState(0);
    const [reclamations, setReclamations] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);

    const handleLogout = () => {
        const token = localStorage.getItem('token');
        fetch(`http://localhost:8080/api/auth/logout?token=${token}`, { method: 'POST' })
            .finally(() => {
                localStorage.clear();
                navigate('landing');
            });
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
            alert('Session expirée. Veuillez vous reconnecter.');
            navigate('landing');
            return;
        }

        const user = JSON.parse(storedUser);
        if (user.nom && user.prenom) {
            setUserName(`${user.prenom} ${user.nom}`);
        }

        fetch(`http://localhost:8080/api/auth/verify?token=${token}`)
            .then((res) => {
                if (!res.ok) throw new Error('Token invalide');
                setVerifying(false);
            })
            .catch(() => {
                localStorage.clear();
                alert('Session expirée. Veuillez vous reconnecter.');
                navigate('landing');
            });
    }, [navigate]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;

        const user = JSON.parse(storedUser);
        const id = user.id;

        let cancelled = false;

        async function loadData() {
            try {
                const endpoints = [
                    fetch(`http://localhost:8080/api/demandes/etudiant/${id}`),
                    fetch(`http://localhost:8080/api/affectations/etudiant/${id}`),
                    fetch(`http://localhost:8080/api/reclamations/etudiant/${id}`),
                    fetch(`http://localhost:8080/api/notifications/etudiant/${id}`)
                ];

                const [demRes, affRes, recRes, notifRes] = await Promise.all(endpoints);

                // demandes
                if (demRes.ok) {
                    const demJson = await safeJson(demRes);
                    setDemandesCount(Array.isArray(demJson) ? demJson.length : (demJson ? 1 : 0));
                } else {
                    console.warn('Demandes response not ok', demRes.status);
                }

                // affectation
                if (affRes.ok) {
                    const affJson = await safeJson(affRes);
                    const normalized = normalizeAffectation(affJson);
                    setAffectation(normalized);
                } else {
                    console.warn('Affectation response not ok', affRes.status);
                    setAffectation(null);
                }

                // reclamations
                if (recRes.ok) {
                    const recJson = await safeJson(recRes);
                    setReclamations(Array.isArray(recJson) ? recJson : recJson ? [recJson] : []);
                } else {
                    console.warn('Reclamations response not ok', recRes.status);
                    setReclamations([]);
                }

                // notifications
                if (notifRes.ok) {
                    const notifJson = await safeJson(notifRes);
                    setNotifications(Array.isArray(notifJson) ? notifJson : notifJson ? [notifJson] : []);
                } else {
                    console.warn('Notifications response not ok', notifRes.status);
                    setNotifications([]);
                }
            } catch (err) {
                console.error("Erreur chargement dashboard :", err);
            }
        }

        loadData();

        return () => { cancelled = true; };
    }, []); // lancé une seule fois

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-600 text-lg">Vérification de la session...</p>
            </div>
        );
    }

    // Safe access helpers pour éviter crash si objet manquant
    const chambreNumero = affectation?.chambre?.numero ?? null;
    const chambreBatiment = affectation?.chambre?.batiment ?? affectation?.chambre?.batimentNom ?? null;
    const chambreType = affectation?.chambre?.type ?? affectation?.chambre?.type_chambre ?? "Non défini";
    const dateDebut = affectation?.dateDebut ?? affectation?.date_debut ?? null;
    const dateFin = affectation?.dateFin ?? affectation?.date_fin ?? null;

    return (
        <DashboardLayout
            userName={userName}
            userRole="Étudiant"
            navigate={navigate}
            onLogout={handleLogout}
        >
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="mb-8">
                        <h1 className="text-3xl mb-2">Bienvenue, {userName}</h1>
                        <p className="text-gray-600">Voici un aperçu de votre espace étudiant</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Demandes en cours</p>
                                    <p className="text-2xl">{demandesCount}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Affectation actuelle</p>
                                    <p className="text-2xl">
                                        {chambreNumero ? `Chambre ${chambreNumero}` : "Aucune"}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Home className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Réclamations</p>
                                    <p className="text-2xl">{reclamations?.length ?? 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <MessageSquare className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Notifications</p>
                                    <p className="text-2xl">{notifications?.length ?? 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Bell className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Faire une demande d'hébergement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">Soumettez une nouvelle demande d'hébergement pour le semestre prochain</p>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => navigate('demande-hebergement')}>
                                Nouvelle demande
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('chambre-details')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Home className="w-5 h-5 text-green-600" />
                                Mes affectations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Chambre actuelle</span>
                                    <span>{chambreNumero ? `${chambreNumero} - Bâtiment ${chambreBatiment ?? 'N/A'}` : "Non affecté"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Type</span>
                                    <span>{chambreType}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Période</span>
                                    <span>{dateDebut ? `${dateDebut} → ${dateFin ?? '...'}` : "Aucune période"}</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full">
                                Voir les détails
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-orange-600" />
                                    Mes réclamations
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => navigate('reclamation')}>Voir tout</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {reclamations.length === 0 && <p className="text-gray-500 text-sm">Aucune réclamation</p>}
                                {reclamations.slice(0, 2).map((rec: any) => (
                                    <div key={rec.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm">{rec.titre ?? rec.title ?? '—'}</p>
                                                <Badge className={
                                                    rec.statut === "EN_ATTENTE" ? "bg-yellow-100 text-yellow-700" :
                                                        rec.statut === "EN_COURS" ? "bg-blue-100 text-blue-700" :
                                                            rec.statut === "RESOLU" ? "bg-green-100 text-green-700" :
                                                                "bg-gray-100 text-gray-700"
                                                }>
                                                    {rec.statut}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Envoyée : {rec.dateenvoi}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                Créée : {rec.dateCreation}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700" onClick={() => navigate('reclamation')}>
                                Nouvelle réclamation
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-purple-600" />
                                    Notifications récentes
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => navigate('notifications')}>Voir tout</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {notifications.length === 0 && <p className="text-gray-500 text-sm">Aucune notification</p>}
                                {notifications.slice(0, 3).map((n: any) => (
                                    <div key={n.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Bell className="w-4 h-4 text-purple-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm mb-1">{n.message ?? n.msg ?? ''}</p>
                                            <p className="text-xs text-gray-500">{n.date ?? n.dateNotif ?? ''}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
