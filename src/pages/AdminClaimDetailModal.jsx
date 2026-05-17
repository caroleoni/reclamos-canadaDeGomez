import { useState } from "react";
import toast from "react-hot-toast";
import { actualizarGestionReclamo } from "../services/reclamosService";

export default function AdminClaimDetailModal({ reclamo, onClose, onUpdated }) {

    const [estado, setEstado] = useState(reclamo.estado || "pendiente");
    const [prioridad, setPrioridad] = useState(reclamo.prioridad || "medio");
    const [notaInterna, setNotaInterna] = useState(reclamo.notas_internas || "");
    const [loading, setLoading] = useState(false);


    if (!reclamo) return null;

   async function handleGuardar() {
        try {
            setLoading(true);

            await actualizarGestionReclamo(reclamo.id, {
                estado,
                prioridad,
                notas_internas: notaInterna,
            });

            toast.success("Reclamo actualizado correctamente");
            await onUpdated();
            onClose();

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[300] bg-black/70 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-green-600 rounded-2xl text-white shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-green-600">
                    <div>
                        <h2 className="text-2xl font-bold">Detalle del reclamo</h2>
                        <p className="text-green-400 font-bold">{reclamo.numero_reclamo}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-xl font-bold"
                    >
                        Cerrar
                    </button>
                </div>

                <div className="p-5 space-y-6">
                    <section>
                        <h3 className="text-lg font-bold text-green-400 mb-3">
                            Datos del reclamo
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <p><strong>Categoría:</strong> {reclamo.categoria?.nombre || "-"}</p>
                            <p><strong>Estado:</strong> {reclamo.estado}</p>
                            <p><strong>Prioridad:</strong> {reclamo.prioridad || "-"}</p>
                            <p><strong>Barrio/Zona:</strong> {reclamo.barrio_zona || "-"}</p>
                            <p><strong>Domicilio reclamo:</strong> {reclamo.domicilio_reclamo || "-"}</p>
                            <p>
                                <strong>Fecha:</strong>{" "}
                                {new Date(reclamo.created_at).toLocaleDateString("es-AR")}
                            </p>
                        </div>
                        <p className="mt-4">
                            <strong>Descripción:</strong> {reclamo.descripcion}
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-green-400 mb-3">
                            Datos del vecino
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <p>
                                <strong>Nombre:</strong> {reclamo.nombre_reclamante}{" "}
                                {reclamo.apellido_reclamante}
                            </p>
                            <p><strong>Teléfono:</strong> {reclamo.telefono_reclamante || "-"}</p>
                            <p><strong>Email:</strong> {reclamo.email_reclamante || "-"}</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-green-400 mb-3">
                            Gestión interna
                        </h3>

                        <label className="">Prioridad</label>
                        <select
                            value={prioridad}
                            onChange={(e) => setPrioridad(e.target.value)}
                            className="w-full bg-black border-green-700 rounded-xl p-3 mb-4 outline-none"
                        >
                            <option value="baja">Baja</option>
                            <option value="media">Media</option>
                            <option value="alta">Alta</option>
                        </select>

                        <label className="block mb-2 font-bold">Estado</label>
                        <select
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                            className="w-full bg-black border border-green-700 rounded-xl p-3 mb-4 outline-none"
                        >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_proceso">En Proceso</option>
                            <option value="resuelto">Resuelto</option>
                        </select>

                        <label className="block mb-2 font-bold">Respuesta al vecino</label>
                        <textarea
                            value={notaInterna}
                            onChange={(e) => setNotaInterna(e.target.value)}
                            className="w-full bg-black border border-green-700 rounded-xl p-3 outline-none"
                            rows="4"
                            placeholder="Escribir respuesta o devolución..."
                        />
                        <button 
                            className="mt-4 bg-green-600 hover:bg-green-500 px-5 py-3 rounded-xl font-bold"
                            onClick={handleGuardar}
                            disabled={loading}
                        >
                            {loading ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </section>
                </div>
            </div>
        </div>
    )
}
