import {
    AlertTriangle,
    Droplet,
    Lightbulb,
    Trash2,
    TreePine,
    Route,
    Cable,
    Factory,
    CloudFog,
    GraduationCap,
    Flame,
    Lamp,
    Trees,
    HeartPulse,
    FileText,
    Bus,
    Footprints,
    Building2,
    Wrench,
    TrafficCone,
} from 'lucide-react';

export const categories = [
    { name: "Todas", icon: AlertTriangle },
    { name: "Agua", icon: Droplet },
    { name: "Alumbrado", icon: Lightbulb },
    { name: "Baches", icon: TrafficCone },
    { name: "Cloacas", icon: Wrench },
    { name: "Arbolado", icon: TreePine },
    { name: "Calles", icon: Route },
    { name: "Columnas/Cableados", icon: Cable },
    { name: "Comercios/Industrias", icon: Factory },
    { name: "Contaminación", icon: CloudFog },
    { name: "Educación", icon: GraduationCap },
    { name: "Gas", icon: Flame },
    { name: "Luz", icon: Lightbulb},
    { name: "Parques/Plazas", icon: Trees },
    { name: "Residuos", icon: Trash2 },
    { name: "Salud", icon: HeartPulse },
    { name: "Trámites Municipales", icon: FileText },
    { name: "Transporte/Tránsito", icon: Bus },
    { name: "Veredas", icon: Footprints },
    { name: "Otros", icon: Building2 },
];

export const complaintCategories = categories.filter(
    (category) => category.name !== "Todas"
);

export function getCategoryByName(name) {
    return categories.find(category => category.name === name)
};

