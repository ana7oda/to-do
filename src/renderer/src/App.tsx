import { useState, useEffect } from 'react'
import Header from './components/Header'
import TaskInput from './components/TaskInput'
import TaskList from './components/TaskList'
import HistoryList from './components/HistoryList'

export type Task = { id: number; text: string; done: boolean; startTime?: string; endTime?: string; notified?: boolean; priority?: 'high' | 'medium' | 'low'; category?: string }

function App(): React.JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false) // حالة النافذة (مطوية ولا لأ)
  const [showHistory, setShowHistory] = useState(false) // حالة عرض السجل
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('odexai-tasks')
    if (savedTasks) {
      return JSON.parse(savedTasks)
    }
    return []
  })

  useEffect(() => {
    localStorage.setItem('odexai-tasks', JSON.stringify(tasks))
  }, [tasks])

  // دالة تشغيل الأصوات
  const playSound = (sound: string) => {
    // استخدمنا مسار مباشر لأن الملفات هتتحط في فولدر public
    const audio = new Audio(`./${sound}.mp3`)
    audio.play().catch(e => console.log('ملف الصوت مش موجود:', e))
  }

// مراقب الوقت
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

      let hasUpdates = false
      const updatedTasks = tasks.map(task => {
        // نتحقق من وقت البدء startTime
        if (!task.done && task.startTime === currentTime && !task.notified) {
          playSound('alarm')
          // 🌟 استدعاء نافذة الإشعار المخصصة بدلاً من إشعار الويندوز
          // @ts-ignore
          window.api.showNotification(task.text)
          hasUpdates = true
          return { ...task, notified: true } 
        }
        return task
      })

      if (hasUpdates) setTasks(updatedTasks)
    }, 10000)

    return () => clearInterval(interval)
  }, [tasks])

  // رجعنا دالة الإضافة إنها تقبل النص بس عشان السرعة
  const addTask = (text: string) => {
    if (!text.trim()) return
    const newTask = { id: Date.now(), text, done: false, notified: false }
    setTasks([...tasks, newTask])
    playSound('add')
  }

  // دالة تحديث شاملة (وقت، أولوية، قسم)
  const updateTaskDetails = (id: number, startTime: string, endTime: string, priority?: 'high'|'medium'|'low', category?: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, startTime, endTime, priority, category, notified: false } : t))
  }

  // 🌟 دالة الأرشيف (بتحفظ المهام المكتملة وتمسحها من القائمة)
  const archiveCompletedTasks = () => {
    const completed = tasks.filter(t => t.done)
    
    if (completed.length === 0) {
      // 🌟 التعديل هنا: طلع تنبيه بدل ما البرنامج يتجاهل الضغطة
      alert('مفيش مهام مكتملة لأرشفتها! 🎯 \nعلم (✔) على المهام اللي خلصتها الأول عشان تبدأ يوم جديد بنظافة.')
      return
    }

    // حفظ في الذاكرة المخصصة للأرشيف
    const existingHistory = JSON.parse(localStorage.getItem('odexai-history') || '[]')
    const newHistory = [...existingHistory, ...completed.map(t => ({ ...t, archivedAt: new Date().toISOString() }))]
    localStorage.setItem('odexai-history', JSON.stringify(newHistory))

    // إبقاء المهام غير المكتملة فقط
    setTasks(tasks.filter(t => !t.done))
    playSound('delete') // ممكن نغيره لصوت أرشيف بعدين
  }

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        if (!t.done) playSound('done') // شغل صوت النجاح لو بنعلم عليها صح بس
        return { ...t, done: !t.done }
      }
      return t
    }))
  }

  // دالة مسح المهمة
  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id))
    playSound('delete') // تشغيل صوت الحذف
  }

  // دالة تحديث المهام بعد السحب والإفلات (الترتيب)
  const reorderTasks = (newTasks: Task[]) => {
    setTasks(newTasks)
  }

  // الدالة الجديدة للإخفاء
  const hideApp = () => {
    // @ts-ignore
    window.api.hideWindow()
  }

  // دالة الطي والفرد
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    // @ts-ignore
    window.api.toggleCollapse(newState)
  }

  return (
    <div className="bg-gray-900/90 text-white h-screen rounded-2xl p-4 shadow-2xl flex flex-col overflow-hidden border border-gray-700/50 backdrop-blur-sm transition-all duration-300">
      <Header 
        onClose={hideApp} 
        isCollapsed={isCollapsed} 
        onToggleCollapse={toggleCollapse} 
        onArchive={archiveCompletedTasks} 
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory(!showHistory)}
      />
      
      {/* مش هنظهر المهام وحقل الإدخال إلا لو النافذة مفتوحة */}
      {!isCollapsed && (
        <>
          {showHistory ? (
            <HistoryList />
          ) : (
            <>
              <TaskInput onAdd={addTask} />
              <TaskList 
                tasks={tasks} 
                onToggle={toggleTask} 
                onDelete={deleteTask} 
                onReorder={reorderTasks} 
                onUpdateDetails={updateTaskDetails} 
              />
            </>
          )}
        </>
      )}
    </div>
  )
}

export default App