import { CheckCircle, XCircle } from 'lucide-react'

const Toast = ({ message, type = 'success' }) => {
  const styles = {
    success: {
      bg: 'bg-green-500',
      icon: CheckCircle
    },
    error: {
      bg: 'bg-red-500',
      icon: XCircle
    }
  }

  const { bg, icon: Icon } = styles[type]

  return (
    <div className="fixed top-safe-top top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-slide-down">
      <div className={`${bg} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[280px]`}>
        <Icon size={24} />
        <span className="font-medium">{message}</span>
      </div>

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Toast
