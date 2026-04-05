import { useState, useEffect } from 'react'
import Header from './components/Header'
import TaskInput from './components/TaskInput'
import TaskList from './components/TaskList'
import HistoryList from './components/HistoryList'
import Settings from './components/Settings' // 🌟 الاستدعاء الجديد
import { usePomodoro } from './hooks/usePomodoro'
import PomodoroTimer from './components/PomodoroTimer'
import { supabase } from './supabaseClient' // 🌟 استدعاء السحابة
import type { Session } from '@supabase/supabase-js' // 🌟 نوع جلسة المستخدم

export type Task = { id: number; text: string; done: boolean; startTime?: string; endTime?: string; notified?: boolean; priority?: 'high' | 'medium' | 'low'; category?: string; user_id?: string }


function App(): React.JSX.Element {
  // 🌟 حالات تسجيل الدخول
  const [session, setSession] = useState<Session | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [authMsg, setAuthMsg] = useState('')

  const [isCollapsed, setIsCollapsed] = useState(false) 
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false) 
  const [appBgImage, setAppBgImage] = useState<string | null>(null) // 🌟 حالة الخلفية
  
  const { formattedTime, mode, activeTaskId, startWork, stopTimer } = usePomodoro()

  // 🌟 قراءة الصورة من الإعدادات
  useEffect(() => {
    const loadTheme = () => {
      const saved = localStorage.getItem('odexai-settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        setAppBgImage(parsed.bgImage || null)
      }
    }
    loadTheme()
    window.addEventListener('settings-updated', loadTheme)
    return () => window.removeEventListener('settings-updated', loadTheme)
  }, [])
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('odexai-tasks')
    if (savedTasks) {
      return JSON.parse(savedTasks)
    }
    return []
  })

// 🌟 مراقبة حالة تسجيل الدخول
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // 🌟 دالة تسجيل الدخول / إنشاء حساب
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthMsg('جاري التحميل... ⏳')
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setAuthMsg('❌ خطأ: ' + error.message)
      else setAuthMsg('✅ تم تسجيل الدخول!')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setAuthMsg('❌ خطأ: ' + error.message)
      else setAuthMsg('✅ تم إنشاء الحساب بنجاح!')
    }
  }

  // 🌟 سحب مهام المستخدم الحالي فقط من السحابة
  useEffect(() => {
    const fetchCloudTasks = async () => {
      if (!session?.user) return // متسحبش إلا لو مسجل دخول
      const { data, error } = await supabase.from('tasks').select('*').eq('user_id', session.user.id)
      if (!error && data) {
        setTasks(data)
        localStorage.setItem('odexai-tasks', JSON.stringify(data))
      }
    }
    fetchCloudTasks()
  }, [session])

  useEffect(() => {
    localStorage.setItem('odexai-tasks', JSON.stringify(tasks))
  }, [tasks])

  // دالة تشغيل الأصوات
  const playSound = (sound: string) => {
    // استخدمنا مسار مباشر لأن الملفات هتتحط في فولدر public
    const audio = new Audio(`./${sound}.mp3`)
    audio.play().catch(e => console.log('ملف الصوت مش موجود:', e))
  }

  // 🌟 دالة إرسال إشعار لديسكورد
  const sendDiscordWebhook = (embed: any) => {
    const saved = localStorage.getItem('odexai-settings')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.discordWebhook) {
        fetch(parsed.discordWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: "OdexAi Tasks",
            avatar_url: "https://odexai.xyz/logo.png", // لوجو البوت بتاعك
            embeds: [embed]
          })
        }).catch(e => console.log("خطأ في ديسكورد:", e))
      }
    }
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
          
          // 🌟 الإضافة الجديدة: إرسال إشعار لديسكورد لما ميعاد المهمة ييجي!
          sendDiscordWebhook({
            title: "⏰ حان وقت المهمة!",
            description: `ميعاد المهمة دي جه دلوقتي: **${task.text}**\nيلا بينا نركز ونخلصها! 🚀`,
            color: 3447003, // لون أزرق شيك
            footer: { text: "OdexAi Productivity System" }
          });

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
  const addTask = async (text: string) => {
    if (!text.trim() || !session?.user) return
    // 🌟 إضافة الـ user_id للمهمة عشان تتسجل باسم صاحبها
    const newTask = { id: Date.now(), text, done: false, notified: false, user_id: session.user.id }
    setTasks([...tasks, newTask])
    playSound('add')

    // 🌟 الرفع للسحابة
    await supabase.from('tasks').insert([newTask])
  }

  // دالة تحديث شاملة (وقت، أولوية، قسم)
 const updateTaskDetails = async (id: number, startTime: string, endTime: string, priority?: 'high'|'medium'|'low', category?: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, startTime, endTime, priority, category, notified: false } : t))

    // 🌟 تحديث السحابة
    await supabase.from('tasks').update({ startTime, endTime, priority, category, notified: false }).eq('id', id)
  }

  // 🌟 دالة الأرشيف (بتحفظ المهام المكتملة وتمسحها من القائمة)
  const archiveCompletedTasks = () => {
    const completed = tasks.filter(t => t.done)
    
    if (completed.length === 0) {
      alert('مفيش مهام مكتملة لأرشفتها! 🎯 \nعلم (✔) على المهام اللي خلصتها الأول عشان تبدأ يوم جديد بنظافة.')
      return
    }

    const existingHistory = JSON.parse(localStorage.getItem('odexai-history') || '[]')
    const newHistory = [...existingHistory, ...completed.map(t => ({ ...t, archivedAt: new Date().toISOString() }))]
    localStorage.setItem('odexai-history', JSON.stringify(newHistory))

    // 🌟 إرسال تقرير لديسكورد
    sendDiscordWebhook({
      title: "📦 تم أرشفة المهام (يوم جديد)",
      description: `عاش! تم إنجاز وأرشفة **${completed.length}** مهام. جاهز لتحديات جديدة؟`,
      color: 3066993, // لون أخضر
      footer: { text: "OdexAi Productivity System" }
    });

    setTasks(tasks.filter(t => !t.done))
    playSound('delete') 
    // 🌟 مسح المهام المؤرشفة من السحابة
    const completedIds = completed.map(t => t.id);
    if (completedIds.length > 0) {
      supabase.from('tasks').delete().in('id', completedIds).then();
    }
  }

