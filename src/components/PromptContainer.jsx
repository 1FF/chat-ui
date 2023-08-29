import React from 'react'
import SendButton from './SendButton'

export default function PromptContainer({ translations }) {
  return (
    <div class="chat-widget__prompt" id="prompt-container">
      <span class="widget__input">
        <input id="chat-email" class="hidden" autofocus="chat" name="email" type="email" placeholder={translations.emailPlaceholder} />
        <input id="chat-prompt" minlength="1" autofocus="chat" name="chat-prompt" type="text" placeholder={translations.textareaPlaceholder} />
        <span class="animate-spin hidden js-email-processing">
          <span class="spin-icon"></span>
        </span>
      </span>
      <SendButton />
    </div>
  )
}
