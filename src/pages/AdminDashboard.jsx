import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { getCurrentSession, signOutAdmin } from "../services/authService";
import toast from "react-hot-toast";
import { marcarReclamoVisto, obtenerReclamosAdmin } from "../services/reclamosService";
import { ClipboardList, Clock, Settings, CheckCircle } from "lucide-react";
import AdminClaimDetailModal from "./AdminClaimDetailModal";

export default function AdminDashboard() {

  const navigate = useNavigate();

  const [checkingSession, setCheckingSession] = useState(true);
  //Es la variable que permite mostrar algo mientras carga.
  const [loadingReclamos, setLoadingReclamos] = useState(true);
  const [reclamos, setReclamos] = useState([]);
  //Para el modal del panel admin del detalle
  const [selectedReclamo, setSelectedReclamo] = useState(null);


  async function cargarReclamos() {
    try {
      setLoadingReclamos(true);
      const data = await obtenerReclamosAdmin();
      setReclamos(data);

    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoadingReclamos(false);
    }
  }

  //verificar sesión
  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getCurrentSession();
        if (!session) {
          navigate("/admin");
          return;
        }

        await cargarReclamos();
        // const data = await obtenerReclamosAdmin();
        // setReclamos(data)

      } catch (error) {
        console.error(error);
        toast.error(error.message || "No se pudieron cargar los reclamos");

      } finally {
        setCheckingSession(false);
        setLoadingReclamos(false);
      }
    }
    checkSession();

  }, [navigate]);



  async function handleLogout() {
    try {
      await signOutAdmin();

      toast.success("Sesión cerrada");
      navigate("/admin");

    } catch (error) {
      console.error(error);
      toast.error("No se pudo cerrar sesión");
    }
  };

  async function handleMarcarVisto(reclamo) {
    try {
      await marcarReclamoVisto(reclamo.id);
      setReclamos((prev) =>
        prev.map((item) =>
          item.id === reclamo.id ? { ...item, visto: true } : item
        )
      );
      toast.success("Reclamo marcado como visto");

    } catch (error) {
      toast.error(error.message);
    }
  }

  const totalReclamos = reclamos.length;
  const pendientes = reclamos.filter((r) => r.estado === "pendiente").length;
  const resueltos = reclamos.filter((r) => r.estado === "resuelto").length;

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Verificando sesión...
      </div>
    );
  };

  function getEstadoLabel(estado) {
    const estados = {
      pendiente: "Pendiente",
      resuelto: "Resuelto",
    };
    return estados[estado] || estado;
  };

  function getEstadoClass(estado) {
    const estilos = {
      pendiente: "bg-yellow-500/15 text-yellow-300 border-yellow-500",
      resuelto: "bg-green-500/15 text-green-300 border-green-500"
    }
    return estilos[estado] || "bg-gray-500/15 text-gray-300 border-gray-500"
  };

  return (
    <>
      <div className="min-h-screen bg-slate-950 text-white">
        <header className="border-b border-blue-900 bg-slate-900/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Panel Administrativo</h1>
              <p className="text-sm text-gray-400 mt-1">
                Gestión de reclamos ciudadanos
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl font-bold transition"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <section className="bg-slate-900 border border-green-700 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-2">
              Bienvenido
            </h2>

            <p className="text-gray-300">
              Desde este panel vas a poder ver, gestionar y actualizar los reclamos cargados por los vecinos.
            </p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <Card title="Reclamos Totales" value={loadingReclamos ? '...' : totalReclamos} icon={ClipboardList} />
            <Card title="Pendientes" value={loadingReclamos ? '...' : pendientes} icon={Clock} />
            <Card title="Resueltos" value={loadingReclamos ? '...' : resueltos} icon={CheckCircle} />
          </section>

          <section className="mt-8 bg-slate-900 border border-green-700 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Reclamos cargados</h2>
            </div>
            {
              loadingReclamos ? (
                <p className="text-gray-400" > Cargando reclamos...</p>
              ) : reclamos.length === 0 ? (
                <p className="text-gray-400">Todavía no hay reclamos cargados.</p>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-400 border-b border-slate-700">
                          <th className="py-3 px-2">N°</th>
                          <th className="py-3 px-2">Categoría</th>
                          <th className="py-3 px-2">Estado</th>
                          <th className="py-3 px-2">Barrio/Zona</th>
                          <th className="py-3 px-2">Fecha</th>
                          <th className="py-3 px-2">Acción</th>
                        </tr>
                      </thead>

                      <tbody>
                        {
                          reclamos.map((reclamo) => (
                            <tr key={reclamo.id} className="border-b border-slate-800">
                              <td className="py-3 px-2 font-bold text-green-400">
                                <div className="flex items-center gap-2">
                                  {reclamo.numero_reclamo}

                                  {
                                    !reclamo.visto && (
                                      <span className="ml-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                        Nuevo
                                      </span>
                                    )
                                  }

                                </div>
                              </td>
                              <td className="py-3 px-2">
                                {reclamo.categoria?.nombre || "Sin Categoría"}
                              </td>
                              <td className="py-3 px-2">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-lg border text-sm font-semibold ${getEstadoClass(
                                    reclamo.estado
                                  )}`}
                                >
                                  {getEstadoLabel(reclamo.estado)}
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                {reclamo.barrio_zona || "-"}
                              </td>
                              <td className="py-3 px-2">
                                {new Date(reclamo.created_at).toLocaleDateString("es-AR")}
                              </td>

                              <td className="py-3 px-2 text-right">
                                {
                                  !reclamo.visto && (
                                    <button
                                      onClick={() => handleMarcarVisto(reclamo)}
                                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold transition mr-2"
                                    >
                                      Marcar Visto
                                    </button>
                                  )
                                }
                                <button
                                  className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-xl font-bold transition"
                                  onClick={() => setSelectedReclamo(reclamo)}>
                                  Ver detalle
                                </button>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>

                  {/* Panel para Celulares */}
                  <div className="md:hidden space-y-4">
                    {
                      reclamos.map(reclamo => (
                        <div
                          key={reclamo.id}
                          className="bg-slate-950 border border-green-700 rounded-2xl p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-green-400">
                              {reclamo.numero_reclamo}
                            </p>

                              {
                                !reclamo.visto && (
                                  <span className="ml-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                    Nuevo
                                  </span>
                                )
                              }

                            </div>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-lg border text-xs font-semibold ${getEstadoClass(
                                reclamo.estado
                              )}`}
                            >
                              {getEstadoLabel(reclamo.estado)}
                            </span>
                          </div>

                          <p>
                            <span className="text-gray-400">Categoría:</span>{" "}
                            {reclamo.categoria?.nombre || "Sin categoría"}
                          </p>
                          <p>
                            <span className="text-gray-400">Barrio/Zona:</span>{" "}
                            {reclamo.barrio_zona || "-"}
                          </p>
                          <p>
                            <span className="text-gray-400">Fecha:</span>{" "}
                            {new Date(reclamo.created_at).toLocaleDateString("es-AR")}
                          </p>

                          {!reclamo.visto && (
                            <button
                              onClick={() => handleMarcarVisto(reclamo)}
                              className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-xl font-bold transition"
                            >
                              Marcar Visto
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedReclamo(reclamo)}
                            className="w-full bg-green-600 hover:bg-green-500 px-4 py-3 rounded-xl font-bold transition"
                          >
                            Ver detalle
                          </button>
                        </div>
                      ))
                    }
                  </div>
                </>
              )
            }
          </section>
        </main>
      </div >
      {
        selectedReclamo && (
          <AdminClaimDetailModal
            key={selectedReclamo.id}
            reclamo={selectedReclamo}
            onClose={() => setSelectedReclamo(null)}
            onUpdated={cargarReclamos}
          />
        )
      }
    </>
  )
};

function Card({ title, value, icon: Icon }) {
  return (
    <div className="bg-slate-900 border border-green-700 rounded-2xl p-5 shadow-lg flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-green-400 mt-2">{value}</p>
      </div>
      <Icon className="text-green-500" size={42} />
    </div>
  )
}
