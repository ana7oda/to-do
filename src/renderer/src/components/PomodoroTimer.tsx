import React from 'react';

type PomodoroTimerProps = {
  time: string;
  mode: 'work' | 'break' | 'idle';
  taskName?: string;
  onStop: () => void;
};

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ time, mode, taskName, onStop }) => {
  if (mode === 'idle') return null; // مفيش حاجة شغالة، نخبيه

  const isWork = mode === 'work';

  return (
    <div className={`p-4 rounded-xl mb-4 flex flex-col items-center justify-center transition-all shadow-lg border border-gray-700/50 ${isWork ? 'bg-red-900/30' : 'bg-green-900/30'}`}>
      <h3 className={`text-sm font-bold mb-1 ${isWork ? 'text-red-400' : 'text-green-400'}`}>
        {isWork ? '🔥 وضع التركيز العميق' : '☕ وقت الراحة'}
      </h3>
      <div className="text-4xl font-mono font-bold tracking-widest text-white my-2">
        {time}
      </div>
      {isWork && taskName && (
        <p className="text-gray-300 text-sm mb-3 truncate w-full text-center px-2">
          مهمة: {taskName}
        </p>
      )}
      <button 
        onClick={onStop}
        className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-4 py-2 rounded-lg transition-colors border border-gray-600"
      >
        إلغاء الجلسة
      </button>
    </div>
  );
};

export default PomodoroTimer;