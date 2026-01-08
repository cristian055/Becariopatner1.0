import React from 'react'
import { Home, FileQuestion } from 'lucide-react'
import './NotFound.css'

const NotFound: React.FC = () => {
  return (
    <div className="not-found">
      <div className="not-found__container">
        <div className="not-found__content">
          <div className="not-found__icon">
            <FileQuestion size={64} className="not-found__icon-svg" />
          </div>

          <h1 className="not-found__title">Page Not Found</h1>
          <p className="not-found__subtitle">
            The page you are looking for does not exist or has been moved.
          </p>

          <button
            onClick={() => window.location.hash = '#/monitor'}
            className="not-found__button"
          >
            <Home size={16} className="not-found__button-icon" />
            <span>Return to Monitor</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
