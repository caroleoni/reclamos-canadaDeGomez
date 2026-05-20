import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MapContainer, Marker, TileLayer, useMapEvent } from "react-leaflet";
import { crearReclamo, subirFotoReclamo, obtenerCategorias } from "../services/reclamosService";

const initialFormData = {
    description: '',
    categoryId: '',
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

const locationIcon = L.divIcon({
    html: `<div class="selected-location-pin">📍</div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
});

function LocationPicker({ selectedPosition, setSeletedPosition, setErrors }) {
    useMapEvent({
        click(e) {
            setSeletedPosition([e.latlng.lat, e.latlng.lng]);
            setErrors((prev) => ({
                ...prev,
                position: "",
            }));
        },
    });
    return selectedPosition ? <Marker position={selectedPosition} icon={locationIcon} /> : null;
};

export default function ComplaintModal({ isOpen, setIsOpen, selectedPosition, setSeletedPosition, addComplaint }) {
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [photoPreview, setPhotoPreview] = useState("");
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [numeroReclamo, setNumeroReclamo] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        async function cargarCategorias() {
            try {
                const data = await obtenerCategorias();
                setCategorias(data);

            } catch (error) {
                console.error(error);
                toast.error("No se pudieron cargar las categorías");
            }
        }
        cargarCategorias();
    }, []);

    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center -px-4">
                <div className="bg-slate-950 border border-green-600 text-white w-full max-w-md rounded-2xl p-6 shadow-2xl text-center">
                    <div className="text-5xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-green-400 mb-3">Reclamo enviado</h2>
                    <p className="text-green-300 mb-4">Tu número de seguimiento es: </p>
                    <div className="bg-black border border-green-500 rounded-2xl py-4 mb-6">
                        <p className="text-3xl font-extrabold tracking-wider text-green-400">
                            {numeroReclamo}
                        </p>
                    </div>
                    <p className="text-sm text-gray-400 mb-6">
                        Guardá este número para consultar el estado de tu reclamo.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(numeroReclamo);
                                toast.success("Número copiado");
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl"
                        >
                            Copiar número
                        </button>

                        <button
                            onClick={() => {
                                resetForm();
                                setIsOpen(false);
                            }}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        )
    }


    if (!isOpen) return null;

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
        setNumeroReclamo(null);
        setShowSuccess(false);
    };

    function validateForm() {
        const newErrors = {};

        if (!formData.description.trim()) {
            newErrors.description = "Por favor escribí una descripción."
        }
        if (!formData.categoryId.trim()) {
            newErrors.categoryId = "Por favor seleccioná una categoría."
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

    async function handleSubmit(e) {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const reclamoCreado = await crearReclamo({
                nombre_reclamante: formData.name,
                apellido_reclamante: formData.lastname,
                dni_reclamante: formData.dni || null,
                telefono_reclamante: formData.phone,
                email_reclamante: formData.email || null,
                domicilio_reclamante: formData.claimantAddress || null,

                categoria_id: formData.categoryId,
                descripcion: formData.description,
                domicilio_reclamo: formData.claimAddress || null,
                barrio_zona: formData.neighborhood || null,

                latitud: selectedPosition[0],
                longitud: selectedPosition[1],
            });

            if (formData.photo) {
                await subirFotoReclamo(reclamoCreado.id, formData.photo)
            }

            const categoriaSeleccionada = categorias.find(
                categoria => categoria.id === formData.categoryId
            );

            addComplaint({
                id: reclamoCreado.id,
                ...formData,
                category: categoriaSeleccionada?.nombre || "",
                categorySlug: categoriaSeleccionada?.slug || "",
                categoryIcon: categoriaSeleccionada?.icono || "more-horizontal",
                photoPreview,
                position: selectedPosition,
                createdAt: reclamoCreado.created_at,
                numeroReclamo: reclamoCreado.numero_reclamo,
            });

            setNumeroReclamo(reclamoCreado.numero_reclamo);

            toast.success(`Reclamo enviado. Número: ${reclamoCreado.numero_reclamo}`, {
                duration: 6000,
                position: 'top-right',
                iconTheme: { primary: '#000' },
            });
            // resetForm();
            // setIsOpen(false);
            setShowSuccess(true);

        } catch (error) {
            console.error(error);
            toast.error(error.message || "No se pudo enviar el reclamo");
        } finally {
            setLoading(false);
        }
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
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                            >

                                <option>Selecciona Categoria</option>
                                {
                                    categorias.map(categoria => (
                                        <option key={categoria.id} value={categoria.id}>
                                            {categoria.nombre}
                                        </option>
                                    ))
                                }

                            </select>
                            {errors.categoryId && (
                                <p className="text-red-400 text-sm mt-1">{errors.categoryId}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold">Foto <span className="text-gray-400">(Opcional)</span></label>
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
                                    <LocationPicker
                                        selectedPosition={selectedPosition}
                                        setSeletedPosition={setSeletedPosition}
                                        setErrors={setErrors}
                                    />
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
                                {/* <input
                                    type="text"
                                    className="w-full rounded-xl bg-black border border-green-700 focus:border-blue-500 px-4 py-3 outline-none"
                                    placeholder="Ej: centro, zona norte, barrio..."
                                    name="neighborhood"
                                    value={formData.neighborhood}
                                    onChange={handleChange}
                                /> */}
                                <select
                                    name="neighborhood"
                                    value={formData.neighborhood}
                                    onChange={handleChange}
                                    className="w-full rounded-xl bg-black border border-green-700 focus:border-blue-500 px-4 py-3 outline-none"
                                >
                                    <option value="">Seleccioná Barrio/Zona</option>
                                    <option value="centro">Centro</option>
                                    <option value="norte">Norte</option>
                                    <option value="sur">Sur</option>
                                </select>
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
                                    <label className="block mb-2 font-semibold">WhatsApp</label>
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
                                        placeholder="Opcional"
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

                        {
                            numeroReclamo && (
                                <div className="bg-green-100 text-green-900 p-4 rounded-xl">
                                    Reclamo registrado con éxito.
                                    <br />
                                    Número de seguimiento: <strong>{numeroReclamo}</strong>
                                </div>
                            )
                        }

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl"
                        >
                            {loading ? "Enviando..." : "Enviar Reclamo"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
