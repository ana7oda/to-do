import { useState } from 'react'

function TaskInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState('')

  const handleAdd = () => {
    onAdd(text)
    setText('') 
  }

  return (
    <div className="flex gap-2 mb-4">
      <input 
        type="text" 
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        placeholder="إيه المهمة الجديدة؟..." 
        className="w-full bg-gray-800/80 text-sm rounded-lg px-3 py-2 outline-none border border-gray-700 focus:border-blue-500 transition-colors text-gray-200"
      />
      <button 
        onClick={handleAdd}
        className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg cursor-pointer shrink-0"
      >
        +
      </button>
    </div>
  )
}
export default TaskInput