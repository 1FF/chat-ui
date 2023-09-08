import React from 'react'

const ActionButton = ({ isCtaVisible = true, text }) => {
  return (
    <a className={`chat-widget__cta ${isCtaVisible ? '' : 'hidden'}`} id="cta-button">{text}</a>
  )
}

export default ActionButton