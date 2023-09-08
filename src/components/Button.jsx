import React from 'react'

const Button = ({ text, isVisible, onClick, innerRef }) => {
  return (
    <button onClick={onClick} ref={innerRef} className={`chat-widget__cta ${isVisible ? '' : 'hidden'}`} id="cta-button">{text}</button>
  )
}

export default Button