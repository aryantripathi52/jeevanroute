import { ScoredHospital } from '@/lib/supabase'

export default function HospitalCard({ hospital, onClick }: { hospital: ScoredHospital; onClick?: () => void }) {
  return (
    <div
      className="glass-card p-4 cursor-pointer hover:bg-white/15 transition-all"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-white text-lg">{hospital.name}</h3>
          <p className="text-white/70 text-sm mt-1">{hospital.address}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">{hospital.score}%</div>
          <div className="text-white/70 text-xs">Match</div>
        </div>
      </div>
      <div className="flex gap-6 mt-4 text-sm">
        <div>
          <span className="text-white/70">Distance:</span>
          <span className="text-white ml-1">{hospital.distance_km.toFixed(1)} km</span>
        </div>
        <div>
          <span className="text-white/70">ETA:</span>
          <span className="text-white ml-1">{hospital.eta_minutes} mins</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {hospital.specialties.map((specialty, index) => (
          <span
            key={index}
            className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80"
          >
            {specialty}
          </span>
        ))}
      </div>
    </div>
  )
}
