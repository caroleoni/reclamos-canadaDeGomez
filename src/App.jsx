import { useState } from "react"
import Header from "./components/Header"
import MapView from "./components/MapView"
import Sidebar from "./components/Sidebar";
import ComplaintModal from "./components/ComplaintModal";
import EmergencyBar from "./components/EmergencyBar";
import Footer from "./components/Footer";

function App() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSeletedPosition] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Todas");

  function addComplaint(newComplaint) {
    setComplaints(prev => [...prev, newComplaint]);
  }

  const filteredComplaints = activeCategory === "Todas" ? complaints : complaints.filter(complaint => complaint.category === activeCategory);

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
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          setIsModalOpen={setIsModalOpen}
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
      <Footer />
    </div>

  )
}

export default App
