import React from 'react'

const PromptField = ({ translations, onKeyUp, isPromptInputVisible, promptInputRef }) => {
  return (
    <input
    id="chat-prompt"
    minLength="1"
    autoFocus="chat"
    name="chat-prompt"
    type="text"
    className={`${isPromptInputVisible ? '' : 'hidden'}`}
    ref={promptInputRef}
    placeholder={translations.textareaPlaceholder}
    onKeyUp={onKeyUp}
  />
  )
}

export default PromptField