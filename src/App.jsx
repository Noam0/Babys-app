import { useState, useEffect, useRef } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import { useSyncedTable } from './hooks/useSyncedTable'
import { useFamily } from './hooks/useFamily'
import Header from './components/Header'
import QuickActions from './components/QuickActions'
import RecentEvents from './components/RecentEvents'
import HistoryView from './components/HistoryView'
import ProfileView from './components/ProfileView'
import Login from './components/Login'
import FamilySetup from './components/FamilySetup'
import Toast from './components/Toast'
import { Home, History, User } from 'lucide-react'
import { isWithinLast24Hours } from './utils/dateUtils'

const NAV_ITEMS = [
  { id: 'main', label: 'ראשי', icon: Home },
  { id: 'history', label: 'היסטוריה', icon: History },
  { id: 'profile', label: 'פרופיל', icon: User }
]

const FullScreenMessage = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center text-gray-400 px-6 text-center" dir="rtl">
    {children}
  </div>
)

function App() {
  const [view, setView] = useState('main')
  const [toast, setToast] = useState(null)
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => subscription.unsubscribe()
  }, [])

  const familyState = useFamily(session?.user?.id)
  const { family } = familyState

  const events = useSyncedTable('events', { orderBy: 'timestamp', familyId: family?.id })
  const profileItems = useSyncedTable('profile_items', { orderBy: 'created_at', familyId: family?.id })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const withToast = (action, successMessage, errorMessage) => async (...args) => {
    try {
      await action(...args)
      if (successMessage) showToast(successMessage)
    } catch (error) {
      console.error(error)
      showToast(errorMessage, 'error')
    }
  }

  const addEvent = withToast(
    (eventType, details = {}, timestamp = new Date().toISOString()) =>
      events.add({ event_type: eventType, details, timestamp }),
    'האירוע נשמר',
    'שגיאה בשמירת האירוע'
  )
  const updateEvent = withToast(events.update, 'האירוע עודכן', 'שגיאה בעדכון האירוע')
  const deleteEvent = withToast(events.remove, 'האירוע נמחק', 'שגיאה במחיקת האירוע')

  const addProfileItem = withToast(profileItems.add, 'הפריט נשמר', 'שגיאה בשמירת הפריט')
  const updateProfileItem = withToast(profileItems.update, 'הפריט עודכן', 'שגיאה בעדכון הפריט')
  const deleteProfileItem = withToast(profileItems.remove, 'הפריט נמחק', 'שגיאה במחיקת הפריט')

  const updateFamily = withToast(familyState.updateFamily, 'הפרטים עודכנו', 'שגיאה בעדכון הפרטים')
  const weightSaveLock = useRef(false)
  const saveWeight = withToast(async (kg) => {
    if (weightSaveLock.current) return
    weightSaveLock.current = true
    try {
      await familyState.saveWeight(kg)
      const alreadyLogged = events.rows.some((event) => (
        event.event_type === 'weight' &&
        Number(event.details?.kg) === Number(kg) &&
        Date.now() - new Date(event.timestamp).getTime() < 4000
      ))
      if (!alreadyLogged) {
        await events.add({
          event_type: 'weight',
          details: { kg },
          timestamp: new Date().toISOString()
        })
      }
    } finally {
      weightSaveLock.current = false
    }
  }, 'המשקל עודכן', 'שגיאה בשמירת המשקל')
  const savePhotoUrl = withToast(familyState.savePhotoUrl, 'התמונה עודכנה', 'שגיאה בשמירת התמונה')
  const savePhotoFile = withToast(familyState.savePhotoFile, 'התמונה עודכנה', 'שגיאה בהעלאת התמונה')

  const handleSignOut = () => supabase.auth.signOut()

  if (!isSupabaseConfigured) {
    return <FullScreenMessage>חסרים פרטי חיבור ל-Supabase בקובץ .env</FullScreenMessage>
  }

  if (!authReady) {
    return <FullScreenMessage>טוען...</FullScreenMessage>
  }

  if (!session) {
    return <Login />
  }

  if (familyState.loading) {
    return <FullScreenMessage>טוען...</FullScreenMessage>
  }

  if (!family) {
    return (
      <FamilySetup
        onCreate={familyState.createFamily}
        onJoin={familyState.joinFamily}
        onSignOut={handleSignOut}
      />
    )
  }

  const recentEvents = events.rows.filter(e => isWithinLast24Hours(e.timestamp))
  const latestWeightId = events.rows.find(e => e.event_type === 'weight')?.id

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20" dir="rtl">
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center h-16 pb-safe-bottom">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                view === id ? 'text-primary-500' : 'text-gray-400'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="px-4 pt-safe-top">
        {view === 'main' && (
          <>
            <Header
              babyName={family.baby_name}
              birthDatetime={family.birth_datetime}
              weight={family.weight_kg}
              photo={familyState.photo}
              onSaveWeight={saveWeight}
              onSavePhotoUrl={savePhotoUrl}
              onSavePhotoFile={savePhotoFile}
            />
            <QuickActions onAddEvent={addEvent} />
            <RecentEvents
              events={recentEvents}
              latestWeightId={latestWeightId}
              onUpdate={updateEvent}
              onDelete={deleteEvent}
            />
          </>
        )}

        {view === 'history' && (
          <HistoryView
            events={events.rows}
            latestWeightId={latestWeightId}
            onUpdate={updateEvent}
            onDelete={deleteEvent}
          />
        )}

        {view === 'profile' && (
          <ProfileView
            family={family}
            photo={familyState.photo}
            onUpdateFamily={updateFamily}
            items={profileItems.rows}
            onAdd={addProfileItem}
            onUpdate={updateProfileItem}
            onDelete={deleteProfileItem}
            userEmail={session.user.email}
            onSignOut={handleSignOut}
          />
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

export default App
