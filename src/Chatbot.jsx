import React, { useEffect, useState, useRef } from 'react';
import connectSocket from './lib/services/socket';
import Button from './components/Button';
import ChatWrapper from './components/ChatWrapper';
import EmailField from './components/EmailField';
import Head from './components/Head';
import InitiatorProfile from './components/InitiatorProfile';
import LoadingDots from './components/LoadingDots';
import Link from './components/Link';
import MessageBubble from './components/MessageBubble';
import MessagesWrapper from './components/MessagesWrapper';
import PaymentFormWrapper from './components/PaymentFormWrapper';
import PromptField from './components/PromptField';
import SendButton from './components/SendButton';
import { ALREADY_REGISTERED_KEY, EXISTING_PRODUCT_LINK_KEY } from './lib/config/properties';
import { assistant } from './lib/config/assistant';
import { translations as defaultTranslations } from './lib/config/translations';
import { extractStringWithBrackets, getTerm, getUserId } from './lib/helpers';
import { roles } from './lib/config/roles';
import { intentionType } from "./lib/config/intentionTypes";
import { events } from './lib/config/events';
import * as nodeEvents from 'events';
export const eventEmitter = new nodeEvents.EventEmitter();
import './styles/index.css';
import { getDisplayInfo } from './lib/chat-widgets';

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
  );
}

!localStorage.getItem('__cid') && localStorage.setItem('__cid', uuidv4());

