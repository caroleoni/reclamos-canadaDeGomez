export function adaptarReclamoMapa(reclamo) {
    return {
        id: reclamo.id,
        numeroReclamo: reclamo.numero_reclamo,
        position: [Number(reclamo.latitud), Number(reclamo.longitud)],
        category: reclamo.categoria_nombre || "Otros",
        categorySlug: reclamo.categoria_slug || "otros",
        categoryIcon: reclamo.categoria_icono || "more-horizontal",
        description: reclamo.descripcion,
        photoPreview: reclamo.foto_url || null,
        createdAt: reclamo.created_at,
        estado: reclamo.estado,
        prioridad: reclamo.prioridad,
        barrio: reclamo.barrio_zona,
        direccion: reclamo.domicilio_reclamo,
    }
}