import { useEffect, useState } from "react"
import Header from "../components/Header"
import MapView from "../components/MapView"
import Sidebar from "../components/Sidebar";
import ComplaintModal from "../components/ComplaintModal";
import EmergencyBar from "../components/EmergencyBar";
import Footer from "../components/Footer";
import { getCategories, getMapClaims } from "../services/claimsService";
import { mapClaimForMap } from "../utils/mapClaimAdapter";
import ConsultClaimModal from "../components/ConsultClaimModal";

export default function PublicPage() {
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);

    const [selectedPosition, setSelectedPosition] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [categories, setCategories] = useState([])

    const [activeCategory, setActiveCategory] = useState("todas");


    useEffect(() => {
        async function loadInitialData() {
            try {
                const [databaseCategories, databaseClaims] = await Promise.all([
                    getCategories(),
                    getMapClaims(),
                ]);

                setCategories([
                    {
                        id: "todas",
                        name: "Todas",
                        slug: "todas",
                        icon: "todas.jpeg",
                    },
                    ...databaseCategories
                ]);

                const mappedClaims = databaseClaims.map(mapClaimForMap);
                setComplaints(mappedClaims)

            } catch (error) {
                console.error("Error loading initial data:", error)
            }
        }
        loadInitialData();
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
                setSelectedPosition={setSelectedPosition}
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
