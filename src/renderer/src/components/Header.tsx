function Header({ 
  onClose, isCollapsed, onToggleCollapse, onArchive, showHistory, onToggleHistory, pomodoroTime, pomodoroMode, showSettings, onToggleSettings
}: { 
  onClose: () => void, isCollapsed: boolean, onToggleCollapse: () => void, onArchive: () => void, showHistory?: boolean, onToggleHistory?: () => void, pomodoroTime?: string, pomodoroMode?: 'work' | 'break' | 'idle', showSettings?: boolean, onToggleSettings?: () => void
}) {
  return (
    <div className={`drag-area flex justify-between items-center ${isCollapsed ? '' : 'mb-5 pb-2 border-b border-gray-700/50'}`}>
      <h2 className="text-sm font-bold text-blue-400 select-none flex items-center gap-2">
        {showHistory ? 'أرشيف المهام' : showSettings ? 'الإعدادات' : 'OdexAi Tasks'}
        
        {/* 🌟 عداد البومودورو المصغر بيظهر لو النافذة مطوية وفي جلسة شغالة */}
        {isCollapsed && pomodoroMode && pomodoroMode !== 'idle' && (
          <span className={`text-xs px-2 py-0.5 rounded font-mono ${pomodoroMode === 'work' ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
            ⏱ {pomodoroTime}
          </span>
        )}
      </h2>    

      <div className="flex gap-3 no-drag items-center">
        
        {/* 🌟 زرار الإعدادات */}
        {!isCollapsed && onToggleSettings && !showHistory && (
          <button 
            onClick={onToggleSettings} 
            className={`transition-colors cursor-pointer outline-none focus:outline-none text-sm ${showSettings ? 'text-blue-400 hover:text-blue-300' : 'text-gray-400 hover:text-blue-400'}`}
            title={showSettings ? "العودة للمهام" : "الإعدادات"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${showSettings ? 'rotate-90' : ''}`}
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        )}

        {/* 🌟 زرار السجل / الرئيسية (بيختفي لو الإعدادات مفتوحة) */}
        {!isCollapsed && onToggleHistory && !showSettings && (
          <button 
            onClick={onToggleHistory} 
            className={`transition-colors cursor-pointer outline-none focus:outline-none text-sm ${showHistory ? 'text-blue-400 hover:text-blue-300' : 'text-gray-400 hover:text-blue-400'}`}
            title={showHistory ? "العودة للمهام الحالية" : "سجل المهام المكتملة"}
          >
            {showHistory ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
            )}
          </button>
        )}

        {/* 🌟 زرار الأرشيف (بيختفي لو إحنا جوه السجل أو الإعدادات) */}
        {!isCollapsed && !showHistory && !showSettings && (
          <button 
            onClick={onArchive} 
            className="text-gray-400 hover:text-green-400 transition-colors cursor-pointer outline-none focus:outline-none text-sm"
            title="أرشفة المهام المكتملة وبدء يوم جديد"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          </button>
        )}

        {/* 🌟 زرار الطي والفرد */}
        <button 
          onClick={onToggleCollapse} 
          className="text-gray-400 hover:text-blue-400 transition-colors cursor-pointer outline-none focus:outline-none flex items-center justify-center"
          title={isCollapsed ? "تكبير" : "تصغير"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        
        {/* 🌟 زرار الإخفاء */}
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer text-xl leading-none outline-none focus:outline-none"
          title="إخفاء"
        >
          ×
        </button>
      </div>
    </div>
  )
}
export default Header