import { ScoredHospital } from '@/lib/supabase'

export default function HospitalCard({ hospital, onClick }: { hospital: ScoredHospital; onClick?: () => void }) {
  return (
    <div
      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-red-300 hover:bg-gray-50 transition-all"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-black text-lg">{hospital.name}</h3>
          <p className="text-gray-500 text-sm mt-1">{hospital.address}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-green-600">{hospital.score}%</div>
          <div className="text-gray-400 text-xs">Match</div>
        </div>
      </div>
      <div className="flex gap-6 mt-4 text-sm">
        <div>
          <span className="text-gray-500">Distance:</span>
          <span className="text-black ml-1">{hospital.distance_km.toFixed(1)} km</span>
        </div>
        <div>
          <span className="text-gray-500">ETA:</span>
          <span className="text-black ml-1">{hospital.eta_minutes} mins</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {hospital.specialties.map((specialty, index) => (
          <span
            key={index}
            className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
          >
            {specialty}
          </span>
        ))}
      </div>
    </div>
  )
}
