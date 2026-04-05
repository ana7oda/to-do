import { useEffect, useState } from 'react'

export default function NotificationWindow() {
  const [taskText, setTaskText] = useState('جاري تحميل المهمة...')

  useEffect(() => {
    // استقبال اسم المهمة من الويندوز
    // @ts-ignore
    if (window.api && window.api.onNotificationData) {
      // @ts-ignore
      window.api.onNotificationData((data: string) => {
        setTaskText(data)
      })
    }
  }, [])

  return (
    <div className="h-screen w-screen p-2 box-border flex items-center justify-center overflow-hidden bg-transparent">
      <div className="bg-gray-900 border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] rounded-xl p-4 w-full h-full flex items-center gap-4 relative overflow-hidden backdrop-blur-md">
        
        <div className="bg-blue-500/20 text-blue-400 w-10 h-10 flex items-center justify-center rounded-full text-xl shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
          🔔
        </div>

        {/* النصوص */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <span className="text-[11px] text-blue-400 font-bold mb-1 tracking-wide">🚀 ODEXAI REMINDER</span>
          <span className="text-sm text-white font-medium truncate drop-shadow-md">
            {taskText}
          </span>
        </div>

        {/* شريط التقدم اللي بيصغر تحت (بيخلص في 6 ثواني) */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-purple-500 progress-shrink"
        ></div>
      </div>
    </div>
  )
}