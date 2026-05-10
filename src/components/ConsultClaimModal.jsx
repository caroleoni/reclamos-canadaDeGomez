import { useState } from "react"
import toast from "react-hot-toast";
import { buscarReclamoPorNumero } from "../services/reclamosService";


export default function ConsultClaimModal({isOpen, setIsOpen}) {

    const [ numero, setNumero ] = useState("");
    const [ reclamo, setReclamo ] = useState(null);
    const [ loading, setLoading ] = useState(false);

    if(!isOpen) return null;

    async function handleSubmit(e) {
        e.preventDefault();

        if(!numero.trim()) {
            toast.error("Ingresá el número de reclamo");
            return;
        }

        setLoading(true);
        setReclamo(null);

        try {
            const data = await buscarReclamoPorNumero(numero);

            if(!data) {
                toast.error("No encontramos un reclamo con ese número");
                return;
            }
            setReclamo(data);

        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false)
        }

    };

    function formatDate(date) {
        return new Date(date).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

  return (
    <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center px-4">
        <div className="bg-slate-950 border border-blue-900 text-white w-full max-w-xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-green-500 pb-4 mb-4">
                <p className="text-2xl fotn-bold">Consultar Reclamo</p>

                <button
                    type="text"
                    onClick={() => {
                        setIsOpen(false)
                        setNumero("")
                        setReclamo(null)
                    }}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl font-bold"
                >
                    Cerrar
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2 font-semibold">
                        Número de seguimiento
                    </label>
                    <input 
                        type="text"
                        className="w-full rounded-xl bg-black border border-green-700 focus:border-blue-500 px-4 py-3 outline-none"
                        placeholder="Ej: REC-2026-00007"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition text-white font-bold py-4 px-2 rounded-xl"
                >
                    { loading ? "Buscando..." : "Buscar reclamo" }
                </button>
            </form>

            {
                reclamo && (
                    <div className="mt-6 bg-slate-900 border border-green-700 rounded-2xl p-4 space-y-3">
                        {
                            reclamo.foto_url && (
                                <img 
                                    src={reclamo.foto_url}
                                    alt="Foto del reclamo"
                                    className="w-full h-48 object-cover rounded-xl border border-green-700"
                                />
                            )
                        }
                        <p className="fond-bold text-green 700">
                            N° {reclamo.numero_reclamo}
                        </p>
                        <p>
                            <strong>Categoría:</strong> {reclamo.categoria_nombre}
                        </p>
                        <p>
                            <strong>Estado:</strong> {reclamo.estado}
                        </p>
                        <p>
                            <strong>Prioridad:</strong> {reclamo.prioridad}
                        </p>
                        <p>
                            <strong>Descripción:</strong> {reclamo.descripcion}
                        </p>

                        {
                            reclamo.domicilio_reclamo && (
                                <p>
                                    <strong>Dirección:</strong> {reclamo.domicilio_reclamo}
                                </p>
                            )
                        }

                        {
                            reclamo.barrio_zona && (
                                <p>
                                    <strong>Barrio/Zona:</strong> {reclamo.barrio_zona}
                                </p>
                            )
                        }

                        <p className="text-sm text-gray-400">
                            Cargando el {formatDate(reclamo.created_at)}
                        </p>
                    </div>
                )
            }

        </div>
    </div>
  )
}
