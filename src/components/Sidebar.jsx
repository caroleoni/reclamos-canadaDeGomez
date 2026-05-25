
export default function Sidebar({ categories, isOpen, setIsOpen, setIsModalOpen, activeCategory, setActiveCategory, setIsConsultModalOpen }) {

    return (
        <div
            className={`absolute top-4 left-4 z-[1000] bg-slate-950 border border-blue-900 text-white rounded-2xl shadow-xl transition-all duration-300 overflow-hidden 
                    ${isOpen ? "w-72 p-4 max-h-[80vh]" : "w-16 p-2"
                }`}
        >
            {/* Toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl px-4 py-2 mb-4"
            >
                {isOpen ? "Cerrar" : "☰"}
            </button>

            {/* CONTENIDO SOLO SI ESTA ABIERTO */}
            {
                isOpen && (
                    <div className="overflow-y-auto max-h-[65vh] pr-1">
                        {/* New claim */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl px-4 py-3 mb-4"
                        >
                            Nuevo Reclamo
                        </button>
                        <button
                            onClick={() => setIsConsultModalOpen(true)}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-4 py-3 mb-4"
                        >
                            Consultar Reclamo
                        </button>
                        <p className="text-xs text-gray-300 mb-4 px-1">
                            Ingresá tu número de seguimiento para ver el estado de tu reclamo.
                        </p>

                        {/* Categories */}
                        <div className="space-y-3">
                            {
                                categories.map(category => {
                                    return (
                                        <button
                                            key={category.slug}
                                            onClick={() => setActiveCategory(category.slug)}
                                            className={`flex items-center gap-3 w-full text-left border rounded-xl px-4 py-3 transition 
                                                ${activeCategory === category.slug
                                                    ? "bg-blue-600 text-white border-blue-600 font-bold"
                                                    : "border-blue-700 hover:border-blue-800/40"
                                                }`}
                                        >
                                            <img
                                                src={`/iconos/${category.icon}`}
                                                alt={category.name}
                                                className="w-7 h-7 object-contain shrink-0"
                                            />
                                            <span>{category.name}</span>
                                        </button>
                                    );

                                })
                            }
                        </div>
                    </div>
                )
            }
        </div>
    )
}
