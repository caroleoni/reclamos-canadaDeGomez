import toast from 'react-hot-toast';
import logoCanada from '../assets/logoCanada.jpeg';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {

    const mapUrl = "https://reclamos-canada-de-gomez.vercel.app/";

    const shareText = "Mirá este mapa de reclamos ciudadanos de Cañada de Gómez:";

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${mapUrl}`)}`;

    const facebookUrl = `https://www.facebook.com/sharer.php?u=${encodeURIComponent(mapUrl)}`

    async function handleCopyInstagram() {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(mapUrl);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = mapUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
            }
            toast.success("Link copiado. Pegalo en Instagram Stories o bio.", {
                duration: 6000,
            });

        } catch (error) {
            toast.error("No se pudo copiar el link", error);
        }
    }

    return (
        <footer className="w-full bg-slate-950 text-green-300 border-t-4 border-blue-500">
            <div className="max-w-6xl mx-auto px-6 py-8 text-center">
                {/* Logo */}
                <img
                    src={logoCanada}
                    alt='Trabajando por Cañada'
                    className='w-16 h-16 mx-auto mb-4 rounded-full bg-white p-1'
                />
                {/* Titulo */}
                <p className='text-lg font-semibold text-green-500 mb-2'>
                    Trabajando por Cañada de Gómez
                </p>
                <p className='text-sm text-gray-400 mb-4'>
                    Plataforma de reclamos ciudadanos para mejorar tu barrio.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                    Compartí el mapa y ayudá a visibilizar los reclamos ciudadanos.
                </p>


                {/* Redes Sociales */}
                <div className='flex justify-center gap-6 mt-4 mb-4'>
                    <button
                        onClick={handleCopyInstagram}
                        className="bg-gray-800 p-3 rounded-full hover:bg-green-500 hover:text-black transition"
                    >
                        <FaInstagram />
                    </button>
                    <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-gray-800 p-3 rounded-full hover:bg-green-500 hover:text-black transition"
                    >
                        <FaFacebook />
                    </a>
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-gray-800 p-3 rounded-full hover:bg-green-500 hover:text-black transition"
                    >
                        <FaWhatsapp />
                    </a>
                </div>
                {/* Linea */}
                <div className='border-t border-gray-700 my-4'></div>

                {/* COPYRIGHT */}
                <p className='text-xs text-gray-500'>
                    © {new Date().getFullYear()} - Todos los derechos reservados
                </p>
            </div>
        </footer>
    )
}
