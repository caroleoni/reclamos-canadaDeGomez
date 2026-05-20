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
    { name: "Todas", slug: "todas", icon: AlertTriangle },
    { name: "Agua", slug: "agua", icon: Droplet },
    { name: "Alumbrado", slug: "alumbrado", icon: Lightbulb },
    { name: "Baches", slug: "baches", icon: TrafficCone },
    { name: "Cloacas", slug: "cloacas", icon: Wrench },
    { name: "Arbolado", slug: "arbolado", icon: TreePine },
    { name: "Calles", slug: "calles", icon: Route },
    { name: "Columnas/Cableados", slug: "columnas-cableados", icon: Cable },
    { name: "Comercios/Industrias", slug: "comercios-industrias", icon: Factory },
    { name: "Yuyos", slug: "yuyos", icon: TreePine },
    { name: "Inmuebles", slug: "inmuebles", icon: Building2 },
    { name: "Contaminación", slug: "contaminacion", icon: CloudFog },
    { name: "Educación", slug: "educacion", icon: GraduationCap },
    { name: "Gas", slug: "gas", icon: Flame },
    { name: "Luz", slug: "luz", icon: Lightbulb },
    { name: "Parques/Plazas", slug: "parques/plazas", icon: Trees },
    { name: "Residuos", slug: "residuos", icon: Trash2 },
    { name: "Salud", slug: "salud", icon: HeartPulse },
    { name: "Trámites Municipales", slug: "tramites-municipales", icon: FileText },
    { name: "Transporte/Tránsito", slug: "transporte-transito", icon: Bus },
    { name: "Veredas", slug: "veredas", icon: Footprints },
    { name: "Otros", slug: "otros", icon: Building2 },
];

export const complaintCategories = categories.filter(
    (category) => category.name !== "Todas"
);

export function getCategoryByName(name) {
    return categories.find(category => category.name === name)
};

