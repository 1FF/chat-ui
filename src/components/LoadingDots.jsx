import React from 'react'

const LoadingDots = ({ isVisible }) => {
  return (
    <div className={`js-wave ${isVisible ? '' : 'hidden'}`}>
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>
    </div>
  )
}

export default LoadingDots;