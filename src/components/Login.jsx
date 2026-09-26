import { useState } from 'react'
import { LogIn, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'

const ERROR_MESSAGES = {
  'Invalid login credentials': 'אימייל או סיסמה שגויים',
  'Email not confirmed': 'צריך לאשר את כתובת המייל (בדוק את תיבת הדואר)',
  'User already registered': 'המשתמש כבר רשום - אפשר להתחבר',
  'Password should be at least 6 characters.': 'הסיסמה צריכה להכיל לפחות 6 תווים'
}

const translateError = (message) => ERROR_MESSAGES[message] || message

const Login = () => {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isSignUp = mode === 'signup'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin }
        })
        if (error) throw error
        if (!data.session) {
          setInfo('נשלח אליך מייל אימות. אחרי האישור אפשר להתחבר.')
          setMode('signin')
        }
        return
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const { data: isFamily } = await supabase.rpc('is_family')
      if (!isFamily) {
        await supabase.auth.signOut()
        setError('המשתמש הזה לא מורשה לגשת לאפליקציה')
      }
    } catch (err) {
      setError(translateError(err.message))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-1">גפן</h1>
        <p className="text-center text-gray-500 mb-6">
          {isSignUp ? 'הרשמה' : 'התחברות'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="אימייל"
            autoComplete="email"
            dir="ltr"
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500 text-right"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="סיסמה"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            dir="ltr"
            required
            minLength={6}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500 text-right"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-green-600">{info}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl font-bold bg-primary-500 text-white hover:bg-primary-600 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
            <span>{submitting ? 'רגע...' : isSignUp ? 'הרשמה' : 'התחברות'}</span>
          </button>
        </form>

        <button
          onClick={() => {
            setMode(isSignUp ? 'signin' : 'signup')
            setError('')
            setInfo('')
          }}
          className="w-full mt-4 text-sm text-primary-600"
        >
          {isSignUp ? 'כבר רשום? להתחברות' : 'פעם ראשונה? להרשמה'}
        </button>
      </div>
    </div>
  )
}

export default Login
