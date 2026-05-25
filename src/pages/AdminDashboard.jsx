import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { getCurrentSession, signOutAdmin } from "../services/authService";
import toast from "react-hot-toast";
import { getAdminClaims, getAdminClaimStats, markClaimAsSeen } from "../services/claimsService";
import { ClipboardList, Clock, CheckCircle } from "lucide-react";
import AdminClaimDetailModal from "./AdminClaimDetailModal";

export default function AdminDashboard() {

  const navigate = useNavigate();

  const [checkingSession, setCheckingSession] = useState(true);
  // Shows the admin loading state while claims are fetched.
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [claims, setClaims] = useState([]);
  // Selected row for the admin detail modal.
  const [selectedClaim, setSelectedClaim] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalClaimsCount, setTotalClaimsCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0
  })

  const limit = 10;
  const totalPages = Math.ceil(totalClaimsCount / limit);


  async function loadClaims(page = currentPage) {
    try {
      setLoadingClaims(true);
      const result = await getAdminClaims(page, limit);
      const claimStats = await getAdminClaimStats();

      setClaims(result.data);
      setTotalClaimsCount(result.count);
      setStats(claimStats);

    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoadingClaims(false);
    }
  }

  // Verify active admin session.
  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getCurrentSession();
        if (!session) {
          navigate("/admin");
          return;
        }

        await loadClaims(currentPage);
        // const data = await getAdminClaims();
        // setClaims(data)

      } catch (error) {
        console.error(error);
        toast.error(error.message || "No se pudieron cargar los reclamos");

      } finally {
        setCheckingSession(false);
        setLoadingClaims(false);
      }
    }
    checkSession();

  }, [navigate, currentPage]);



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

  async function handleMarkAsSeen(claim) {
    try {
      await markClaimAsSeen(claim.id);
      setClaims((prev) =>
        prev.map((item) =>
          item.id === claim.id ? { ...item, seen: true } : item
        )
      );
      toast.success("Reclamo marcado como visto");

    } catch (error) {
      toast.error(error.message);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Verificando sesión...
      </div>
    );
  };

  function getStatusLabel(status) {
    const statusLabels = {
      pendiente: "Pendiente",
      resuelto: "Resuelto",
    };
    return statusLabels[status] || status;
  };

  function getStatusClass(status) {
    const statusClasses = {
      pendiente: "bg-yellow-500/15 text-yellow-300 border-yellow-500",
      resuelto: "bg-green-500/15 text-green-300 border-green-500"
    }
    return statusClasses[status] || "bg-gray-500/15 text-gray-300 border-gray-500"
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
            <Card title="Reclamos Totales" value={loadingClaims ? '...' : stats.total} icon={ClipboardList} />
            <Card title="Pendientes" value={loadingClaims ? '...' : stats.pending} icon={Clock} />
            <Card title="Resueltos" value={loadingClaims ? '...' : stats.resolved} icon={CheckCircle} />
          </section>

          <section className="mt-8 bg-slate-900 border border-green-700 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Reclamos cargados</h2>
            </div>
            {
              loadingClaims ? (
                <p className="text-gray-400" > Cargando reclamos...</p>
              ) : claims.length === 0 ? (
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
                          claims.map((claim) => (
                            <tr key={claim.id} className="border-b border-slate-800">
                              <td className="py-3 px-2 font-bold text-green-400">
                                <div className="flex items-center gap-2">
                                  {claim.claimNumber}

                                  {
                                    !claim.seen && (
                                      <span className="ml-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                        Nuevo
                                      </span>
                                    )
                                  }

                                </div>
                              </td>
                              <td className="py-3 px-2">
                                {claim.category?.name || "Sin Categoría"}
                              </td>
                              <td className="py-3 px-2">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-lg border text-sm font-semibold ${getStatusClass(
                                    claim.status
                                  )}`}
                                >
                                  {getStatusLabel(claim.status)}
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                {claim.neighborhood || "-"}
                              </td>
                              <td className="py-3 px-2">
                                {new Date(claim.createdAt).toLocaleDateString("es-AR")}
                              </td>

                              <td className="py-3 px-2 text-right">
                                {
                                  !claim.seen && (
                                    <button
                                      onClick={() => handleMarkAsSeen(claim)}
                                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold transition mr-2"
                                    >
                                      Marcar Visto
                                    </button>
                                  )
                                }
                                <button
                                  className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-xl font-bold transition"
                                  onClick={() => setSelectedClaim(claim)}>
                                  Ver detalle
                                </button>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  {
                    totalPages > 1 && (
                      <div className="hidden md:flex justify-center gap-4 mt-6">
                        <button
                          className="bg-slate-800 disabled:opacity-40 hover:bg-slate-700 px-4 py-2 rounded-xl font-bold"
                          onClick={() => setCurrentPage((prev) => prev - 1)}
                          disabled={currentPage === 1}
                        >
                          Anterior
                        </button>

                        <span className="text-gray-300">
                          Página {currentPage} de {totalPages}
                        </span>

                        <button
                          className="bg-slate-800 disabled:opacity-40 hover:bg-slate-700 px-4 py-2 rounded-xl font-bold"
                          onClick={() => setCurrentPage((prev) => prev + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Siguiente
                        </button>
                      </div>
                    )
                  }

                  {/* Panel para Celulares */}

                  <div className="md:hidden space-y-4">
                    {
                      totalPages > 1 && (
                        <div className="flex justify-center gap-3 mb-6">
                          <button
                            className="bg-slate-800 disabled:opacity-40 hover:bg-slate-700 px-3 py-2 rounded-xl font-bold text-sm"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            Anterior
                          </button>

                          <span className="text-gray-300 text-sm">
                            {currentPage} de {totalPages}
                          </span>

                          <button
                            className="bg-slate-800 disabled:opacity-40 hover:bg-slate-700 px-3 py-2 rounded-xl font-bold text-sm"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          >
                            Siguiente
                          </button>
                        </div>
                      )
                    }
                    {
                      claims.map(claim => (
                        <div
                          key={claim.id}
                          className="bg-slate-950 border border-green-700 rounded-2xl p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3">

                            <div className="flex items-center gap-2">
                              <p className="font-bold text-green-400">
                                {claim.claimNumber}
                              </p>

                              {
                                !claim.seen && (
                                  <span className="ml-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                    Nuevo
                                  </span>
                                )
                              }

                            </div>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-lg border text-xs font-semibold ${getStatusClass(
                                claim.status
                              )}`}
                            >
                              {getStatusLabel(claim.status)}
                            </span>
                          </div>

                          <p>
                            <span className="text-gray-400">Categoría:</span>{" "}
                            {claim.category?.name || "Sin categoría"}
                          </p>
                          <p>
                            <span className="text-gray-400">Barrio/Zona:</span>{" "}
                            {claim.neighborhood || "-"}
                          </p>
                          <p>
                            <span className="text-gray-400">Fecha:</span>{" "}
                            {new Date(claim.createdAt).toLocaleDateString("es-AR")}
                          </p>

                          {!claim.seen && (
                            <button
                              onClick={() => handleMarkAsSeen(claim)}
                              className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-xl font-bold transition"
                            >
                              Marcar Visto
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedClaim(claim)}
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
        selectedClaim && (
          <AdminClaimDetailModal
            key={selectedClaim.id}
            claim={selectedClaim}
            onClose={() => setSelectedClaim(null)}
            onUpdated={loadClaims}
          />
        )
      }
    </>
  )
};

function Card({ title, value, icon }) {
  const CardIcon = icon;

  return (
    <div className="bg-slate-900 border border-green-700 rounded-2xl p-5 shadow-lg flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-green-400 mt-2">{value}</p>
      </div>
      <CardIcon className="text-green-500" size={42} />
    </div>
  )
}

