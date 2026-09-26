const BabyAvatar = ({ photo, name, className = '' }) => {
  const base = `rounded-full border-4 border-primary-200 shadow-md ${className}`

  if (photo) {
    return <img src={photo} alt={name} className={`${base} object-cover`} />
  }

  return (
    <div className={`${base} bg-gradient-to-br from-primary-300 to-primary-500 text-white font-bold flex items-center justify-center`}>
      {name?.[0]}
    </div>
  )
}

export default BabyAvatar
