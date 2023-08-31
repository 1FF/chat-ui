import React from 'react'

export default function LoadingDots({ isVisible }) {
  return (
    <div className={`js-wave ${isVisible ? '' : 'hidden'}`}>
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>
    </div>
  )
}
