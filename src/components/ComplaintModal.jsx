import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvent } from "react-leaflet";
import { createClaim, getCategories, uploadClaimPhoto } from "../services/claimsService";

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
    iconSize: [46, 46],
    iconAnchor: [23, 46],
    popupAnchor: [0, -46],
});

const CITY_CONTEXT = "Cañada de Gómez, Santa Fe, Argentina";
const MAP_SEARCH_CENTER = { lat: -32.816, lon: -61.394 };

function cleanAddressText(value) {
    return value.trim().replace(/\s+/g, " ");
}

function parseIntersection(address) {
    const cleanAddress = cleanAddressText(address);
    const parts = cleanAddress
        .split(/\s+(?:y|e)\s+|\s+esquina\s+/i)
        .map(part => part.trim())
        .filter(Boolean);

    if (parts.length < 2) return null;

    return {
        firstStreet: parts[0],
        secondStreet: parts[1],
    };
}

function formatPhotonLabel(item) {
    const props = item.properties || {};
    return [
        props.name,
        props.street,
        props.housenumber,
        props.city,
    ].filter(Boolean).join(", ");
}

function mapPhotonFeature(item, fallbackLabel = "") {
    const coordinates = item.geometry?.coordinates;
    if (!coordinates || coordinates.length < 2) return null;

    const [lng, lat] = coordinates;
    const label = formatPhotonLabel(item) || fallbackLabel;

    if (!label || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
        return null;
    }

    return {
        label,
        lat: Number(lat),
        lng: Number(lng),
    };
}

function uniqueSuggestions(suggestions) {
    const seenLabels = new Set();
    const seenPositions = new Set();

    return suggestions.filter(suggestion => {
        if (!suggestion?.label) return false;

        const labelKey = suggestion.label.toLowerCase();
        const positionKey = `${suggestion.lat.toFixed(5)}|${suggestion.lng.toFixed(5)}`;

        if (seenLabels.has(labelKey) || seenPositions.has(positionKey)) return false;
        seenLabels.add(labelKey);
        seenPositions.add(positionKey);
        return true;
    });
}

