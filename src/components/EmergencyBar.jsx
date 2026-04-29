
export default function EmergencyBar() {
  return (
    <div className="bg-green-700 text-white text-sm py-2 px-4 border-b border-blue-500">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-4">
            <span>Emergencias: 911</span>
            <span>Bomberos: 100</span>
            <span>Salud: 107</span>
            <span>Policía: 101</span>
        </div>
    </div>
  )
}
