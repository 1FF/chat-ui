import React from 'react'

const Button = ({ text, isVisible }) => {
  return (
    <button className={`chat-widget__cta ${isVisible ? '' : 'hidden'}`} id="cta-button">{text}</button>
  )
}

export default Button