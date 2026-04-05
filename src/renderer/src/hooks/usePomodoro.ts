import { useState, useEffect } from 'react';

type PomodoroMode = 'work' | 'break' | 'idle';

// دالة سريعة لجلب الإعدادات من الذاكرة
const getSettings = () => {
  const saved = localStorage.getItem('odexai-settings');
  return saved ? JSON.parse(saved) : { workTime: 25, breakTime: 5 };
};

export const usePomodoro = () => {
  // بنقرأ الوقت الابتدائي من الإعدادات
  const [timeLeft, setTimeLeft] = useState(() => getSettings().workTime * 60);
  const [mode, setMode] = useState<PomodoroMode>('idle');
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

  // 🌟 مستشعر لتحديث الوقت فوراً لو المستخدم داس "حفظ" في شاشة الإعدادات
  useEffect(() => {
    const handleSettingsUpdate = () => {
      if (mode === 'idle') {
        setTimeLeft(getSettings().workTime * 60);
      }
    };
    window.addEventListener('settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('settings-updated', handleSettingsUpdate);
  }, [mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (mode !== 'idle' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && mode !== 'idle') {
      const audio = new Audio(mode === 'work' ? './done.mp3' : './add.mp3');
      audio.play().catch(e => console.log(e));

      const settings = getSettings(); // نقرأ الإعدادات الجديدة

      if (mode === 'work') {
        // @ts-ignore
        window.api.stopFocus(); 
        // @ts-ignore
        window.api.showNotification(`عاش يا بطل! خلصت جلسة التركيز، خد بريك ${settings.breakTime} دقايق ☕`);
        
        // 🌟 إرسال إشعار لديسكورد
        if (settings.discordWebhook) {
          fetch(settings.discordWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: "OdexAi Tasks",
              avatar_url: "https://odexai.xyz/logo.png", // رابط اللوجو بتاعك
              embeds: [{
                title: "🔥 بطل التركيز!",
                description: `عاش جداً! تم إنهاء جلسة تركيز (Pomodoro) لمدة **${settings.workTime} دقيقة** بنجاح.`,
                color: 16711680, // لون أحمر
                footer: { text: "OdexAi Productivity System" }
              }]
            })
          }).catch(console.error);
        }

        setMode('break');
        setTimeLeft(settings.breakTime * 60);
      } else {
        // @ts-ignore
        window.api.showNotification('البريك خلص! يلا نرجع للتركيز 🚀');
        setMode('idle');
        setActiveTaskId(null);
        setTimeLeft(settings.workTime * 60); // نرجعه لوقت العمل الافتراضي
      }
    }

    return () => clearInterval(interval);
  }, [mode, timeLeft]);

  const startWork = (taskId: number) => {
    setActiveTaskId(taskId);
    setMode('work');
    setTimeLeft(getSettings().workTime * 60);
    // @ts-ignore
    window.api.startFocus(); 
  };

  const stopTimer = () => {
    setMode('idle');
    setActiveTaskId(null);
    setTimeLeft(getSettings().workTime * 60);
    // @ts-ignore
    window.api.stopFocus(); 
  };

  const formattedTime = `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return { formattedTime, mode, activeTaskId, startWork, stopTimer };
};