function Header({ onClose, isCollapsed, onToggleCollapse, onArchive, showHistory, onToggleHistory }: { onClose: () => void, isCollapsed: boolean, onToggleCollapse: () => void, onArchive: () => void, showHistory?: boolean, onToggleHistory?: () => void }) {
  return (
    <div className={`drag-area flex justify-between items-center ${isCollapsed ? '' : 'mb-5 pb-2 border-b border-gray-700/50'}`}>
      <h2 className="text-sm font-bold text-blue-400 select-none">{showHistory ? 'أرشيف المهام' : 'OdexAi Tasks'}</h2>
      
      <div className="flex gap-3 no-drag items-center">
        
        {/* زرار السجل / الرئيسية */}
        {!isCollapsed && onToggleHistory && (
          <button 
            onClick={onToggleHistory} 
            className={`transition-colors cursor-pointer outline-none focus:outline-none text-sm ${showHistory ? 'text-blue-400 hover:text-blue-300' : 'text-gray-400 hover:text-blue-400'}`}
            title={showHistory ? "العودة للمهام الحالية" : "سجل المهام المكتملة"}
          >
            {showHistory ? (
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
                className="transition-transform duration-300"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            ) : (
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
                className="transition-transform duration-300"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
            )}
          </button>
        )}

        {/* زرار الأرشيف / يوم جديد (بيختفي لو إحنا جوه السجل) */}
        {!isCollapsed && !showHistory && (
          <button 
            onClick={onArchive} 
            className="text-gray-400 hover:text-green-400 transition-colors cursor-pointer outline-none focus:outline-none text-sm"
            title="أرشفة المهام المكتملة وبدء يوم جديد"
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
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          </button>
        )}

        {/* زرار الطي والفرد */}
        <button 
          onClick={onToggleCollapse} 
          className="text-gray-400 hover:text-blue-400 transition-colors cursor-pointer outline-none focus:outline-none flex items-center justify-center"
          title={isCollapsed ? "تكبير" : "تصغير"}
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
            className={`transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        
        {/* زرار الإخفاء */}
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