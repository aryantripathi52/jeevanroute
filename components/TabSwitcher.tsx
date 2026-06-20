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
    <div className="flex gap-1 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`py-3 px-6 font-medium transition-all ${
            activeTab === tab
              ? 'border-b-2 border-red-500 text-red-500'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
