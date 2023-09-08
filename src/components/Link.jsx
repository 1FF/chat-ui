import React from 'react'

const Link = ({ text, link }) => {
  return (
    <a href={link} className={`chat-widget__cta ${!!link ? '' : 'hidden'}`} id="cta-button">{text}</a>
  )
}

export default Link