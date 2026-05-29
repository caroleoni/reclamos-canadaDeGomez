import logoCanada from '../assets/logoCanada.jpeg';

export default function Header() {
  return (
    <header className="bg-slate-950 text-white py-8 px-6 text-center border-b-4 border-blue-500">
      <img  
        src={logoCanada}
        alt='Trabajando por Cañada'
        className='w-36 h-36 object-contain mx-auto mb-4 rounded-full bg-white p-1 shadow-lg'
      />
        <h1 className="text-4xl font-bold mb-3 text-green-500">
            ¿Qué necesita tu barrio?
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-300">
          Este mapa permite visualizar reclamos ciudadanos y cargar nuevos
          reportes con ubicación, categoría y foto.
        </p>
    </header>
  )
}
