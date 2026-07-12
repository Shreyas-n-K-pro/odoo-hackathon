export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <div className={`${sizes[size]} border-2 border-white/10 border-t-amber-400 rounded-full animate-spin ${className}`} />
  )
}

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-navy-950">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-gray-400 text-sm">Loading TransitOps...</p>
    </div>
  </div>
)
