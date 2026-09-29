import { Trash2 } from 'lucide-react'

const ConfirmDialog = ({ title, message, confirmLabel = 'מחק', onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onCancel}>
    <div
      className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="bg-red-100 text-red-600 p-2.5 rounded-xl">
          <Trash2 size={19} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm mb-4">{message}</p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all"
        >
          {confirmLabel}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition-all"
        >
          ביטול
        </button>
      </div>
    </div>
  </div>
)

export default ConfirmDialog
