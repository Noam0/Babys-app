import { useState } from 'react'
import { X } from 'lucide-react'

const ActionModal = ({ action, onClose, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState(null)
  const [customText, setCustomText] = useState('')

  const handleSubmit = () => {
    if (action.customInput) {
      if (customText.trim()) {
        onSubmit(action.id, { custom: customText.trim() })
      }
    } else if (selectedOption) {
      onSubmit(action.id, { option: selectedOption })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">{action.label}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <X size={24} />
          </button>
        </div>

        {action.customInput ? (
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              תיאור האירוע
            </label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="הזן תיאור..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500 text-lg"
              autoFocus
            />
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {action.options?.map((option) => {
              const Icon = option.icon
              const selected = selectedOption === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedOption(option.value)}
                  className={`w-full py-4 px-6 rounded-xl font-medium transition-all text-lg flex items-center justify-center gap-3
                    ${selected
                      ? 'bg-primary-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {Icon && <Icon size={22} strokeWidth={2.2} />}
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedOption && !customText.trim()}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all
            ${selectedOption || customText.trim()
              ? 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
          שמור
        </button>
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </div>
  )
}

export default ActionModal