async function fetchPhotonSuggestions(query, limit = 5) {
    const params = new URLSearchParams({
        q: query,
        limit: String(limit),
        lat: String(MAP_SEARCH_CENTER.lat),
        lon: String(MAP_SEARCH_CENTER.lon),
    });

    const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`);
    const data = await response.json();

    return data.features || [];
}

function LocationPicker({ selectedPosition, setSelectedPosition, setErrors, setShowAddressSuggestions }) {
    useMapEvent({
        click(e) {
            setSelectedPosition([e.latlng.lat, e.latlng.lng]);
            setShowAddressSuggestions(false);
            setErrors((prev) => ({
                ...prev,
                position: "",
                claimAddress: "",
            }));
        },
    });
    return selectedPosition ? <Marker position={selectedPosition} icon={locationIcon} /> : null;
};

//Para la ubicacion automatica del mapa. Esto hace que el mapa se mueva automáticamente al pin.
function MapAutoFocus({ selectedPosition }) {
    const map = useMap();

    useEffect(() => {
        if (selectedPosition) {
            map.flyTo(selectedPosition, 17, {
                animate: true,
                duration: 1
            });
        }
    }, [selectedPosition, map]);

    return null;
}

export default function ComplaintModal({ isOpen, setIsOpen, selectedPosition, setSelectedPosition, addComplaint }) {
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [photoPreview, setPhotoPreview] = useState("");
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    //es para la busqueda manual en el mapa.
    const [searchingLocation, setSearchingLocation] = useState(false);
    //para la busca automatica en el mapa
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
    const addressBoxRef = useRef(null);

    const [claimNumber, setClaimNumber] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        async function loadCategories() {
            try {
                const data = await getCategories();
                setCategories(data);

            } catch (error) {
                console.error(error);
                toast.error("No se pudieron cargar las categorías");
            }
        }
        loadCategories();
    }, []);

    useEffect(() => {
        function handleClickOutside(e) {
            if (addressBoxRef.current && !addressBoxRef.current.contains(e.target)) {
                setShowAddressSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
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
                            {claimNumber}
                        </p>
                    </div>
                    <p className="text-sm text-gray-400 mb-6">
                        Guardá este número para consultar el estado de tu reclamo.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(claimNumber);
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
            if (name === "claimAddress") {
                setErrors(prev => ({
                    ...prev,
                    claimAddress: ""
                }));
                searchAddressSuggestions(value);
            }
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
        setSelectedPosition(null);
        setErrors({});
        setPhotoPreview("");
        setClaimNumber(null);
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

    async function searchAddressSuggestions(address) {
        const cleanAddress = cleanAddressText(address);

        if (cleanAddress.length < 3) {
            setAddressSuggestions([]);
            setShowAddressSuggestions(false);
            return;
        }
        try {
            const cleanSuggestions = await getAddressSuggestions(cleanAddress);

            setAddressSuggestions(cleanSuggestions);
            setShowAddressSuggestions(cleanSuggestions.length > 0);

        } catch (error) {
            console.error(error);
            setAddressSuggestions([]);
            setShowAddressSuggestions(false);

        }
    }

    async function getAddressSuggestions(address) {
        const cleanAddress = cleanAddressText(address);
        const intersection = parseIntersection(cleanAddress);
        let suggestions = [];

        if (intersection) {
            const { firstStreet, secondStreet } = intersection;
            const [firstStreetFeatures, secondStreetFeatures, combinedFeatures] = await Promise.all([
                fetchPhotonSuggestions(`${firstStreet}, ${CITY_CONTEXT}`, 4),
                fetchPhotonSuggestions(`${secondStreet}, ${CITY_CONTEXT}`, 4),
                fetchPhotonSuggestions(`${firstStreet} y ${secondStreet}, ${CITY_CONTEXT}`, 4),
            ]);
            const firstStreetSuggestion = mapPhotonFeature(firstStreetFeatures[0], firstStreet);
            const secondStreetSuggestion = mapPhotonFeature(secondStreetFeatures[0], secondStreet);
            const combinedSuggestions = combinedFeatures
                .map(item => mapPhotonFeature(item))
                .filter(Boolean);

            if (firstStreetSuggestion && secondStreetSuggestion) {
                suggestions.push({
                    label: `${firstStreet} y ${secondStreet}, ${CITY_CONTEXT} (aproximado)`,
                    lat: (firstStreetSuggestion.lat + secondStreetSuggestion.lat) / 2,
                    lng: (firstStreetSuggestion.lng + secondStreetSuggestion.lng) / 2,
                });
            }

            suggestions = [
                ...suggestions,
                ...combinedSuggestions,
                firstStreetSuggestion,
                secondStreetSuggestion,
            ].filter(Boolean);
        } else {
            const features = await fetchPhotonSuggestions(`${cleanAddress}, ${CITY_CONTEXT}`, 6);
            suggestions = features
                .map(item => mapPhotonFeature(item))
                .filter(Boolean);
        }

        return uniqueSuggestions(suggestions);
    }

    async function handleSearchLocation() {
        setShowAddressSuggestions(false);

        if (!formData.claimAddress.trim()) {
            setErrors((prev) => ({
                ...prev,
                claimAddress: "Por favor escribí un domicilio para buscarlo en el mapa."
            }));
            return;
        }
        setSearchingLocation(true);

        try {
            const suggestions = await getAddressSuggestions(formData.claimAddress);
            const bestSuggestion = suggestions[0];

            if (!bestSuggestion) {
                setErrors((prev) => ({
                    ...prev,
                    claimAddress: "No se encontró esa dirección. Probá con otra o marcá la ubicación manualmente en el mapa."
                }));
                return;
            }

            setFormData(prev => ({
                ...prev,
                claimAddress: bestSuggestion.label,
            }));
            setSelectedPosition([bestSuggestion.lat, bestSuggestion.lng]);

            setErrors((prev) => ({
                ...prev,
                position: "",
                claimAddress: "",
            }));

            toast.success("Ubicación encontrada. Verificá que el pin esté en el lugar correcto.");

        } catch (error) {
            console.error(error);
            toast.error("No se pudo buscar la dirección. Probá con otra o marcá la ubicación manualmente en el mapa.");
        } finally {
            setSearchingLocation(false);
        }


    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const createdClaim = await createClaim({
                claimantFirstName: formData.name,
                claimantLastName: formData.lastname,
                claimantDni: formData.dni || null,
                claimantPhone: formData.phone,
                claimantEmail: formData.email || null,
                claimantAddress: formData.claimantAddress || null,
                categoryId: formData.categoryId,
                description: formData.description,
                claimAddress: formData.claimAddress || null,
                neighborhood: formData.neighborhood || null,
                latitude: selectedPosition[0],
                longitude: selectedPosition[1],
            });

            if (formData.photo) {
                await uploadClaimPhoto(createdClaim.id, formData.photo)
            }

            const selectedCategory = categories.find(
                category => category.id === formData.categoryId
            );

            addComplaint({
                id: createdClaim.id,
                ...formData,
                category: selectedCategory?.name || "",
                categorySlug: selectedCategory?.slug || "",
                categoryIcon: selectedCategory?.icon || "more-horizontal",
                photoPreview,
                position: selectedPosition,
                createdAt: createdClaim.createdAt,
                claimNumber: createdClaim.claimNumber,
            });

            setClaimNumber(createdClaim.claimNumber);

            toast.success(`Reclamo enviado. Número: ${createdClaim.claimNumber}`, {
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
                                    categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
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

                        <div className="border-t border-green-700 pt-4">
                            <h3 className="text-xl font-bold mb-2">Datos de la ubicación</h3>

                            <div className="mt-4">
                                <label className="block mb-2 font-semibold">Barrio o Zona</label>
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

                            <div className="mt-4 relative" ref={addressBoxRef}>
                                <label className="block mb-2 font-semibold">Domicilio del reclamo</label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl bg-black border border-green-700 focus:border-blue-500 px-4 py-3 outline-none"
                                    placeholder="Ej: calle y número aproximado"
                                    name="claimAddress"
                                    value={formData.claimAddress}
                                    onChange={handleChange}
                                    onFocus={() => {
                                        if (addressSuggestions.length > 0) setShowAddressSuggestions(true);
                                    }}
                                />

                                {
                                    showAddressSuggestions && addressSuggestions.length > 0 && (
                                        <div className="mt-2 bg-black border border-green-700 rounded-xl overflow-hidden">
                                            {
                                                addressSuggestions.map((suggestion, index) => (
                                                    <button
                                                        type="button"
                                                        key={index}
                                                        onClick={() => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                claimAddress: suggestion.label,
                                                            }));
                                                            setSelectedPosition([suggestion.lat, suggestion.lng]);
                                                            setShowAddressSuggestions(false);

                                                            setErrors((prev) => ({
                                                                ...prev,
                                                                position: "",
                                                                claimAddress: "",
                                                            }));
                                                            toast.success("Ubicación seleccionada. Verificá que el pin esté en el lugar correcto.", {
                                                                duration: 4000,
                                                            });
                                                        }}
                                                        className="w-full text-flex px-4 py-3 hover:bg-slate-800 border-b border-slate-800 last:border-b-0"
                                                    >
                                                        {suggestion.label || "Ubicación encontrada"}
                                                    </button>

                                                ))
                                            }
                                        </div>
                                    )
                                }

                                {
                                    errors.claimAddress && (
                                        <p className="text-red-400 text-sm mt-1">{errors.claimAddress}</p>
                                    )
                                }
                                <button
                                    type="button"
                                    onClick={handleSearchLocation}
                                    disabled={searchingLocation}
                                    className="mt-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-4 py-3 rounded-xl"
                                >
                                    {searchingLocation ? "Buscando..." : "Buscar ubicación en el mapa"}
                                </button>
                            </div>

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

                                    <MapAutoFocus selectedPosition={selectedPosition} />

                                    <LocationPicker
                                        selectedPosition={selectedPosition}
                                        setSelectedPosition={setSelectedPosition}
                                        setErrors={setErrors}
                                        setShowAddressSuggestions={setShowAddressSuggestions}
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
                            claimNumber && (
                                <div className="bg-green-100 text-green-900 p-4 rounded-xl">
                                    Reclamo registrado con éxito.
                                    <br />
                                    Número de seguimiento: <strong>{claimNumber}</strong>
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
