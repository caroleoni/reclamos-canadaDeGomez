import { supabase } from '../lib/supabaseClient';

/**
 * Trae todas las categorías activas, ordenadas.
 */

export async function obtenerCategorias() {
    const { data, error } = await supabase
        .from('categorias')
        .select('id, nombre, slug, icono, color, orden')
        .eq('activa', true)
        .order('orden', { ascending: true });

    if (error) {
        console.log('Error al obtener categorías:', error);
        throw new Error('No se pudieron cargar las categorías');
    }

    return data;

}

/**
 * Crea un reclamo nuevo en la tabla `reclamos`.
 * Devuelve el reclamo creado (incluye id y numero_reclamo).
 *
 * @param {Object} datos - datos del formulario
 * @param {string} datos.nombre_reclamante
 * @param {string} datos.apellido_reclamante
 * @param {string} [datos.email_reclamante]
 * @param {string} [datos.telefono_reclamante]
 * @param {string} [datos.domicilio_reclamante]
 * @param {string} datos.categoria_id  (uuid de la categoría)
 * @param {string} datos.descripcion
 * @param {string} [datos.domicilio_reclamo]
 * @param {string} [datos.barrio_zona]
 * @param {number} [datos.latitud]
 * @param {number} [datos.longitud]
 */

// export async function crearReclamo(datos) {
//     const { data, error } = await supabase
//     .from('reclamos')
//     .insert([datos])
//     .select()
//     .single();

//     if(error) {
//         console.log('Error al crear reclamo:', error);
//         throw new Error('No se pudo registrar el reclamo. Intentá nuevamente.')
//     }

//     return data;
// }

export async function crearReclamo(datos) {
    const { data, error } = await supabase.rpc('crear_reclamo_publico', {
        _nombre_reclamante: datos.nombre_reclamante,
        _apellido_reclamante: datos.apellido_reclamante,
        _dni_reclamante: datos.dni_reclamante || null,
        _telefono_reclamante: datos.telefono_reclamante,
        _email_reclamante: datos.email_reclamante || null,
        _domicilio_reclamante: datos.domicilio_reclamante || null,
        _categoria_id: datos.categoria_id,
        _descripcion: datos.descripcion,
        _domicilio_reclamo: datos.domicilio_reclamo || null,
        _barrio_zona: datos.barrio_zona || null,
        _latitud: datos.latitud,
        _longitud: datos.longitud,
    });

    if (error) {
        console.log('Error al crear reclamo:', error);
        throw new Error('No se pudo registrar el reclamo. Intentá nuevamente.');
    }

    return data[0];
}

/**
 * Sube una foto al bucket `reclamos-fotos` y registra el path
 * en la tabla `reclamo_fotos`.
 *
 * @param {string} reclamoId - uuid del reclamo recién creado
 * @param {File} archivo - File del input <input type="file">
 */

export async function subirFotoReclamo(reclamoId, archivo) {
    // 1) Construir un path único dentro del bucket
    // Ejemplo: "abc-123/1714567890-foto.jpg"
    const nombreLimpio = archivo.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase();
    const storagePath = `${reclamoId}/${Date.now()}-${nombreLimpio}`;

    // 2) Subir al bucket
    const { error: uploadError } = await supabase.storage
        .from('reclamos-fotos')
        .upload(storagePath, archivo, {
            cacheControl: '3600',
            upsert: false,
        });
    if (uploadError) {
        console.log('Error al subir foto:', uploadError);
        throw new Error('El reclamo se guardó pero la foto no se pudo subir.');
    }

    // 3) Obtener la URL pública
    const { data: urlData } = supabase.storage
        .from('reclamos-fotos')
        .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // 4) Guardar el registro en la tabla reclamo_fotos
    const { error: insertError } = await supabase
        .from('reclamo_fotos')
        .insert([
            {
                reclamo_id: reclamoId,
                storage_path: storagePath,
                public_url: publicUrl,
            },
        ]);


    if (insertError) {
        console.error('Error al guardar registro de foto:', insertError);
        throw new Error('La foto se subió pero no se registró en la base.');
    }
    return {
        reclamo_id: reclamoId,
        storage_path: storagePath,
        public_url: publicUrl,
    };
}

export async function obtenerReclamosMapa() {
    const { data, error } = await supabase.rpc("obtener_reclamos_mapa_publico");

    if (error) {
        console.error("Error al obtener reclamos del mapa:", error);
        throw new Error("No se pudieron cargar los reclamos del mapa.");
    }
    return data;
}

export async function buscarReclamoPorNumero(numero) {
    const { data, error } = await supabase.rpc("buscar_reclamo_por_numero", {
        p_numero: numero.trim(),
    });

    if (error) {
        console.error(error);
        throw new Error("No se pudo consultar el reclamo");
    }
    return data?.[0] || null;
};

export async function obtenerReclamosAdmin() {
    const { data, error } = await supabase
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
        `)
        .order("created_at", { ascending: false });

    if(error) {
        console.error("Error al obtener reclamos admin:", error);
        throw new Error("No se pudieron cargar los reclamos");
    }
    return data;
};

//Respuesta del Admin
export async function actualizarGestionReclamo(id, datos) {
    const { error } = await supabase.rpc("actualizar_gestion_reclamo_admin", {
        p_reclamo_id: id,
        p_estado: datos.estado,
        p_notas_internas: datos.notas_internas,
    })
        
        if(error) {
            console.error("Error al actualizar reclamo:", error);
            throw new Error("No se pudo actualizar el reclamo");
        }
};

export async function marcarReclamoVisto(id) {
    const { error } = await supabase.rpc("marcar_reclamo_visto", {
        p_reclamo_id: id,
    });

    if(error) {
        console.error("Error al marcar reclamo como visto:", error);
        throw new Error("No se pudo marcar el reclamo como visto");
    }
}