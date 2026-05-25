import { useState } from "react";
import toast from "react-hot-toast";
import { updateClaimManagement } from "../services/claimsService";

export default function AdminClaimDetailModal({ claim, onClose, onUpdated }) {

    const [status, setStatus] = useState(claim.status || "pendiente");
    // const [priority, setPriority] = useState(claim.priority || "medio");
    const [internalNote, setInternalNote] = useState(claim.internalNotes || "");
    const [loading, setLoading] = useState(false);


    if (!claim) return null;

   async function handleSave() {
        try {
            setLoading(true);

            await updateClaimManagement(claim.id, {
                status,
                // priority,
                internalNotes: internalNote,
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
                        <p className="text-green-400 font-bold">{claim.claimNumber}</p>
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
                            <p><strong>Categoría:</strong> {claim.category?.name || "-"}</p>
                            <p><strong>Estado:</strong> {claim.status}</p>
                            {/* <p><strong>Prioridad:</strong> {claim.priority || "-"}</p> */}
                            <p><strong>Barrio/Zona:</strong> {claim.neighborhood || "-"}</p>
                            <p><strong>Domicilio reclamo:</strong> {claim.claimAddress || "-"}</p>
                            <p>
                                <strong>Fecha:</strong>{" "}
                                {new Date(claim.createdAt).toLocaleDateString("es-AR")}
                            </p>
                        </div>
                        <p className="mt-4">
                            <strong>Descripción:</strong> {claim.description}
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-green-400 mb-3">
                            Datos del vecino
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <p>
                                <strong>Nombre:</strong> {claim.claimantFirstName}{" "}
                                {claim.claimantLastName}
                            </p>
                            <p><strong>Teléfono:</strong> {claim.claimantPhone || "-"}</p>
                            <p><strong>Email:</strong> {claim.claimantEmail || "-"}</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-green-400 mb-3">
                            Gestión interna
                        </h3>

                        {/* <label className="">Prioridad</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full bg-black border-green-700 rounded-xl p-3 mb-4 outline-none"
                        >
                            <option value="baja">Baja</option>
                            <option value="media">Media</option>
                            <option value="alta">Alta</option>
                        </select> */}

                        <label className="block mb-2 font-bold">Estado</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-black border border-green-700 rounded-xl p-3 mb-4 outline-none"
                        >
                            <option value="pendiente">Pendiente</option>
                            <option value="resuelto">Resuelto</option>
                        </select>

                        <label className="block mb-2 font-bold">Respuesta al vecino</label>
                        <textarea
                            value={internalNote}
                            onChange={(e) => setInternalNote(e.target.value)}
                            className="w-full bg-black border border-green-700 rounded-xl p-3 outline-none"
                            rows="4"
                            placeholder="Escribir respuesta o devolución..."
                        />
                        <button 
                            className="mt-4 bg-green-600 hover:bg-green-500 px-5 py-3 rounded-xl font-bold"
                            onClick={handleSave}
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
