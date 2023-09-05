import React, { useEffect, useState, useRef } from 'react';
import connectSocket from './lib/services/socket';
import ChatWrapper from './components/ChatWrapper';
import Head from './components/Head';
import SendButton from './components/SendButton';
import LoadingDots from './components/LoadingDots';
import MessagesWrapper from './components/MessagesWrapper';
import InitiatorProfile from './components/InitiatorProfile';
import EmailField from './components/EmailField';
import PromptField from './components/PromptField';
import MessageBubble from './components/MessageBubble';
import { assistant } from './lib/config/assistant';
import { translations as defaultTranslations } from './lib/config/translations';
import { roles } from './lib/config/roles';
import * as nodeEvents from 'events';

export const intentions = new nodeEvents.EventEmitter();
import './styles/index.css';
import { extractStringWithBrackets, getTerm, getUserId } from './lib/helpers';

// for simulations purpose must be removed
window.intentions = intentions;

import { events } from './lib/config/events';
import { intentionType } from './lib/config/intentionTypes';
import { ALREADY_REGISTERED_KEY, EXISTING_PRODUCT_LINK_KEY } from './lib/config/properties';

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
  );
}

!localStorage.getItem('__cid') && localStorage.setItem('__cid', uuidv4());

const Chatbot = ({ config }) => {
  const [lastMessageData, setLastMessageData] = useState({
    term: getTerm(),
    user_id: getUserId(),
    role: roles.user,
    message: '',
  });
  const [error, setError] = useState('');
  const [shouldShowChat, setShouldShowChat] = useState(false);
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const [isEmailLoaderVisible, setIEmailLoaderVisible] = useState(false);
  const [shouldSendUnsent, setShouldSendUnsent] = useState(false);
  const [history, setHistory] = useState([]);
  const [typingTimerIds, setTypingTimerIds] = useState([]);
  const [unsentMessages, setUnsentMessages] = useState([]);
  const [loginLink, setLoginLink] = useState(localStorage.getItem(EXISTING_PRODUCT_LINK_KEY));
  const [translations, setTranslations] = useState({ ...defaultTranslations, ...config.translations });
  const [errors, setErrors] = useState([])
  const [socket, setSocket] = useState(() => {
    return connectSocket(config.url, {
      onConnect,
      onHistory,
      onStreamData,
      onStreamEnd,
      onStreamStart,
    });
  });
  const [isPromptInputVisible, setIsPromptInputVisible] = useState(true);
  const [isEmailInputVisible, setIsEmailInputVisible] = useState(false);
  const lastMessageRef = useRef(null);
  const promptInputRef = useRef(null);
  const emailInputRef = useRef(null);

  let optionsFromStream = '';

  intentions.on(intentionType.emailError, (response) => {
    setIEmailLoaderVisible(false);

    if (response.status === 409) {
      localStorage.setItem(ALREADY_REGISTERED_KEY, 'true');
      setLoginLink(localStorage.getItem(EXISTING_PRODUCT_LINK_KEY));
      return;
    }

    if (response.status === 422) {
      // TODO: visualize errors
      setErrors((prev) => [...prev, response.errors.email[0]])
    }
  });

  intentions.on(intentionType.emailSuccess, () => {
    const currentEmail = emailInputRef.current.value
    setIEmailLoaderVisible(false);
    setLastMessageData(prev => { return { ...prev, message: emailInputRef.current.value } });
    setHistory(prev => [...prev, { role: roles.assistant, content: emailInputRef.current.value }]);
    setIsEmailInputVisible(false);
    setIsPromptInputVisible(false);
    store.set('answers', { 'saved-email': currentEmail });
    emailInputRef.current.value = '';
  });

  function onConnect() {
    setShouldShowChat(true);
  }

  function onStreamStart(data) {
    setIsLoaderVisible(false);
    setHistory((prev) => [...prev, { role: 'assistant', content: '', time: '', isReceiving: true }]);
  }

  function onStreamData(data) {

    // const { messages, errors } = data;

    // if (errors && errors.length) {
    //   this.onError();
    //   return;
    // }

    if (data.chunk.includes('[')) {
      optionsFromStream += data.chunk;
      return;
    }

    if (data.chunk.includes(']') || optionsFromStream) {
      optionsFromStream += data.chunk;
      return;
    }

    lastMessageRef.current.querySelector('.js-assistant-message').textContent += data.chunk;


    // }
  }

  function onStreamEnd(data) {
    if (optionsFromStream.includes(intentionType.payment)) {
      console.log('show payment button');
      return;
    }

    if (optionsFromStream.includes(intentionType.email)) {
      setHistory((prevHistory) => {
        if (prevHistory.length === 0) {
          return prevHistory;
        }

        const updatedHistory = [...prevHistory];
        const lastMessage = updatedHistory[updatedHistory.length - 1];
        lastMessage.isReceiving = false;

        return updatedHistory;
      });
      setIsEmailInputVisible(true);
      return;
    }

    setHistory((prevHistory) => {
      if (prevHistory.length === 0) {
        return prevHistory;
      }

      const updatedHistory = [...prevHistory];
      const lastMessage = updatedHistory[updatedHistory.length - 1];
      const { content, options } = getOptions(optionsFromStream);

      lastMessage.options = options;
      lastMessage.isReceiving = false;

      return updatedHistory;
    });

    optionsFromStream = '';
  }

  function getOptions(string) {
    const { updatedMessage, extractedString } = extractStringWithBrackets(string);
    return { content: updatedMessage, options: extractedString.split('|').filter(item => item !== '') };
  }

  function onHistory({ user_id, history, errors }) {
    console.log('Received user history', { user_id, history, errors });
    setError('');
    setIsLoaderVisible(false);

    if (!history.length) {
      const { content, options } = getOptions(assistant.initialMessage.content);
      const message = { role: roles.assistant, message: assistant.initialMessage.content, user_id: getUserId() };
      console.log('Save initial message in mongo', message)
      setHistory([
        { role: roles.assistant, content, options },
      ]);
      socket.emit(events.chat, message);
      return
    }

    setHistory(
      history.map((item, index) => {
        const { content, options } = getOptions(item.content);
        item.content = content;
        if (index === history.length - 1) {
          item.options = options;
        }
        return item;
      })
    );

    // if (localStorage.getItem(UNSENT_MESSAGES_KEY)) {
    //   this.appendUnsentMessage();
    // }

    if (errors.length) {
      setError('History error');
    }
  }

  useEffect(() => {
    const lastMessage = history[history.length - 1];

    if (lastMessage && lastMessage.options && lastMessage.options.length > 0) {
      setIsPromptInputVisible(false);
    } else {
      setIsPromptInputVisible(true);
    }

    return () => {
      console.log('destroy');
    };
  }, [history]);

  // Having new message added means that we have to send it through the socket
  useEffect(() => {
    if (lastMessageData.message) {
      // TODO handle any errors in case emitting is unsuccessful
      socket.emit(events.chat, lastMessageData);
      setIsLoaderVisible(true);
    }

    return () => {
      setLastMessageData((prev) => ({ ...prev, message: '' }));
    };
  }, [lastMessageData.message]);

  // On update of the unsent messages we add new message to the visual state and clear the input
  useEffect(() => {
    if (unsentMessages.length) {
      const content = promptInputRef.current.value;
      setHistory((prev) => [...prev, { ...lastMessageData, content }]);
      promptInputRef.current.value = '';
    }
  }, [unsentMessages]);

  // When timer is expired we update lastMessageData
  useEffect(() => {
    if (unsentMessages.length && shouldSendUnsent) {
      setLastMessageData((prev) => ({ ...prev, message: unsentMessages.join('\n') }));
      setUnsentMessages([]);
    }
    setShouldSendUnsent(false);
  }, [shouldSendUnsent]);

  function promptKeyUpHandler({ key }) {
    const inputText = promptInputRef.current.value.trim();
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

    setTypingTimerIds((prev) => [...prev, newTimer]);
  }

  function onClickChoice(e) {
    const currentUserChoice = e.currentTarget.textContent;
    if (history.length) {
      setHistory(history => {
        const modifiedHistory = history.map((item, index) => {
          if (index === history.length - 1) {
            item.options = ''
          }
          return item;
        })
        modifiedHistory.push({ content: currentUserChoice, role: roles.user })
        return modifiedHistory;
      });
    }
    setLastMessageData((prev) => ({ ...prev, message: currentUserChoice }));
  }

  function emailKeyUpHandler({ key }) {
    if (emailInputRef.current.value === '') { return }

    if (key === 'Enter') {
      console.log(emailInputRef.current.value);

      const storedCustomerUuid = localStorage.getItem('__pd')
        ? JSON.parse(localStorage.getItem('__pd')).customerUuid
        : null;

      const data = {
        email: emailInputRef.current.value,
        customerUuid: storedCustomerUuid || lastMessageData.user_id,
      };

      setIEmailLoaderVisible(true);
      intentions.emit(intentionType.email, data);
    }
  }

  function onSubmitHandler() {
    if (isEmailInputVisible) {
      emailKeyUpHandler({ key: 'Enter' })
    }
    if (isPromptInputVisible) {
      promptKeyUpHandler({ key: 'Enter' });
    }
  }

  function clearEmailHandler() {
    emailInputRef.current.value = '';
    setIEmailLoaderVisible(false);


    // answersContainer.remove();
    setHistory((prev) => [...prev, { role: roles.user, content: translations.tm715 }]);

    localStorage.removeItem(ALREADY_REGISTERED_KEY);
    localStorage.removeItem(EXISTING_PRODUCT_LINK_KEY);
  }

  function loginWithCurrentMailHandler() {
    setLastMessageData({ ...lastMessageData, message: translations.tm526 })
    localStorage.removeItem(ALREADY_REGISTERED_KEY);
    localStorage.removeItem(EXISTING_PRODUCT_LINK_KEY);
  }

  return (
    <ChatWrapper shouldShowChat={shouldShowChat}>
      <Head assistant={assistant} />
      <MessagesWrapper>
        <InitiatorProfile assistant={assistant} />

        <div className="date-formatted">AUGUST 28, 2023 AT 1:58 PM</div>
        {history.map((message, index) => (
          <MessageBubble
            key={`${message.role}-message-${index}`}
            message={message}
            onClickChoice={onClickChoice}
            innerRef={lastMessageRef}
          />
        ))}

        <span className={`${loginLink ? '' : 'hidden'} assistant`}>
          <span className="js-assistant-message">{translations.tm716}</span>
          <div className="answers-container">
            <a href={loginLink} onClick={loginWithCurrentMailHandler}>{translations.tm526}</a>
            <div onClick={clearEmailHandler}>{translations.tm715}</div>
          </div>
        </span>

      </MessagesWrapper>
      <LoadingDots isVisible={isLoaderVisible} />
      {/* <a class="chat-widget__cta hidden" id="cta-button">${config.assistant.ctaTextContent}</a>
      ${paymentButton}
     
      ${chatPaymentFormContainer(config.translations)} */}
      <div>
        <div className={`js-error error-message ${error ? '' : 'hidden'}`}>{translations.error}</div>
        <span className="chat-widget__prompt" id="prompt-container">
          <span className="widget__input">
            <PromptField
              translations={translations}
              onKeyUp={promptKeyUpHandler}
              promptInputRef={promptInputRef}
              isPromptInputVisible={isPromptInputVisible && !isEmailInputVisible}
            />
            <EmailField
              translations={translations}
              onKeyUp={emailKeyUpHandler}
              emailInputRef={emailInputRef}
              isEmailInputVisible={isEmailInputVisible}
              isLoaderVisible={isEmailLoaderVisible}
            />
          </span>
          <SendButton
            onClick={onSubmitHandler}
            disabled={isEmailLoaderVisible}
            isButtonVisible={isPromptInputVisible || isEmailInputVisible}
          />
        </span>
      </div>
    </ChatWrapper>
  );
};

export default Chatbot;
