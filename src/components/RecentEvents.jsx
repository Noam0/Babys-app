import EventItem from './EventItem'

const RecentEvents = ({ events, latestWeightId, onUpdate, onDelete }) => {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-bold text-gray-800 mb-3">
        אירועים אחרונים (24 שעות)
      </h2>
      {events.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <p className="text-gray-400 text-base">אין אירועים להצגה</p>
          <p className="text-gray-300 text-sm mt-2">התחל לרשום פעילויות כדי לראות אותן כאן</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              latestWeightId={latestWeightId}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default RecentEvents
