import { useState } from 'react'
import { Baby, Users, LogOut } from 'lucide-react'

const FamilySetup = ({ onCreate, onJoin, onSignOut }) => {
  const [mode, setMode] = useState('create')
  const [babyName, setBabyName] = useState('')
  const [birth, setBirth] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isCreate = mode === 'create'
  const isValid = isCreate ? babyName.trim() && birth : inviteCode.trim().length >= 6

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return
    setError('')
    setSubmitting(true)
    try {
      if (isCreate) {
        await onCreate(babyName.trim(), new Date(birth).toISOString())
      } else {
        await onJoin(inviteCode.trim().toUpperCase())
      }
    } catch (err) {
      setError(
        err.message?.includes('invalid_invite_code')
          ? 'הקוד לא נמצא. בדקו שהוא הוקלד נכון.'
          : 'משהו השתבש, נסו שוב'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const tabClass = (active) =>
    `flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
      active ? 'bg-primary-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'
    }`

  const inputClass =
    'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500'

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">ברוכים הבאים</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          פותחים משפחה חדשה, או מצטרפים עם קוד שקיבלתם מבן/בת הזוג
        </p>

        <div className="flex gap-2 mb-6">
          <button type="button" onClick={() => { setMode('create'); setError('') }} className={tabClass(isCreate)}>
            <Baby size={18} />
            <span>משפחה חדשה</span>
          </button>
          <button type="button" onClick={() => { setMode('join'); setError('') }} className={tabClass(!isCreate)}>
            <Users size={18} />
            <span>הצטרפות</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isCreate ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">שם התינוק</label>
                <input
                  type="text"
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  placeholder="לדוגמה: גפן"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">תאריך ושעת לידה</label>
                <input
                  type="datetime-local"
                  value={birth}
                  onChange={(e) => setBirth(e.target.value)}
                  className={inputClass}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">קוד הצטרפות</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                dir="ltr"
                autoCapitalize="characters"
                autoComplete="off"
                className={`${inputClass} text-center text-2xl tracking-widest font-mono`}
              />
              <p className="text-xs text-gray-400 mt-2">
                הקוד מופיע בדף הפרופיל אצל מי שפתח את המשפחה
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full py-3 rounded-xl font-bold bg-primary-500 text-white hover:bg-primary-600 active:scale-95 transition-all disabled:opacity-50"
          >
            {submitting ? 'רגע...' : isCreate ? 'יצירת משפחה' : 'הצטרפות'}
          </button>
        </form>

        <button
          onClick={onSignOut}
          className="w-full mt-4 text-sm text-gray-500 flex items-center justify-center gap-1"
        >
          <LogOut size={14} />
          <span>התנתקות</span>
        </button>
      </div>
    </div>
  )
}

export default FamilySetup
