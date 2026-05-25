import { supabase } from '../lib/supabaseClient';

function mapCategory(category) {
    return {
        id: category.id,
        name: category.nombre,
        slug: category.slug,
        icon: category.icono,
        color: category.color,
        order: category.orden,
    };
}

function mapAdminClaim(claim) {
    return {
        id: claim.id,
        claimNumber: claim.numero_reclamo,
        description: claim.descripcion,
        status: claim.estado,
        seen: claim.visto,
        neighborhood: claim.barrio_zona,
        claimAddress: claim.domicilio_reclamo,
        claimantFirstName: claim.nombre_reclamante,
        claimantLastName: claim.apellido_reclamante,
        claimantPhone: claim.telefono_reclamante,
        claimantEmail: claim.email_reclamante,
        createdAt: claim.created_at,
        category: claim.categoria
            ? {
                name: claim.categoria.nombre,
                slug: claim.categoria.slug,
            }
            : null,
    };
}

function mapConsultedClaim(claim) {
    return {
        id: claim.id,
        claimNumber: claim.numero_reclamo,
        photoUrl: claim.foto_url,
        categoryName: claim.categoria_nombre,
        status: claim.estado,
        description: claim.descripcion,
        claimAddress: claim.domicilio_reclamo,
        neighborhood: claim.barrio_zona,
        internalNotes: claim.notas_internas,
        createdAt: claim.created_at,
    };
}

export async function getCategories() {
    const { data, error } = await supabase
        .from('categorias')
        .select('id, nombre, slug, icono, color, orden')
        .eq('activa', true)
        .order('orden', { ascending: true });

    if (error) {
        console.log('Error al obtener categorias:', error);
        throw new Error('No se pudieron cargar las categorias');
    }

    return data.map(mapCategory);
}

export async function createClaim(claimData) {
    const { data, error } = await supabase.rpc('crear_reclamo_publico', {
        _nombre_reclamante: claimData.claimantFirstName,
        _apellido_reclamante: claimData.claimantLastName,
        _dni_reclamante: claimData.claimantDni || null,
        _telefono_reclamante: claimData.claimantPhone,
        _email_reclamante: claimData.claimantEmail || null,
        _domicilio_reclamante: claimData.claimantAddress || null,
        _categoria_id: claimData.categoryId,
        _descripcion: claimData.description,
        _domicilio_reclamo: claimData.claimAddress || null,
        _barrio_zona: claimData.neighborhood || null,
        _latitud: claimData.latitude,
        _longitud: claimData.longitude,
    });

    if (error) {
        console.log('Error al crear reclamo:', error);
        throw new Error('No se pudo registrar el reclamo. Intenta nuevamente.');
    }

    return mapAdminClaim(data[0]);
}

export async function uploadClaimPhoto(claimId, file) {
    const sanitizedFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase();
    const storagePath = `${claimId}/${Date.now()}-${sanitizedFileName}`;

    const { error: uploadError } = await supabase.storage
        .from('reclamos-fotos')
        .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (uploadError) {
        console.log('Error al subir foto:', uploadError);
        throw new Error('El reclamo se guardo pero la foto no se pudo subir.');
    }

    const { data: urlData } = supabase.storage
        .from('reclamos-fotos')
        .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    const { error: insertError } = await supabase
        .from('reclamo_fotos')
        .insert([
            {
                reclamo_id: claimId,
                storage_path: storagePath,
                public_url: publicUrl,
            },
        ]);

    if (insertError) {
        console.error('Error al guardar registro de foto:', insertError);
        throw new Error('La foto se subio pero no se registro en la base.');
    }

    return {
        reclamo_id: claimId,
        storage_path: storagePath,
        public_url: publicUrl,
    };
}

export async function getMapClaims() {
    const { data, error } = await supabase.rpc("obtener_reclamos_mapa_publico");

    if (error) {
        console.error("Error al obtener reclamos del mapa:", error);
        throw new Error("No se pudieron cargar los reclamos del mapa.");
    }

    return data;
}

export async function findClaimByNumber(claimNumber) {
    const { data, error } = await supabase.rpc("buscar_reclamo_por_numero", {
        p_numero: claimNumber.trim(),
    });

    if (error) {
        console.error(error);
        throw new Error("No se pudo consultar el reclamo");
    }

    return data?.[0] ? mapConsultedClaim(data[0]) : null;
}

export async function getAdminClaims(page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
        .from("reclamos")
        .select(`
            id,
            numero_reclamo,
            descripcion,
            estado,
            visto,
            barrio_zona,
            domicilio_reclamo,
            nombre_reclamante,
            apellido_reclamante,
            telefono_reclamante,
            email_reclamante,
            created_at,
            categoria:categorias (
                nombre,
                slug
            )
        `, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        console.error("Error al obtener reclamos admin:", error);
        throw new Error("No se pudieron cargar los reclamos");
    }

    return { data: data.map(mapAdminClaim), count };
}

export async function updateClaimManagement(id, managementData) {
    const { error } = await supabase.rpc("actualizar_gestion_reclamo_admin", {
        p_reclamo_id: id,
        p_estado: managementData.status,
        p_notas_internas: managementData.internalNotes,
    });

    if (error) {
        console.error("Error al actualizar reclamo:", error);
        throw new Error("No se pudo actualizar el reclamo");
    }
}

export async function markClaimAsSeen(id) {
    const { error } = await supabase.rpc("marcar_reclamo_visto", {
        p_reclamo_id: id,
    });

    if (error) {
        console.error("Error al marcar reclamo como visto:", error);
        throw new Error("No se pudo marcar el reclamo como visto");
    }
}

export async function getAdminClaimStats() {
    const total = await supabase
        .from("reclamos")
        .select("id", { count: "exact", head: true });

    const pending = await supabase
        .from("reclamos")
        .select("id", { count: "exact", head: true })
        .eq("estado", "pendiente");

    const resolved = await supabase
        .from("reclamos")
        .select("id", { count: "exact", head: true })
        .eq("estado", "resuelto");

    if (total.error || pending.error || resolved.error) {
        throw new Error("No se pudieron cargar las estadisticas de reclamos");
    }

    return {
        total: total.count || 0,
        pending: pending.count || 0,
        resolved: resolved.count || 0,
    };
}
