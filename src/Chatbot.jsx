import React from 'react';
import ChatWrapper from './components/ChatWrapper';
import Head from './components/Head';
import MessagesWrapper from './components/MessagesWrapper';
import InitiatorProfile from './components/InitiatorProfile';
import SendButton from './components/SendButton';
import { assistant } from './lib/config/assistant';
import { translations } from './lib/config/translations';

import "./styles/index.css";

const Chatbot = ({ }) => {
  return (
    <ChatWrapper>
      <Head assistant={assistant} />
      <MessagesWrapper>
        <InitiatorProfile assistant={assistant} />

        <div class="date-formatted">AUGUST 28, 2023 AT 1:58 PM</div>
        <span class="assistant">
          <span class="js-assistant-message">Do you want to lose weight? </span>
          <div class="answers-container">
            <div>Yes</div>
            <div>No</div>
          </div>
        </span>
      </MessagesWrapper>

      {/* <a class="chat-widget__cta hidden" id="cta-button">${config.assistant.ctaTextContent}</a>
      ${paymentButton}
      ${loadingDots}
      ${chatPaymentFormContainer(config.translations)} */}
      <div>
        <div class="js-error error-message hidden">{translations.error}</div>
        <div class="js-error-email error-message hidden"></div>
        <div id="error-label" class="error-message hidden"></div>
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
      </div>
    </ChatWrapper >
  );
};

export default Chatbot;
