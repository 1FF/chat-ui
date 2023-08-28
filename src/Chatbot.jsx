import React from 'react';
import ChatWrapper from './components/ChatWrapper';
import Head from './components/Head';
import MessagesWrapper from './components/MessagesWrapper';
import InitiatorProfile from './components/InitiatorProfile';
import { assistant } from './lib/config/assistant';
import "./styles/index.css";

const Chatbot = (props) => {
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
    </ChatWrapper>
  );
};

export default Chatbot;
