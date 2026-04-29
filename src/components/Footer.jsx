import logoCanada from '../assets/logoCanada.jpeg';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 text-green-300 border-t-4 border-blue-500">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
            {/* Logo */}
            <img 
                src={logoCanada}
                alt='Trabajando por Cañada'
                className='w-16 h-16 mx-auto mb-4 rounded-full bg-white p-1'
            />
            {/* Texto */}
            <p className='text-lg font-semibold text-green-500 mb-2'> 
                Trabajando por Cañada de Gómez
            </p>
            <p className='text-sm text-gray-400 mb-4'>
                Plataforma de reclamos ciudadanos para mejorar tu barrio.
            </p>
            

            {/* Redes Sociales */}
            <div className='flex justify-center gap-6 mt-4 mb-4'>
                <a
                    href="https://instagram.com/stellaclerici"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-gray-800 p-3 rounded-full hover:bg-green-500 hover:text-black transition"
                >
                    <FaInstagram/>
                </a>
                <a
                    href="https://www.facebook.com/stella.clerici.2025"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-gray-800 p-3 rounded-full hover:bg-green-500 hover:text-black transition"
                >
                    <FaFacebook/>
                </a>
                <a
                    href="https://wa.me/3471537482"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-gray-800 p-3 rounded-full hover:bg-green-500 hover:text-black transition"
                >
                    <FaWhatsapp/>
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
