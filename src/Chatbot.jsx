import React from 'react';
import ChatWrapper from './components/ChatWrapper';
import Head from './components/Head';
import MessagesWrapper from './components/MessagesWrapper';
import InitiatorProfile from './components/InitiatorProfile';
import PromptContainer from './components/PromptContainer';
import MessageBubble from './components/MessageBubble';
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

        <MessageBubble content="hello" />
        <MessageBubble content="hello, i need help" isAssistant={false} />
      </MessagesWrapper>

      {/* <a class="chat-widget__cta hidden" id="cta-button">${config.assistant.ctaTextContent}</a>
      ${paymentButton}
      ${loadingDots}
      ${chatPaymentFormContainer(config.translations)} */}
      <div>
        <div class="js-error error-message hidden">{translations.error}</div>
        <div class="js-error-email error-message hidden"></div>
        <div id="error-label" class="error-message hidden"></div>
        <PromptContainer translations={translations}/>
      </div>
    </ChatWrapper >
  );
};

export default Chatbot;
