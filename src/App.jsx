import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import { useSyncedTable } from './hooks/useSyncedTable'
import { useBabySettings } from './hooks/useBabySettings'
import Header from './components/Header'
import QuickActions from './components/QuickActions'
import RecentEvents from './components/RecentEvents'
import HistoryView from './components/HistoryView'
import ProfileView from './components/ProfileView'
import Login from './components/Login'
import Toast from './components/Toast'
import { Home, History, User } from 'lucide-react'
import { isWithinLast24Hours } from './utils/dateUtils'

const NAV_ITEMS = [
  { id: 'main', label: 'ראשי', icon: Home },
  { id: 'history', label: 'היסטוריה', icon: History },
  { id: 'profile', label: 'פרופיל', icon: User }
]

function App() {
  const [view, setView] = useState('main')
  const [toast, setToast] = useState(null)
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured)

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

  const signedIn = !isSupabaseConfigured || Boolean(session)

  const events = useSyncedTable('events', {
    orderBy: 'timestamp',
    localKey: 'gefenEvents',
    enabled: signedIn
  })
  const profileItems = useSyncedTable('profile_items', {
    orderBy: 'created_at',
    localKey: 'gefenProfileItems',
    enabled: signedIn
  })
  const settings = useBabySettings(signedIn)

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

  const saveWeight = withToast(settings.saveWeight, 'המשקל עודכן', 'שגיאה בשמירת המשקל')
  const savePhotoUrl = withToast(settings.savePhotoUrl, 'התמונה עודכנה', 'שגיאה בשמירת התמונה')
  const savePhotoFile = withToast(settings.savePhotoFile, 'התמונה עודכנה', 'שגיאה בהעלאת התמונה')

  const handleSignOut = () => supabase.auth.signOut()

  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">טוען...</div>
  }

  if (!signedIn) {
    return <Login />
  }

  const recentEvents = events.rows.filter(e => isWithinLast24Hours(e.timestamp))

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
              weight={settings.weight}
              photo={settings.photo}
              onSaveWeight={saveWeight}
              onSavePhotoUrl={savePhotoUrl}
              onSavePhotoFile={savePhotoFile}
            />
            <QuickActions onAddEvent={addEvent} />
            <RecentEvents
              events={recentEvents}
              onUpdate={updateEvent}
              onDelete={deleteEvent}
            />
          </>
        )}

        {view === 'history' && (
          <HistoryView
            events={events.rows}
            onUpdate={updateEvent}
            onDelete={deleteEvent}
          />
        )}

        {view === 'profile' && (
          <ProfileView
            items={profileItems.rows}
            photo={settings.photo}
            onAdd={addProfileItem}
            onUpdate={updateProfileItem}
            onDelete={deleteProfileItem}
            userEmail={session?.user?.email}
            onSignOut={isSupabaseConfigured ? handleSignOut : null}
          />
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

export default App
