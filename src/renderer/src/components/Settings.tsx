import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 

function Settings() {
  const [workTime, setWorkTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [bgImage, setBgImage] = useState<string | null>(null); 
  const [discordWebhook, setDiscordWebhook] = useState(''); 
  const [savedMessage, setSavedMessage] = useState('');

//  استرجاع الإعدادات المحفوظة (من الجهاز والسحابة)
  useEffect(() => {
    const loadSettings = async () => {
      const saved = localStorage.getItem('odexai-settings');
      let localSettings: any = {};
      if (saved) {
        localSettings = JSON.parse(saved);
        if (localSettings.workTime) setWorkTime(localSettings.workTime);
        if (localSettings.breakTime) setBreakTime(localSettings.breakTime);
        if (localSettings.bgImage) setBgImage(localSettings.bgImage);
        if (localSettings.discordWebhook) setDiscordWebhook(localSettings.discordWebhook); 
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        //  استبدلنا single بـ maybeSingle عشان ميعملش خطأ 406 لو دي أول مرة ليك
        const { data, error } = await supabase.from('settings').select('*').eq('user_id', session.user.id).maybeSingle();
        if (data && !error) {
          if (data.work_time) setWorkTime(data.work_time);
          if (data.break_time) setBreakTime(data.break_time);
          if (data.discord_webhook) setDiscordWebhook(data.discord_webhook);
          
          const updatedSettings = { ...localSettings, workTime: data.work_time, breakTime: data.break_time, discordWebhook: data.discord_webhook };
          localStorage.setItem('odexai-settings', JSON.stringify(updatedSettings));
        }
      }
    };
    loadSettings();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const newSettings = { workTime, breakTime, bgImage, discordWebhook }; 
    localStorage.setItem('odexai-settings', JSON.stringify(newSettings));
    
    // 1. التحقق من هوية المستخدم
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      alert("🚨 يجب تسجيل الدخول أولاً لحفظ الإعدادات في السحابة!");
      return;
    }
    const userId = session.user.id;

    const { data: existingSettings } = await supabase.from('settings').select('id').eq('user_id', userId).maybeSingle();

    let dbError;
    let dbData;

    //  تأمين الأرقام: تحويلها لأرقام صحيحة ومنعها من النزول عن 1
    const safeWorkTime = Math.max(1, Math.round(workTime));
    const safeBreakTime = Math.max(1, Math.round(breakTime));

    if (existingSettings) {
      const { data, error } = await supabase.from('settings').update({
        discord_webhook: discordWebhook,
        work_time: safeWorkTime,
        break_time: safeBreakTime
      }).eq('user_id', userId).select();
      dbError = error; dbData = data;
    } else {
      const { data, error } = await supabase.from('settings').insert([{
        id: Math.floor(Math.random() * 1000000), 
        user_id: userId,
        discord_webhook: discordWebhook,
        work_time: safeWorkTime,
        break_time: safeBreakTime
      }]).select();
      dbError = error; dbData = data;
    }

    if (dbError) {
      console.error("🚨 خطأ تفصيلي من قاعدة البيانات:", JSON.stringify(dbError, null, 2)); 
      alert("فشل الرفع! راجع الـ Console.");
    } else {
      console.log("✅ تم ربط الإعدادات بحسابك بنجاح:", dbData);
      window.dispatchEvent(new Event('settings-updated'));
      setSavedMessage('تم حفظ الإعدادات بنجاح! ✅ (مربوطة بحسابك 🔒)');
      setTimeout(() => setSavedMessage(''), 3000);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-2 overflow-y-auto">
      <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
        <span>⚙️</span> إعدادات التطبيق
      </h3>

      {/* قسم إعدادات البومودورو */}
      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 mb-4">
        <h4 className="text-md font-bold text-gray-200 mb-3 border-b border-gray-700 pb-2">⏱️ إعدادات التركيز</h4>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-300">مدة العمل (دقائق):</label>
            <input type="number" value={workTime} onChange={(e) => setWorkTime(Number(e.target.value))} className="bg-gray-900 text-white w-16 text-center rounded px-2 py-1 outline-none border border-gray-600 focus:border-blue-500" min="1" />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-300">مدة الراحة (دقائق):</label>
            <input type="number" value={breakTime} onChange={(e) => setBreakTime(Number(e.target.value))} className="bg-gray-900 text-white w-16 text-center rounded px-2 py-1 outline-none border border-gray-600 focus:border-green-500" min="1" />
          </div>
        </div>
      </div>

      {/* قسم المظهر والخلفية */}
      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 mb-4">
        <h4 className="text-md font-bold text-gray-200 mb-3 border-b border-gray-700 pb-2">🎨 المظهر والخلفية</h4>
        
        <div className="flex flex-col gap-3">
          <label className="text-sm text-gray-300">اختر صورة خلفية للتطبيق:</label>
          <div className="flex items-center gap-2">
            <label className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs text-center py-2 rounded cursor-pointer transition-colors border border-gray-500">
              🖼️ رفع صورة من الجهاز
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            
            {bgImage && (
              <button 
                onClick={() => setBgImage(null)}
                className="bg-red-900/50 hover:bg-red-800 text-red-300 text-xs px-3 py-2 rounded border border-red-700 transition-colors"
                title="مسح الخلفية"
              >
                🗑️
              </button>
            )}
          </div>
          {bgImage && (
            <div className="mt-2 w-full h-20 rounded-lg bg-cover bg-center border border-gray-600" style={{ backgroundImage: `url(${bgImage})` }}></div>
          )}
        </div>
      </div>

      {/* قسم الربط مع ديسكورد */}
      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 mb-4">
        <h4 className="text-md font-bold text-[#5865F2] mb-3 border-b border-gray-700 pb-2 flex items-center gap-2">
          <span>👾</span> الربط مع Discord
        </h4>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-300">رابط Webhook (اختياري):</label>
          <input 
            type="text" 
            value={discordWebhook}
            onChange={(e) => setDiscordWebhook(e.target.value)}
            placeholder="https://discord.com/api/webhooks/..." 
            className="bg-gray-900 text-white text-[11px] w-full rounded px-2 py-2 outline-none border border-gray-600 focus:border-[#5865F2] transition-colors"
          />
          <p className="text-[10px] text-gray-400 mt-1">
            التطبيق هيبعت رسالة تلقائية لسيرفرك لما تخلص مهمة "عاجلة"، ولما تعمل أرشفة لليوم، ولما تخلص جلسة Pomodoro!
          </p>
        </div>
      </div>

      {/* زر الحفظ */}
      <div className="mt-auto pt-4 flex flex-col gap-2">
        {savedMessage && <p className="text-green-400 text-xs text-center animate-pulse">{savedMessage}</p>}
        <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition-colors shadow-lg outline-none">          
          حفظ الإعدادات
        </button>
      </div>
    </div>
  );
}

export default Settings;