import { categories } from "../data/categories";

export default function Sidebar({ isOpen, setIsOpen, setIsModalOpen, activeCategory, setActiveCategory }) {

    return (
        <div
            className={`absolute top-4 left-4 z-[1000] bg-slate-950 border border-blue-900 text-white rounded-2xl shadow-xl transition-all duration-300 overflow-hidden 
                    ${isOpen ? "w-72 p-4 max-h-[80vh]" : "w-16 p-2"
                }`}
        >
            {/* BOTON ABRIR/CERRAR */}
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
                        {/* NUEVO RECLAMO */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl px-4 py-3 mb-4"
                        >
                            Nuevo Reclamo
                        </button>

                        {/* CATEGORIAS */}
                        <div className="space-y-3">
                            {
                                categories.map(category => {
                                    const Icon = category.icon;

                                    return (
                                        <button
                                            key={category.name}
                                            onClick={() => setActiveCategory(category.name)}
                                            className={`flex items-center gap-3 w-full text-left border rounded-xl px-4 py-3 transition 
                                                ${activeCategory === category.name
                                                    ? "bg-blue-600 text-white border-blue-600 font-bold"
                                                    : "border-blue-700 hover:border-blue-800/40"
                                                }`}
                                        >
                                            <Icon size={18} className="text-green-500 shrink-0" />
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