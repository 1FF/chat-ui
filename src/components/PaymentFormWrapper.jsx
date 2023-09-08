import React from 'react'

const ProgressLoader = ({ translations }) => {
  return (
    <div className="chat-payment-loader js-payment-loader">
      <div className="chat-payment-loader__inner">
        <div className="chat-payment-loader__dots">
          <div className="chat-payment-loader__dots-in">
            <span className="chat-payment-loader__dots_dots"></span>
          </div>
        </div>
        <div className="chat-payment-loader__progress-text">
          <span className="chat-payment-loader__progress_checkmark">
            <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12"></circle>
              <path d="m9.75 15.127-2.602-2.602a.748.748 0 0 0-1.058 1.057l3.135 3.136a.747.747 0 0 0 1.058 0l7.935-7.935a.748.748 0 0 0-1.058-1.058l-7.41 7.402z"
                fill="white"></path>
            </svg>
          </span>
          <p className="js-payment-message chat-payment-loader__title">{translations.tm1224}</p>
        </div>
        <div className="js-msg-spin chat-payment-loader__spinning-texts">
          <div className="chat-payment-loader__spinning-texts_film">
            {translations.paymentLoaderTexts.map((text, index) => (<div className="chat-payment-loader__text" key={`processing-${index}`}>{text}</div>))}
          </div>
        </div>
      </div>
    </div>
  )
}

const SpinningLoader = () => {
  return (
    <span className="js-payment-form-loader payment-loader">
      <span className="animate-spin-pay">
        <span className="spin-icon"></span>
      </span>
    </span>
  )
}


const FormFooter = () => {
  return (
    <span className="payment-form__footer">
      <svg fill="none"
        height="12"
        viewBox="0 0 12 12"
        width="12"
        xmlns="http://www.w3.org/2000/svg">
        <path d="M9 4h-.5V3a2.5 2.5 0 0 0-5 0v1H3c-.55 0-1 .45-1 1v5c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zM6 8.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM7.55 4h-3.1V3c0-.855.695-1.55 1.55-1.55.855 0 1.55.695 1.55 1.55v1z"
          fill="currentColor" />
      </svg>
      <span>SSL Secure Conection</span>
    </span>
  )
}


const PaymentFormWrapper = ({ translations, isVisible = false }) => {
  return (
    <div id="chat-payment-view" className={`payment-view ${isVisible ? '' : 'hidden'}`}>
      <ProgressLoader translations={translations} />
      <span className="payment-view__main-container primer-form-container light-pink-blue">
        <span id="payment-form-close-button" className="close-payment-form hidden">
          <svg
            fill="none"
            viewBox="0 0 18 18">
            <path d="M13.725 4.282a.747.747 0 0 0-1.058 0L9 7.942 5.332 4.276a.748.748 0 1 0-1.057 1.057L7.942 9l-3.667 3.668a.748.748 0 1 0 1.057 1.057L9 10.057l3.667 3.668a.748.748 0 1 0 1.058-1.057L10.057 9l3.668-3.668a.752.752 0 0 0 0-1.05z"
              fill="currentColor" />
          </svg>
        </span>
        <section id="primer-form-container"></section>
        <SpinningLoader />
        <FormFooter />
      </span>
    </div>
  )
}

export default PaymentFormWrapper