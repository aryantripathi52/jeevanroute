export default function TabSwitcher({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: string[]
  activeTab: string
  setActiveTab: (tab: string) => void
}) {
  return (
    <div className="flex gap-2 p-1 glass-card">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === tab
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
