import { useEffect, useState } from 'react'
import { Task } from '../App'

type ArchivedTask = Task & { archivedAt: string }

export default function HistoryList() {
  const [history, setHistory] = useState<ArchivedTask[]>([])

  useEffect(() => {
    // جلب المهام من الذاكرة المحلية
    const saved = JSON.parse(localStorage.getItem('odexai-history') || '[]')
    // ترتيب من الأحدث للأقدم
    saved.sort((a: ArchivedTask, b: ArchivedTask) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime())
    setHistory(saved)
  }, [])

  // تجميع المهام حسب اليوم عشان نعرضهم كـ Timeline
  const groupedHistory = history.reduce((acc, task) => {
    const date = new Date(task.archivedAt).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })
    if (!acc[date]) acc[date] = []
    acc[date].push(task)
    return acc
  }, {} as Record<string, ArchivedTask[]>)

  const getPriorityColor = (priority?: string) => {
    switch(priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-700/50 text-gray-400 border-gray-600/50'
    }
  }

  // لو مفيش مهام خالص
  if (history.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-sm">
        <span className="text-4xl mb-3 opacity-50">📭</span>
        <p>مفيش مهام في الأرشيف لسه!</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pr-1 space-y-5 custom-scrollbar">
      {Object.entries(groupedHistory).map(([date, tasks]) => (
        <div key={date} className="relative">
          {/* عنوان اليوم */}
          <div className="sticky top-0 bg-gray-900/95 py-1.5 mb-2 z-10 border-b border-gray-700/50 backdrop-blur-md">
            <span className="text-[11px] font-bold text-blue-400">{date}</span>
          </div>
          
          {/* مهام اليوم ده */}
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="flex items-start gap-2 bg-gray-800/30 p-2.5 rounded-lg border border-gray-700/30">
                <span className="text-green-500 mt-0.5 text-xs">✔</span>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-sm text-gray-400 line-through decoration-gray-600 truncate">{task.text}</span>
                  
                  {/* عرض التاجز (القسم والأولوية) عشان تفتكر المهمة كانت إيه */}
                  {(task.category || task.priority) && (
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {task.category && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-300">
                          {task.category}
                        </span>
                      )}
                      {task.priority && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'high' ? 'عاجلة' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}