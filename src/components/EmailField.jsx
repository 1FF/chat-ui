import React from 'react'

const EmailField = ({ translations, isEmailInputVisible, onChange, emailInputRef, onKeyUp, isLoaderVisible }) => {
  return (
    <>
      <input
        id="chat-email"
        className={`${isEmailInputVisible ? '' : 'hidden'}`}
        autoFocus="chat"
        name="email"
        type="email"
        disabled={isLoaderVisible}
        ref={emailInputRef}
        onChange={onChange}
        onKeyUp={onKeyUp}
        placeholder={translations.emailPlaceholder}
      />
      <span className={`${isLoaderVisible ? '' : 'hidden'} animate-spin js-email-processing`}>
        <span className="spin-icon"></span>
      </span>
    </>
  )
}

export default EmailField