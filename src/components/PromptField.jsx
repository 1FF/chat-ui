import React from 'react'

export default function PromptField({ translations, onChange, onKeyUp, value, isPromptInputVisible }) {
  return (
    <input
      id="chat-prompt"
      minLength="1"
      autoFocus="chat"
      name="chat-prompt"
      type="text"
      className={`${isPromptInputVisible ? '' : 'hidden'}`}
      value={value}
      onChange={onChange}
      placeholder={translations.textareaPlaceholder}
      onKeyUp={onKeyUp}
    />
  )
}
