import React from 'react'

export default function EmailField({ translations, isEmailInputVisible }) {
  return (
    <>
      <input
        id="chat-email"
        className={`${isEmailInputVisible ? '' : 'hidden'}`}
        autoFocus="chat"
        name="email"
        type="email"
        placeholder={translations.emailPlaceholder}
      />
      <span className="animate-spin hidden js-email-processing">
        <span className="spin-icon"></span>
      </span>
    </>
  )
}
