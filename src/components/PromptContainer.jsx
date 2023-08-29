import React from 'react'
import SendButton from './SendButton'

export default function PromptContainer({ translations }) {
  return (
    <div className="chat-widget__prompt" id="prompt-container">
      <span className="widget__input">
        <input id="chat-email" className="hidden" autoFocus="chat" name="email" type="email" placeholder={translations.emailPlaceholder} />
        <input id="chat-prompt" minLength="1" autoFocus="chat" name="chat-prompt" type="text" placeholder={translations.textareaPlaceholder} />
        <span className="animate-spin hidden js-email-processing">
          <span className="spin-icon"></span>
        </span>
      </span>
      <SendButton />
    </div>
  )
}
