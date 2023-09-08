import React from 'react'

const Link = ({ text, link, onClick }) => {
  return (
    <a onClick={onClick} href={link} className={`chat-widget__cta ${!!link ? '' : 'hidden'}`} id="cta-button">{text}</a>
  )
}

export default Link