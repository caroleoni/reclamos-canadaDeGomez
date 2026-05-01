import { useState } from "react";
import toast from "react-hot-toast";
import { MapContainer, Marker, TileLayer, useMapEvent } from "react-leaflet";
import { complaintCategories } from "../data/categories";

const initialFormData = {
    description: '',
    category: '',
    photo: null,
    name: '',
    lastname: '',
    phone: '',
    email: '',
    claimantAddress: '',
    claimAddress: '',
    neighborhood: '',
    dni: '',
};

function LocationPicker({ selectedPosition, setSeletedPosition }) {
    useMapEvent({
        click(e) {
            setSeletedPosition([e.latlng.lat, e.latlng.lng]);
        },
    });
    return selectedPosition ? <Marker position={selectedPosition} /> : null;
};

export default function ComplaintModal({ isOpen, setIsOpen, selectedPosition, setSeletedPosition, addComplaint }) {
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [photoPreview, setPhotoPreview] = useState("");

    if (!isOpen) return false;

    function handleChange(e) {
        const { name, value, files } = e.target;

        if (files) {
            const file = files[0];

            setFormData(prev => ({
                ...prev,
                [name]: file,
            }));
            if (file) {
                setPhotoPreview(URL.createObjectURL(file));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    function resetForm() {
        setFormData(initialFormData);
        setSeletedPosition(null);
        setErrors({});
        setPhotoPreview("");
    };

    function validateForm() {
        const newErrors = {};

        if (!formData.description.trim()) {
            newErrors.description = "Por favor escribí una descripción."
        }
        if (!formData.category.trim()) {
            newErrors.category = "Por favor seleccioná una categoría."
        }
        if (!selectedPosition) {
            newErrors.position = "Por favor seleccioná una ubicación en el mapa.";
        }
        if (!formData.name.trim()) {
            newErrors.name = "Por favor escribí tu nombre.";
        }

        if (!formData.lastname.trim()) {
            newErrors.lastname = "Por favor escribí tu apellido.";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Por favor escribí tu teléfono.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    function handleSubmit(e) {
        e.preventDefault();

        if (!validateForm()) return;

        const newComplaint = {
            id: crypto.randomUUID(),
            ...formData,
            photoPreview,
            position: selectedPosition,
            createdAt: new Date().toISOString(),
        }
        addComplaint(newComplaint);
        resetForm();
        setIsOpen(false);
        toast.success("Reclamo enviado correctamente", {
            duration: 4000,
            position: 'top-right',
            iconTheme: { primary: '#000' },
        });
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center px-4">
            <div className="bg-slate-950 border border-blue-900 text-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative">
                <div className="flex items-center justify-between px-6 py-4 border-b border-green-500 sticky top-0 bg-zinc-900 z-10">
                    <h2 className="text-3xl font-bold mb-6">Nuevo Reclamo</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl font-bold "
                    >
                        Cerrar
                    </button>
                </div>
                {/* //Scroll */}
                <div className="p-6 overflow-y-auto h-[calc(90vh-80px)]">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block mb-2 font-semibold">Descripción del reclamo</label>
                            <textarea
                                className="w-full rounded-xl bg-black border border-green-700 focus:border-blue-500 px-4 py-3 outline-none"
                                rows="4"
                                placeholder="Describí el problema"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                            {errors.description && (
                                <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold">Categoria</label>
                            <select
                                className="w-full rounded-xl bg-black border border-green-700 focus:border-blue-500 px-4 py-3 outline-none"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >

                                <option>Selecciona Categoria</option>
                                {
                                    complaintCategories.map(category => (
                                        <option key={category.name} value={category.name}>
                                            {category.name}
                                        </option>
                                    ))
                                }

                            </select>
                            {errors.category && (
                                <p className="text-red-400 text-sm mt-1">{errors.category}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold">Foto</label>
                            <input
                                type="file"
                                className="w-full rounded-xl bg-black border border-green-700 focus:border-blue-500 px-4 py-3 outline-none"
                                name="photo"
                                onChange={handleChange}
                            />
                            {
                                photoPreview && (
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-300 mb-2">Vista previa</p>
                                        <img
                                            src={photoPreview}
                                            alt="Vista previa"
                                            className="w-40 h-40 object-cover rounded-xl border border-green-700"
                                        />
                                    </div>
                                )
                            }
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold">Ubicación del Reclamo</label>
                            <p className="text-sm text-gray-300 mb-2">
                                Hacé click en el mapa para marcar el lugar exacto
                            </p>

                            <div className="rounded-2xl overflow-hidden border border-green-500">
                                <MapContainer
                                    center={[-32.816, -61.394]}
                                    zoom={15}
                                    className="h-[300px] w-full"
                                >
                                    <TileLayer
                                        attribution="&copy; OpenStreetMap"
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <LocationPicker setSeletedPosition={setSeletedPosition} />
                                </MapContainer>
                            </div>
                            {selectedPosition && (
                                <p className="mt-3 text-sm text-green-400">
                                    Ubicación seleccionada: Lat {selectedPosition[0].toFixed(6)} | Lng{" "}
                                    {selectedPosition[1].toFixed(6)}
                                </p>
                            )}
                            {errors.position && (
                                <p className="text-red-400 text-sm mt-1">{errors.position}</p>
                            )}
                        </div>

                        <div className="border-t border-green-700 pt-4">
                            <h3 className="text-xl font-bold mb-2">Datos de la ubicación</h3>

                            <div>
                                <label className="block mb-2 font-semibold">Domicilio del reclamo</label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl bg-black border border-green-700 focus:border-blue-500 px-4 py-3 outline-none"
                                    placeholder="Ej: calle y número aproximado"
                                    name="claimAddress"
                                    value={formData.claimAddress}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mt-4">
                                <label className="block mb-2 font-semibold">Barrio o Zona</label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl bg-black border border-green-700 focus:border-blue-500 px-4 py-3 outline-none"
                                    placeholder="Ej: centro, zona norte, barrio..."
                                    name="neighborhood"
                                    value={formData.neighborhood}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="border-t border-green-700 pt-4">
                            <h3 className="text-xl font-bold mb-2">Tus datos de contacto</h3>
                            <p className="text-sm text-gray-300 mb-4">
                                Estos datos nos ayudan a hacer seguimiento del reclamo y contactarte si hay novedades.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-2 font-semibold">Nombre</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl bg-black border border-green-700 focus:border-blue-500 px-4 py-3 outline-none"
                                        placeholder="Tu Nombre"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold">Apellido</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl bg-black border border-green-700 focus:border-blue-500 px-4 py-3 outline-none"
                                        placeholder="Tu Apellido"
                                        name="lastname"
                                        value={formData.lastname}
                                        onChange={handleChange}
                                    />
                                    {errors.lastname && <p className="text-red-400 text-sm mt-1">{errors.lastname}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block mb-2 font-semibold">Teléfono</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl bg-black border border-green-700 focus:border-blue-500 px-4 py-3 outline-none"
                                        placeholder="Ej: 3471..."
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                    {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                                </div>
                                <div>
                                    <label className="block mb-2 font-semibold">Email</label>
                                    <input
                                        type="email"
                                        className="w-full rounded-xl bg-black border border-green-700 focus:border-blue-500 px-4 py-3 outline-none"
                                        placeholder="tuemail@email.com"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />

                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block mb-2 font-semibold">Domicilio del reclamante</label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl bg-black border border-green-700 focus:border-blue-500 px-4 py-3 outline-none"
                                    placeholder="Tu domicilio"
                                    name="claimantAddress"
                                    value={formData.claimantAddress}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mt-4">
                                <label className="block mb-2 font-semibold">DNI</label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl bg-black border border-green-700 focus:border-blue-500 px-4 py-3 outline-none"
                                    placeholder="Opcional"
                                    name="dni"
                                    value={formData.dni}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl"
                        >
                            Enviar Reclamo
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
