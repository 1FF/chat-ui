import React, { useEffect, useState } from 'react';
import connectSocket from './lib/services/socket';
import ChatWrapper from './components/ChatWrapper';
import Head from './components/Head';
import SendButton from './components/SendButton';
import LoadingDots from './components/LoadingDots';
import MessagesWrapper from './components/MessagesWrapper';
import InitiatorProfile from './components/InitiatorProfile';
import PromptContainer from './components/PromptContainer';
import MessageBubble from './components/MessageBubble';
import { assistant } from './lib/config/assistant';
import { roles } from './lib/config/roles';
import { translations } from './lib/config/translations';

import "./styles/index.css";
import { getTerm, getUserId } from './lib/helpers';
import { events } from './lib/config/events';

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16),
  );
};

!localStorage.getItem('__cid') && localStorage.setItem('__cid', uuidv4());

const Chatbot = ({ config }) => {
  const [socket, setSocket] = useState(() => {
    console.log('Set socket connection');
    return connectSocket(config.url, {
      onConnect,
      onHistory,
      onStreamData,
      onStreamEnd,
      onStreamStart
    });
  });

  const [lastMessageData, setLastMessageData] = useState({
    term: getTerm(),
    user_id: getUserId(),
    role: roles.user,
    message: '',
  });

  const [error, setError] = useState('');
  const [shouldShowChat, setShouldShowChat] = useState(false);
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const [shouldSendUnsent, setShouldSendUnsent] = useState(false);
  const [history, setHistory] = useState([]);
  const [typingTimerIds, setTypingTimerIds] = useState([]);
  const [unsentMessages, setUnsentMessages] = useState([]);
  const [currentUserInput, setCurrentUserInput] = useState('');

  function onConnect() {
    setShouldShowChat(true);
  }

  function onStreamStart(data) {
    console.log('Stream started', data);
    setIsLoaderVisible(false);
    setHistory((prev) => [...prev, ...[{ role: 'assistant', content: '', time: '', isReceiving: true }]]);
  }

  function onStreamData(data) {
    console.log('Stream data retrieval', data);
    setHistory((prevHistory) => {
      const updatedHistory = [...prevHistory];

      if (updatedHistory.length > 0) {
        const lastMessage = updatedHistory[updatedHistory.length - 1];
        lastMessage.content += data.chunk;;
      }

      return updatedHistory;
    });
  }

  function onStreamEnd(data) {
    console.log('Stream ended', data);
    setHistory((prevHistory) => {
      const updatedHistory = [...prevHistory];

      if (updatedHistory.length > 0) {
        const lastMessage = updatedHistory[updatedHistory.length - 1];
        lastMessage.isReceiving = false;
      }

      return updatedHistory;
    });
  }

  function onHistory({ user_id, history, errors }) {
    console.log('Received user history', { user_id, history, errors });
    setError('');
    setIsLoaderVisible(false);
    setHistory(history);

    if (!history.length) {
      const message = { ...lastMessageData, role: 'assistant', message: assistant.initialMessage.content };
      console.log('Send initial message to socket', message);
      setHistory((prev) => [...prev, { role: 'assistant', content: assistant.initialMessage.content }]);
      socket.emit(events.chat, message);
      return;
    }

    // if (localStorage.getItem(UNSENT_MESSAGES_KEY)) {
    //   this.appendUnsentMessage();
    // }

    if (errors.length) {
      setError('History error');
    }
  }

  // Having new message added means that we have to send it through the socket
  useEffect(() => {
    if (lastMessageData.message) {
      console.log('Send message to socket', lastMessageData);
      // TODO handle any errors in case emitting is unsuccessful
      socket.emit(events.chat, lastMessageData)
      setIsLoaderVisible(true);
    }

    return () => {
      setLastMessageData((prev) => ({ ...prev, message: '' }));
    }
  }, [lastMessageData.message])

  // On update of the unsent messages we add new message to the visual state and clear the input
  useEffect(() => {
    if (unsentMessages.length) {
      setHistory((prev) => [...prev, { ...lastMessageData, content: currentUserInput }]);
      setCurrentUserInput('');
    }
  }, [unsentMessages])

  // When timer is expired we update lastMessageData
  useEffect(() => {
    if (unsentMessages.length && shouldSendUnsent) {
      setLastMessageData((prev) => ({ ...prev, message: unsentMessages.join('\n') }));
      setUnsentMessages([]);
    }
    setShouldSendUnsent(false);
  }, [shouldSendUnsent])

  function handleKeyUp({ key }) {
    const inputText = currentUserInput.trim();
    if (inputText === '') {
      return;
    }

    if (key === 'Enter') {
      setUnsentMessages((prev) => [...prev, inputText]);
    }

    typingTimerIds.forEach(clearTimeout);

    const newTimer = setTimeout(() => {
      setShouldSendUnsent(true);
    }, 3000);

    setTypingTimerIds(prev => [...prev, newTimer]);
  }

  function handleInputChange(e) {
    setCurrentUserInput(e.target.value);
  }

  return (
    <ChatWrapper shouldShowChat={shouldShowChat}>
      <Head assistant={assistant} />
      <MessagesWrapper>
        <InitiatorProfile assistant={assistant} />

        <div className="date-formatted">AUGUST 28, 2023 AT 1:58 PM</div>
        {(history.map((message, index) => (
          <MessageBubble key={index} content={message.content} isAssistant={message.role === 'assistant'} isReceiving={message.isReceiving || false} />
        )))}

      </MessagesWrapper>
      <LoadingDots isVisible={isLoaderVisible} />
      {/* <a class="chat-widget__cta hidden" id="cta-button">${config.assistant.ctaTextContent}</a>
      ${paymentButton}
     
      ${chatPaymentFormContainer(config.translations)} */}
      <div>
        <div className={`js-error error-message ${error ? '' : 'hidden'}`}>{config.translations.error}</div>
        <span className="chat-widget__prompt" id="prompt-container">
          <PromptContainer translations={config.translations} onKeyUp={handleKeyUp} onChange={handleInputChange} value={currentUserInput} />
          <SendButton onClick={() => { handleKeyUp({ key: 'Enter' }) }} />
        </span>
      </div>
    </ChatWrapper >
  );
};

export default Chatbot;
