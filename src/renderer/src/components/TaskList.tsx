import { useRef, useState, useEffect } from 'react'
import { Task } from '../App'

function TaskList({ tasks, onToggle, onDelete, onReorder, onUpdateDetails }: { 
  tasks: Task[], 
  onToggle: (id: number) => void,
  onDelete: (id: number) => void,
  onReorder: (tasks: Task[]) => void,
  onUpdateDetails: (id: number, startTime: string, endTime: string, priority?: 'high'|'medium'|'low', category?: string) => void
}) {
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)
  
  const [editingTimeId, setEditingTimeId] = useState<number | null>(null)
  const [tempStart, setTempStart] = useState('')
  const [tempEnd, setTempEnd] = useState('')
  const [tempPriority, setTempPriority] = useState<'high'|'medium'|'low'|undefined>(undefined)
  const [tempCategory, setTempCategory] = useState('')

  // 🌟 مراقب الوقت الخاص بشريط التقدم
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 10000) // يتحدث كل 10 ثواني
    return () => clearInterval(interval)
  }, [])

  // 🌟 دالة حساب نسبة التقدم المئوية
  const calculateProgress = (start?: string, end?: string) => {
    if (!start || !end) return 0
    const [startH, startM] = start.split(':').map(Number)
    const [endH, endM] = end.split(':').map(Number)
    
    // تحويل الوقت لدقائق عشان الحساب يكون دقيق
    const startMin = startH * 60 + startM
    const endMin = endH * 60 + endM
    const currentMin = now.getHours() * 60 + now.getMinutes()

    if (endMin <= startMin) return 0 // لو وقت النهاية قبل البداية (خطأ إدخال)
    if (currentMin <= startMin) return 0 // لسه مبدأناش
    if (currentMin >= endMin) return 100 // الوقت خلص

    // حساب النسبة المئوية
    return ((currentMin - startMin) / (endMin - startMin)) * 100
  }

  const handleSort = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const tasksClone = [...tasks]
      const temp = tasksClone[dragItem.current]
      tasksClone.splice(dragItem.current, 1)
      tasksClone.splice(dragOverItem.current, 0, temp)
      onReorder(tasksClone)
    }
  }

  // دالة لتحديد لون الإطار حسب الأولوية
  const getPriorityBorder = (priority?: string) => {
    switch(priority) {
      case 'high': return 'border-r-4 border-r-red-500'
      case 'medium': return 'border-r-4 border-r-yellow-500'
      case 'low': return 'border-r-4 border-r-green-500'
      default: return 'border-r-4 border-r-transparent'
    }
  }

  return (
    <div className="flex-1 overflow-y-auto pr-1">
      {tasks.map((task, index) => (
        <div 
          key={task.id}
          draggable
          onDragStart={() => (dragItem.current = index)}
          onDragEnter={() => (dragOverItem.current = index)}
          onDragEnd={handleSort}
          onDragOver={(e) => e.preventDefault()}
          className={`group flex flex-col bg-gray-800/40 p-3 rounded-lg mb-2 border border-gray-700/30 hover:bg-gray-800/60 transition-colors cursor-grab active:cursor-grabbing ${getPriorityBorder(task.priority)}`}
        >
          
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3 flex-1 overflow-hidden" onClick={() => onToggle(task.id)}>
              <input 
                type="checkbox" 
                checked={task.done} 
                onChange={() => {}} 
                className="w-4 h-4 accent-blue-500 cursor-pointer pointer-events-none shrink-0" 
              />
              <div className="flex flex-col flex-1 overflow-hidden">
                
                {/* عرض القسم فوق المهمة لو موجود */}
                {task.category && (
                  <span className="bg-gray-700/80 text-gray-300 w-max text-[9px] px-1.5 py-0.5 rounded mb-0.5 mt-[-4px]">
                    {task.category}
                  </span>
                )}

                <span className={`text-sm select-none truncate ${task.done ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                  {task.text}
                </span>
                
                {(task.startTime || task.endTime) && (
                  <span className={`text-[10px] mt-0.5 select-none ${task.done ? 'text-gray-600' : 'text-gray-400'}`}>
                    {task.startTime && <span className="text-blue-400">بدء: {task.startTime}</span>}
                    {task.startTime && task.endTime && <span className="mx-1">|</span>}
                    {task.endTime && <span className="text-red-400">انتهاء: {task.endTime}</span>}
                  </span>
                )}

                {/* 🌟 شريط التقدم اللايف (يظهر لو فيه بداية ونهاية والمهمة لسه مخلصتش) */}
                {(task.startTime && task.endTime && !task.done) && (
                  <div className="w-full h-1 bg-gray-700/50 rounded-full mt-2 overflow-hidden shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 ease-linear ${
                        calculateProgress(task.startTime, task.endTime) >= 100 
                          ? 'bg-red-500 shadow-[0_0_5px_red]' // لو الوقت خلص بيحمر وينور
                          : 'bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_5px_blue]' // طول ما هو شغال بيبقى أزرق متدرج
                      }`}
                      style={{ width: `${calculateProgress(task.startTime, task.endTime)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  if (editingTimeId === task.id) {
                    setEditingTimeId(null)
                  } else {
                    setEditingTimeId(task.id)
                    setTempStart(task.startTime || '')
                    setTempEnd(task.endTime || '')
                    setTempPriority(task.priority)
                    setTempCategory(task.category || '')
                  }
                }}
                className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 p-1.5 rounded cursor-pointer outline-none"
                title="إعدادات المهمة"
              >
                ⚙️
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(task.id)
                }}
                className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1.5 rounded cursor-pointer outline-none"
              >
                ❌
              </button>
            </div>
          </div>

          {/* 🌟 واجهة الإعدادات المصغرة (صفين عشان تكفي كل حاجة) */}
          {editingTimeId === task.id && (
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-700/50 cursor-default" onClick={(e) => e.stopPropagation()}>
              
              {/* الصف الأول: الوقت */}
              <div className="flex items-center gap-2">
                <input type="time" value={tempStart} onChange={(e) => setTempStart(e.target.value)} className="bg-gray-900/80 text-[11px] rounded px-1.5 py-1 text-gray-200 outline-none border border-gray-600 focus:border-blue-500 [&::-webkit-calendar-picker-indicator]:invert flex-1" />
                <span className="text-gray-500 text-xs">-</span>
                <input type="time" value={tempEnd} onChange={(e) => setTempEnd(e.target.value)} className="bg-gray-900/80 text-[11px] rounded px-1.5 py-1 text-gray-200 outline-none border border-gray-600 focus:border-red-500 [&::-webkit-calendar-picker-indicator]:invert flex-1" />
              </div>

              {/* الصف الثاني: الأولوية، القسم، والحفظ */}
              <div className="flex items-center gap-2">
                <select 
                  value={tempPriority || ''} 
                  onChange={(e) => setTempPriority(e.target.value ? e.target.value as any : undefined)}
                  className="bg-gray-900/80 text-[10px] rounded px-1 py-1.5 text-gray-200 outline-none border border-gray-600 focus:border-blue-500 w-[75px]"
                >
                  <option value="">أولوية عادية</option>
                  <option value="high">🔴 عاجلة</option>
                  <option value="medium">🟡 متوسطة</option>
                  <option value="low">🟢 منخفضة</option>
                </select>

                <input 
                  type="text" 
                  value={tempCategory}
                  onChange={(e) => setTempCategory(e.target.value)}
                  placeholder="القسم (مثال: دراسة)"
                  className="bg-gray-900/80 text-[11px] rounded px-1.5 py-1 text-gray-200 outline-none border border-gray-600 focus:border-blue-500 flex-1 min-w-0"
                />

                <button 
                  onClick={() => {
                    onUpdateDetails(task.id, tempStart, tempEnd, tempPriority, tempCategory)
                    setEditingTimeId(null)
                  }}
                  className="bg-green-600/80 hover:bg-green-500 text-white text-[11px] px-2 py-1 rounded transition-colors shrink-0 outline-none"
                >
                  حفظ
                </button>
              </div>

            </div>
          )}

        </div>
      ))}   
    </div>
  )
}
export default TaskList