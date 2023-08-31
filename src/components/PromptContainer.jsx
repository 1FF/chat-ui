import React from 'react'

export default function PromptContainer({ translations, onChange, onKeyUp, value }) {
  return (
    <span className="widget__input">
      <input id="chat-email" className="hidden" autoFocus="chat" name="email" type="email" placeholder={translations.emailPlaceholder} />
      <input id="chat-prompt" minLength="1" autoFocus="chat" name="chat-prompt" type="text" value={value} onChange={onChange} placeholder={translations.textareaPlaceholder} onKeyUp={onKeyUp} />
      <span className="animate-spin hidden js-email-processing">
        <span className="spin-icon"></span>
      </span>
    </span>
  )
}
