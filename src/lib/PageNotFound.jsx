import { useLocation } from 'react-router-dom'

export default function PageNotFound() {
  const location = useLocation()
  const pageName = location.pathname.substring(1)

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-specter-bg">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-7xl font-light text-specter-muted">404</h1>
            <div className="h-0.5 w-16 bg-specter mx-auto" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-medium text-specter-text">
              Page Not Found
            </h2>
            <p className="text-specter-muted leading-relaxed">
              The page <span className="font-medium text-specter-text">&ldquo;{pageName}&rdquo;</span> could not be found.
            </p>
          </div>
          <div className="pt-6">
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-specter-text bg-specter-surface border border-specter rounded-lg hover:bg-specter-elevated"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}