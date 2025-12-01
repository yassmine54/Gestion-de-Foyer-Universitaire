import { useEffect, useState } from 'react';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import type { Page } from '../../App';

interface ReclamationType {
    id?: number;
    titre: string;
    message: string;
    date?: string;
    statut?: string;
    reponse?: string | null;
}

interface ReclamationPageProps {
    navigate: (page: Page) => void;
    onLogout: () => void;
}

export function ReclamationPage({ navigate, onLogout }: ReclamationPageProps) {
    const [titre, setTitre] = useState('');
    const [message, setMessage] = useState('');
    const [reclamations, setReclamations] = useState<ReclamationType[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Récupère l'id de l'étudiant (doit être présent dans localStorage après login)
    const user = (() => {
        const s = localStorage.getItem('user');
        return s ? JSON.parse(s) : null;
    })();
    const etudiantId = user?.id;

    useEffect(() => {
        if (!etudiantId) return;
        setLoading(true);
        fetch(`http://localhost:8080/api/reclamations/etudiant/${etudiantId}`)
            .then(async (res) => {
                if (!res.ok) throw new Error(`Erreur ${res.status}`);
                const data = await res.json();
                // Normaliser dates/statut si nécessaire
                setReclamations(
                    Array.isArray(data)
                        ? data.map((r: any) => ({
                            id: r.id,
                            titre: r.titre,
                            message: r.message || r.description || '',
                            date: r.dateCreation || r.date_envoi || r.date || '',
                            statut: r.statut || r.status || 'EN_ATTENTE',
                            reponse: r.reponse || null
                        }))
                        : []
                );
            })
            .catch((e) => {
                console.error("Erreur fetch réclamations:", e);
                setError("Impossible de charger les réclamations.");
            })
            .finally(() => setLoading(false));
    }, [etudiantId]);

    const handleSubmit = async (ev?: React.FormEvent) => {
        ev?.preventDefault();
        setError(null);

        if (!etudiantId) {
            setError("Utilisateur non connecté.");
            return;
        }
        if (!titre.trim() || !message.trim()) {
            setError("Veuillez remplir le titre et le message.");
            return;
        }

        setSubmitting(true);
        try {
            // **URL attendue côté backend** :
            // POST /api/reclamations/create/{etudiantId}
            const res = await fetch(`http://localhost:8080/api/reclamations/create/${etudiantId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    titre: titre.trim(),
                    message: message.trim()
                })
            });

            if (!res.ok) {
                const txt = await res.text().catch(()=>null);
                throw new Error(`Erreur serveur ${res.status} ${txt ?? ''}`);
            }

            const created = await res.json();
            // Normaliser l'objet créé avant ajout à l'UI
            const item: ReclamationType = {
                id: created.id,
                titre: created.titre,
                message: created.message || created.description,
                date: created.dateCreation || created.date_envoi || new Date().toISOString(),
                statut: created.statut || "EN_ATTENTE",
                reponse: created.reponse || null
            };

            // Ajouter en haut de la liste
            setReclamations((prev) => [item, ...prev]);
            // Reset form
            setTitre('');
            setMessage('');
        } catch (err: any) {
            console.error("Erreur envoi réclamation:", err);
            setError(err?.message || "Erreur inconnue lors de l'envoi");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (statut: string | undefined) => {
        switch (statut) {
            case 'EN_ATTENTE':
            case 'EN ATTENTE':
                return 'bg-yellow-100 text-yellow-800';
            case 'EN_COURS':
            case 'EN COURS':
                return 'bg-blue-100 text-blue-800';
            case 'RESOLU':
            case 'RÉSOLU':
                return 'bg-green-100 text-green-800';
            case 'REJETE':
            case 'REJETÉ':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DashboardLayout
            userName={user ? `${user.prenom} ${user.nom}` : "Étudiant"}
            userRole="Étudiant"
            navigate={navigate}
            onLogout={onLogout}
        >
            <div className="max-w-5xl mx-auto">
                <Button variant="ghost" className="mb-4" onClick={() => navigate('dashboard-etudiant')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour au dashboard
                </Button>

                <div className="mb-8">
                    <h1 className="text-3xl mb-2">Mes réclamations</h1>
                    <p className="text-gray-600">Soumettez et suivez vos réclamations</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                Nouvelle réclamation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="titre">Titre</Label>
                                    <input
                                        id="titre"
                                        type="text"
                                        value={titre}
                                        onChange={(e) => setTitre(e.target.value)}
                                        placeholder="Résumé du problème"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea
                                        id="message"
                                        value={message}
                                        onChange={(e: any) => setMessage(e.target.value)}
                                        placeholder="Décrivez votre réclamation en détail..."
                                        rows={6}
                                        className="resize-none"
                                    />
                                </div>

                                <div className="text-sm text-gray-500">
                                    <p>Date: {new Date().toLocaleDateString('fr-FR')}</p>
                                </div>

                                {error && <div className="text-red-600 text-sm">{error}</div>}

                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                                    <Send className="w-4 h-4 mr-2" />
                                    {submitting ? 'Envoi...' : 'Envoyer la réclamation'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-purple-600" />
                                Historique des réclamations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loading && <p>Chargement...</p>}
                                {!loading && reclamations.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                        <p>Aucune réclamation pour le moment</p>
                                    </div>
                                )}

                                {reclamations.map((reclamation) => (
                                    <Card key={reclamation.id} className="border-l-4 border-l-blue-600">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="mb-1">{reclamation.titre}</h3>
                                                    <p className="text-sm text-gray-500">{reclamation.date}</p>
                                                </div>
                                                <Badge className={getStatusColor(reclamation.statut)}>{reclamation.statut}</Badge>
                                            </div>

                                            <div className="mb-3">
                                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{reclamation.message}</p>
                                            </div>

                                            {reclamation.reponse ? (
                                                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-l-blue-600">
                                                    <p className="text-xs mb-1">Réponse de l'administration:</p>
                                                    <p className="text-sm text-gray-700">{reclamation.reponse}</p>
                                                </div>
                                            ) : reclamation.statut === 'EN_ATTENTE' ? (
                                                <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
                                                    En attente de traitement par l'administration
                                                </div>
                                            ) : null}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