const toggleTask = async (id: number) => {
    let newDoneStatus = false;

    setTasks(tasks.map(t => {
      if (t.id === id) {
        newDoneStatus = !t.done;
        if (!t.done) {
          playSound('done') 
          if (t.priority === 'high') {
            sendDiscordWebhook({
              title: "🚀 مهمة عاجلة أُنجزت!",
              description: `تم الانتهاء من المهمة: **${t.text}**`,
              color: 15105570, 
              footer: { text: "OdexAi Productivity System" }
            });
          }
        }
        return { ...t, done: newDoneStatus }
      }
      return t
    }))

    // 🌟 تحديث السحابة
    await supabase.from('tasks').update({ done: newDoneStatus }).eq('id', id)
  }

  // دالة مسح المهمة
  const deleteTask = async (id: number) => {
    setTasks(tasks.filter(t => t.id !== id))
    playSound('delete') 

    // 🌟 مسح من السحابة
    await supabase.from('tasks').delete().eq('id', id)
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

  // 🌟 واجهة تسجيل الدخول (لو مفيش حساب أو مش مسجل)
  if (!session) {
    return (
      <div className="text-white h-screen bg-gray-900 rounded-2xl p-6 shadow-2xl flex flex-col justify-center items-center border border-gray-700/50 relative" style={{ direction: 'rtl' }}>
         <div className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-white" onClick={hideApp}>✖</div>
         <h2 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2"><span>👾</span> OdexAi Tasks</h2>
         <form onSubmit={handleAuth} className="w-full max-w-xs flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="البريد الإلكتروني" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 text-white w-full rounded-lg px-4 py-3 outline-none border border-gray-600 focus:border-blue-500 text-sm dir-ltr text-left"
              required
            />
            <input 
              type="password" 
              placeholder="كلمة المرور (6 أحرف على الأقل)" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 text-white w-full rounded-lg px-4 py-3 outline-none border border-gray-600 focus:border-blue-500 text-sm dir-ltr text-left"
              required
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg">
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </button>
         </form>
         <p className="mt-5 text-xs text-gray-400 cursor-pointer hover:text-blue-400 transition-colors" onClick={() => setIsLogin(!isLogin)}>
           {isLogin ? 'معندكش حساب؟ اضغط هنا لإنشاء حساب' : 'عندك حساب بالفعل؟ سجل دخول من هنا'}
         </p>
         {authMsg && <p className={`mt-4 text-xs text-center ${authMsg.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>{authMsg}</p>}
      </div>
    )
  }

  // 🌟 الواجهة الرئيسية (لو مسجل دخول)
  return (
    <div 
      className="text-white h-screen rounded-2xl p-4 shadow-2xl flex flex-col overflow-hidden border border-gray-700/50 transition-all duration-300 relative"
      style={{
        // 🌟 لو فيه صورة هيحطها ويحط فوقها طبقة غامقة عشان الكلام يفضل مقروء، لو مفيش هيحط اللون الافتراضي
        backgroundColor: appBgImage ? 'rgba(17, 24, 39, 0.85)' : 'rgba(17, 24, 39, 0.9)',
        backgroundImage: appBgImage ? `url(${appBgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}
    >
      <Header 
        onClose={hideApp} 
        isCollapsed={isCollapsed} 
        onToggleCollapse={toggleCollapse} 
        onArchive={archiveCompletedTasks} 
        showHistory={showHistory}
        onToggleHistory={() => {
          setShowHistory(!showHistory)
          setShowSettings(false) // اقفل الإعدادات لو السجل اتفتح
        }}
        pomodoroTime={formattedTime} 
        pomodoroMode={mode} 
        showSettings={showSettings} // 🌟 تمرير حالة الإعدادات
        onToggleSettings={() => {
          setShowSettings(!showSettings)
          setShowHistory(false) // اقفل السجل لو الإعدادات اتفتحت
        }}
      />
      
      {/* مش هنظهر المهام وحقل الإدخال إلا لو النافذة مفتوحة */}
      {!isCollapsed && (
        <>
          {showSettings ? (
            <Settings />
          ) : showHistory ? (
            <HistoryList />
          ) : (
            <>
              {/* 🌟 مؤشر البومودورو (بيظهر بس لو شغال) */}
              <PomodoroTimer 
                time={formattedTime} 
                mode={mode} 
                taskName={tasks.find(t => t.id === activeTaskId)?.text} 
                onStop={stopTimer} 
              />
              
              <TaskInput onAdd={addTask} />
              <TaskList 
                tasks={tasks} 
                onToggle={toggleTask} 
                onDelete={deleteTask} 
                onReorder={reorderTasks} 
                onUpdateDetails={updateTaskDetails} 
                onStartFocus={startWork} /* 🌟 تمرير دالة تشغيل التركيز لزرار المهمة */
              />
            </>
          )}
        </>
      )}
    </div>
  )
}

export default App