import {
    Home, Calendar, Download, User, MapPin, ArrowLeft
} from "lucide-react";
import { DashboardLayout } from "../layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import type { Page } from "../../App";
import { useEffect, useState } from "react";

interface ChambreDetailsPageProps {
    navigate: (page: Page) => void;
    onLogout: () => void;
}

export function ChambreDetailsPage({ navigate, onLogout }: ChambreDetailsPageProps) {

    const [affectation, setAffectation] = useState<any>(undefined);
    const [etatLieux, setEtatLieux] = useState<any>(null);
    const [colocataires, setColocataires] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = storedUser?.id;

    // Chargement des données backend
    useEffect(() => {
        if (!userId) return;

        async function load() {
            try {
                const affRes = await fetch(`http://localhost:8080/api/affectations/etudiant/${userId}`);
                const data = affRes.ok ? await affRes.json() : null;
                setAffectation(data);

                if (data?.id && data?.chambre?.id) {
                    // État des lieux
                    const etatRes = await fetch(`http://localhost:8080/api/etat/affectation/${data.id}`);
                    if (etatRes.ok) setEtatLieux(await etatRes.json());

                    // Colocataires
                    const colocRes = await fetch(`http://localhost:8080/api/chambres/colocataires/${data.chambre.id}`);
                    if (colocRes.ok) {
                        const list = await colocRes.json();
                        setColocataires(list.filter((e: any) => e.id !== userId));
                    }
                }

            } finally {
                setLoading(false);
            }
        }

        load();
    }, [userId]);


    // 🟡 AFFICHAGE "Loading..."
    if (loading) {
        return (
            <DashboardLayout
                userName={`${storedUser.prenom} ${storedUser.nom}`}
                userRole="Étudiant"
                navigate={navigate}
                onLogout={onLogout}
            >
                <div className="h-64 flex items-center justify-center text-lg text-gray-500">
                    Chargement des informations…
                </div>
            </DashboardLayout>
        );
    }

    // 🔴 Aucune affectation trouvée
    if (!affectation) {
        return (
            <DashboardLayout
                userName={`${storedUser.prenom} ${storedUser.nom}`}
                userRole="Étudiant"
                navigate={navigate}
                onLogout={onLogout}
            >
                <div className="max-w-xl mx-auto text-center mt-24">
                    <h1 className="text-3xl mb-3">Aucune affectation trouvée</h1>
                    <p className="text-gray-600 mb-8">
                        Vous n'êtes pas encore affecté à une chambre.
                    </p>

                    <Button onClick={() => navigate("dashboard-etudiant")}>
                        Retour au dashboard
                    </Button>
                </div>
            </DashboardLayout>
        );
    }


    const chambre = affectation.chambre ?? {};

    return (
        <DashboardLayout
            userName={`${storedUser.prenom} ${storedUser.nom}`}
            userRole="Étudiant"
            navigate={navigate}
            onLogout={onLogout}
        >
            <div className="max-w-4xl mx-auto">

                {/* BACK BUTTON */}
                <Button variant="ghost" className="mb-4" onClick={() => navigate("dashboard-etudiant")}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour au dashboard
                </Button>

                {/* HEADER */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl">
                            Chambre {chambre.numero ?? "—"}
                        </h1>

                        {chambre.etat && (
                            <Badge className="bg-green-100 text-green-800">
                                {chambre.etat}
                            </Badge>
                        )}
                    </div>
                    <p className="text-gray-600">
                        Informations de votre chambre et affectation
                    </p>
                </div>

                {/* INFO CHAMBRE */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Home className="w-5 h-5 text-blue-600" />
                            Informations de la chambre
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Numéro</p>
                                    <p className="text-lg">{chambre.numero ?? "Non défini"}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Type</p>
                                    <p className="text-lg">{chambre.type ?? "—"}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Bâtiment</p>
                                    <p className="text-lg">{chambre.batiment ?? "—"}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Capacité</p>
                                    <p className="text-lg">{chambre.capacite ?? "—"} personnes</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">État</p>
                                    <Badge className="bg-green-100 text-green-800">
                                        {chambre.etat ?? "—"}
                                    </Badge>
                                </div>
                            </div>

                        </div>

                        <Separator className="my-6" />

                        {/* Équipements */}
                        <p className="text-sm mb-3">Équipements</p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {["Lit", "Bureau", "Chaise", "Armoire", "Wi-Fi", "Salle de bain"].map((e, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    {e}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* AFFECTATION */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-600" />
                            Détails de l'affectation
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Date de début</p>
                                <p className="text-lg">{affectation.dateDebut ?? "—"}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 mb-1">Date de fin</p>
                                <p className="text-lg">{affectation.dateFin ?? "—"}</p>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Colocataires */}
                        {colocataires.length > 0 && (
                            <div>
                                <p className="text-sm text-gray-600 mb-3">Colocataires</p>

                                {colocataires.map((c) => (
                                    <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p>{c.prenom} {c.nom}</p>
                                            <p className="text-sm text-gray-500">{c.filiere}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {colocataires.length === 0 && (
                            <p className="text-gray-500 text-sm">Aucun colocataire</p>
                        )}
                    </CardContent>
                </Card>

                {/* ÉTAT DES LIEUX */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                État des lieux
              </span>
                            <Badge className="bg-blue-100 text-blue-800">
                                {etatLieux ? "Disponible" : "Non réalisé"}
                            </Badge>
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {etatLieux ? (
                            <>
                                <p className="text-sm text-gray-700 mb-4">
                                    Réalisé le {etatLieux.dateEtat}
                                </p>

                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    Télécharger l’état des lieux
                                </Button>
                            </>
                        ) : (
                            <p className="text-gray-600 text-sm">
                                Aucun état des lieux n’a encore été enregistré.
                            </p>
                        )}
                    </CardContent>
                </Card>

            </div>
        </DashboardLayout>
    );
}