const Chatbot = ({ config }) => {
  const lastMessageRef = useRef(null);
  const promptInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const [lastMessageData, setLastMessageData] = useState({
    term: getTerm(),
    user_id: getUserId(),
    role: roles.user,
    message: '',
  });
  const [shouldShowChat, setShouldShowChat] = useState(false);
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const [isEmailLoaderVisible, setIEmailLoaderVisible] = useState(false);
  const [shouldSendUnsent, setShouldSendUnsent] = useState(false);
  const [history, setHistory] = useState([]);
  const [typingTimerIds, setTypingTimerIds] = useState([]);
  const [unsentMessages, setUnsentMessages] = useState([]);
  const [loginLink, setLoginLink] = useState(localStorage.getItem(EXISTING_PRODUCT_LINK_KEY));
  const [translations, setTranslations] = useState({ ...defaultTranslations, ...config.translations, ...config.assistantConfig });
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
  const [intentions, setIntentions] = useState(eventEmitter);
  const [isPromptInputVisible, setIsPromptInputVisible] = useState(true);
  const [isEmailInputVisible, setIsEmailInputVisible] = useState(false);
  const [ctaText, setCtaText] = useState(translations.ctaTextContent);
  const [ctaLink, setCtaLink] = useState('');
  const [isPaymentButtonVisible, setIsPaymentButtonVisible] = useState(false);

  let optionsFromStream = '';

  useEffect(() => {
    intentions.on(intentionType.emailError, onEmailError);
    intentions.on(intentionType.emailSuccess, onEmailSuccess);
    return () => {
      intentions.off(intentionType.emailSuccess, onEmailSuccess);
      intentions.off(intentionType.emailError, onEmailError);
    }
  }, [intentions])

  window.intentions = intentions;

  function onEmailError(response) {
    setIEmailLoaderVisible(false);

    if (response.status === 409) {
      localStorage.setItem(ALREADY_REGISTERED_KEY, 'true');
      setLoginLink(localStorage.getItem(EXISTING_PRODUCT_LINK_KEY));
      setHistory(prev => [...prev, {
        role: roles.assistant, content: translations.tm716,
        options: [{ handler: loginWithCurrentMailHandler, link: loginLink, content: translations.tm526 },
        { handler: clearEmailHandler, content: translations.tm715 }]
      }]);
      return;
    }

    if (response.status === 422) {
      // TODO: visualize errors
      setErrors((prev) => [...prev, response.errors.email[0]])
    }
  }

  function onEmailSuccess(response) {
    const currentEmail = emailInputRef.current.value
    setIEmailLoaderVisible(false);
    setLastMessageData(prev => { return { ...prev, message: currentEmail } });
    setHistory(prev => [...prev, { role: roles.user, content: currentEmail }]);
    setIsEmailInputVisible(false);
    setIsPromptInputVisible(false);
    emailInputRef.current.value = '';
  }

  function onConnect() {
    setShouldShowChat(true);
  }

  function onStreamStart(data) {
    optionsFromStream = '';
    setIsLoaderVisible(false);
    setHistory((prev) => [...prev, { role: roles.assistant, content: '', time: '', isReceiving: true }]);
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

  function unsetIsReceiving({ prevHistory, withOptions, withPrice }) {
    if (prevHistory.length === 0) {
      return prevHistory;
    }

    const updatedHistory = [...prevHistory];
    const lastMessage = updatedHistory[updatedHistory.length - 1];
    const { content, options } = getOptions(optionsFromStream);
    if (withOptions) {
      lastMessage.options = options;
    }

    if (withPrice) {
      const { price, period } = getDisplayInfo();
      // Regex replaces all html tags with empty string
      lastMessage.price = price + ' ' + period.replace(/<[^>]*>/g, '');
    }

    lastMessage.isReceiving = false;

    return updatedHistory;
  }

  function onStreamEnd(data) {
    if (optionsFromStream.includes(intentionType.payment)) {
      setHistory((prevHistory) => unsetIsReceiving({ prevHistory, withOptions: false, withPrice: true }));
      setIsPaymentButtonVisible(true);
      setIsPromptInputVisible(false);
      setIsEmailInputVisible(false);
      return;
    }

    if (optionsFromStream.includes(intentionType.email)) {
      setHistory((prevHistory) => unsetIsReceiving({ prevHistory, withOptions: false, withPrice: false }));
      setIsEmailInputVisible(true);
      setIsPromptInputVisible(false);
      return;
    }

    setIsPromptInputVisible(true);
    setHistory((prevHistory) => unsetIsReceiving({ prevHistory, withOptions: true, withPrice: false }));
  }

  function getOptions(string) {
    const { updatedMessage, extractedString } = extractStringWithBrackets(string);
    return { content: updatedMessage, options: extractedString.split('|').filter(item => item !== '') };
  }

  function onHistory({ user_id, history, errors }) {
    console.log('Received user history', { user_id, history, errors });
    setErrors([]);
    setIsLoaderVisible(false);

    if (!history.length) {
      const { content, options } = getOptions(translations.initialMessage.content);
      const message = { role: roles.assistant, message: translations.initialMessage.content, user_id: getUserId() };
      console.log('Save initial message in mongo', message)
      setHistory([
        { role: roles.assistant, content, options },
      ]);
      socket.emit(events.chat, message);
      return
    }

    const freshHistory = history.map((item, index) => {
      const originalContent = item.content;
      const isLast = index === history.length - 1;
      const { content, options } = getOptions(originalContent);

      item.content = content;

      if (isLast && originalContent.includes(intentionType.email)) {
        setIsEmailInputVisible(true);
        setIsPromptInputVisible(false);
        return item;
      }

      if (isLast && originalContent.includes(intentionType.payment)) {
        setIsPaymentButtonVisible(true);
        setIsPromptInputVisible(false);
        setIsEmailInputVisible(false);
        const { price, period } = getDisplayInfo();
        // Regex replaces all html tags with empty string
        item.price = price + ' ' + period.replace(/<[^>]*>/g, '');
        return item;
      }

      if (isLast) {
        item.options = options;
        return item;
      }
      return item;
    });


    setHistory(freshHistory);

    // if (localStorage.getItem(UNSENT_MESSAGES_KEY)) {
    //   this.appendUnsentMessage();
    // }

    if (errors.length) {
      setErrors(['History error']);
    }
  }

  useEffect(() => {
    const lastMessage = history[history.length - 1];
    const hasOptions = lastMessage && lastMessage.options && lastMessage.options.length > 0;

    if (hasOptions) {
      setIsPromptInputVisible(false);
      setIsEmailInputVisible(false);
    }

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
    <ChatWrapper theme={config.theme} shouldShowChat={shouldShowChat}>
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
      </MessagesWrapper>
      <LoadingDots isVisible={isLoaderVisible} />
      <Link text={ctaText} link={ctaLink} />
      <Button text={'Proceed with payment'} isVisible={isPaymentButtonVisible} />
      <PaymentFormWrapper translations={translations} />
      <div>
        <div className={`js-error error-message ${errors.length ? '' : 'hidden'}`}>{translations.error}</div>
        <span className="chat-widget__prompt" id="prompt-container">
          <span className="widget__input">
            <PromptField
              translations={translations}
              onKeyUp={promptKeyUpHandler}
              promptInputRef={promptInputRef}
              isPromptInputVisible={isPromptInputVisible}
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
