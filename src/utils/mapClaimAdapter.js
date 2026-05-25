export function mapClaimForMap(rawClaim) {
    return {
        id: rawClaim.id,
        claimNumber: rawClaim.numero_reclamo,
        position: [Number(rawClaim.latitud), Number(rawClaim.longitud)],
        category: rawClaim.categoria_nombre || "Otros",
        categorySlug: rawClaim.categoria_slug || "otros",
        categoryIcon: rawClaim.categoria_icono || "more-horizontal",
        description: rawClaim.descripcion,
        photoPreview: rawClaim.foto_url || null,
        createdAt: rawClaim.created_at,
        status: rawClaim.estado,
        priority: rawClaim.prioridad,
        neighborhood: rawClaim.barrio_zona,
        address: rawClaim.domicilio_reclamo,
    };
}
