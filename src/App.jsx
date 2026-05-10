import { useEffect, useState } from "react"
import Header from "./components/Header"
import MapView from "./components/MapView"
import Sidebar from "./components/Sidebar";
import ComplaintModal from "./components/ComplaintModal";
import EmergencyBar from "./components/EmergencyBar";
import Footer from "./components/Footer";
import { obtenerCategorias, obtenerReclamosMapa } from "./services/reclamosService";
import { adaptarReclamoMapa } from "./utils/adaptarReclamoMapa";
import ConsultClaimModal from "./components/ConsultClaimModal";

function App() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);

  const [selectedPosition, setSeletedPosition] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([])

  const [activeCategory, setActiveCategory] = useState("todas");
  

  // useEffect(() => {
  //   async function cargarReclamo() {
  //     try {
  //       const data = await obtenerReclamosMapa();
  //       const reclamosAdaptados = data.map(adaptarReclamoMapa);
  //       setComplaints(reclamosAdaptados);
  //     } catch (error) {
  //       console.error("Error cargando reclamos del mapa:", error)
  //     }
  //   }
  //   cargarReclamo();
  // }, []);

  useEffect(() => {
    async function cargarDatosIniciales() {
      try {
        const [ categoriasDB, reclamosDB ] = await Promise.all([
          obtenerCategorias(),
          obtenerReclamosMapa(),
        ]);

        setCategories([
          {
            id: "todas",
            nombre: "Todas",
            slug: "todas",
            icono: "alert-triangle",
          },
          ...categoriasDB
        ]);

        const reclamosAdaptados = reclamosDB.map(adaptarReclamoMapa);
        setComplaints(reclamosAdaptados)

      } catch (error) {
        console.error("Error cargando datos iniciales:", error)
      }
    }
    cargarDatosIniciales();
  }, []);

  function addComplaint(newComplaint) {
    setComplaints(prev => [...prev, newComplaint]);
  }

  const filteredComplaints = activeCategory === "todas" ? complaints : complaints.filter(complaint => 
    complaint.categorySlug === activeCategory);

  return (
    <div className="min-h-screen bg-zinc-100">
      <EmergencyBar />
      <Header />
      <div className="relative">
        <MapView
          selectedPosition={selectedPosition}
          complaints={filteredComplaints}
        />
        <Sidebar
          categories={categories}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          setIsModalOpen={setIsModalOpen}
          setIsConsultModalOpen={setIsConsultModalOpen}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
        {
          !isSidebarOpen && (
            <p className="absolute top-6 left-24 z-[900] bg-black/70 text-white px-4 py-2 rounded-xl text-sm">
              Hacé click en el menú para cargar un reclamo.
            </p>
          )
        }
      </div>
      <ComplaintModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        selectedPosition={selectedPosition}
        setSeletedPosition={setSeletedPosition}
        addComplaint={addComplaint}
      />
      <ConsultClaimModal 
        isOpen={isConsultModalOpen}
        setIsOpen={setIsConsultModalOpen}
      />
      <Footer />
    </div>

  )
}

export default App
