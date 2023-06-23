import { io } from 'socket.io-client';
import {
  chatMarkup,
  initiatorProfile,
  rolesHTML,
  timeMarkup,
} from './chat-widgets';
import { styles } from './styles';
import { assistant } from './config/assistant';
import { events } from './config/events';
import { roles } from './config/roles';
import { socketConfig } from './config/socket';
import { theme } from './config/theme';
import { translations } from './config/translations';
import cssMinify from './css-minify';
import {
  constructLink,
  extractStringWithBrackets,
  getAnswerConfig,
  getTerm,
  getUserId,
  initializeAddClassMethod,
} from './helpers';
import {
  errorMessage,
  input,
  loadingDots,
  resendButton,
  scroll,
} from './utils';

const STORAGE_KEY = 'history';
const CHAT_SEEN_KEY = 'chatSeen';
const SOCKET_IO_URL = 'http://localhost:5000';
const UNSENT_MESSAGES_KEY = 'unsent';

const ChatUi = {
  theme,
  assistant,
  events,
  roles,
  socketConfig,
  translations,
  socket: null,
  elements: null,
  userId: null,
  term: null,
  url: null,
  link: null,
  initialHeight: null,
  containerId: 'chatbot-container',
  typingEvents: [],
  timeStart: null,
  timerId: null,
  typingTimerIds: [],
  lastQuestionData: {
    term: '',
    user_id: '',
    message: '',
  },
  /**
   * Initializes the chat module.
   * @param {object} config - The configuration object.
   * @example
   * // Example usage:
   * const config = {
   *   url: 'http://localhost:5000',
   *   assistantConfig: {
   *      image: 'https://assets.appsforfit.com/assets/avatars/practitioner-1.png',
   *      role: 'Lead Nutrition Expert, PhD',
   *      name: 'Jenny Wilson',
   *      welcome: 'Chat for 1 min, and get diet advise for free!',
   *      ctaTextContent: 'Customize Your Plan!',
   *   },
   *   customTheme: {
   *      '--lumina': '#f0f2f5',
   *      '--whisper': '#ffffff',
   *      '--seraph': '#21bb5a',
   *      '--ember': '#cacadb',
   *      '--zephyr': '43, 49, 57',
   *      '--enigma': '#FFAE19',
   *   },
   * };
   * init(config);
   */
  init(config = {}) {
    if (localStorage.getItem(CHAT_SEEN_KEY)) {
      this.closeSocket();
      return;
    }
    this.setConfig(config);
    this.setMessageObject();
    this.setCustomVars();
    this.setDomContent();
    this.setSocket();
  },
  setConfig(config) {
    this.url = config.url || SOCKET_IO_URL;
    this.containerId = config.containerId || this.containerId;
    config.assistantConfig = config.assistantConfig || {};
    config.customTheme = config.customTheme || {};
    config.translations = config.translations || {};

    this.socketConfig = config.socketConfig || this.socketConfig;
    this.theme = { ...this.theme, ...config.customTheme };
    this.assistant = { ...this.assistant, ...config.assistantConfig };
    this.mainContainer = document.getElementById(this.containerId);
    this.translations = { ...this.translations, ...config.translations };
  },
  setMessageObject() {
    this.lastQuestionData.term = getTerm();
    this.lastQuestionData.user_id = getUserId();
  },
  /**
   * Handles the response from the server containing the chat history.
   * Prepends the initial assistant message to the history.
   * Updates the local storage with the updated history.
   * If the history is empty except for the initial message, displays loading dots and appends the initial message.
   * Otherwise, loads the existing messages from the history.
   *
   * @param {Object} res - The response object containing the chat history.
   * @returns {void}
   */
  onChatHistory(res) {
    console.log('onChatHistory: ', res);
    errorMessage.hide();
    loadingDots.hide();
    this.refreshLocalStorageHistory(res.history);
    if (res.errors.length) {
      this.lastQuestionData.message = this.getLastUserMessage();
      this.onError();
      return;
    }

    const visualizedHistory =
      document.querySelectorAll('#message-incrementor .user').length +
      document.querySelectorAll('#message-incrementor .assistant').length;

    if (!res.history.length && !visualizedHistory) {
      this.loadExistingMessage();
      return;
    }

    this.messages.clear();
    input.show(this);
    res.history.unshift(this.assistant.initialMessage);
    res.history.forEach(data => this.appendHtml(data));
  },
  getLastUserMessage() {
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const messageFound = messages
      .reverse()
      .find(message => message.role === roles.user);
    const lastMessage = messageFound ? messageFound.content : '';

    return lastMessage;
  },
  /**
   * Closes the socket connection if it is open.
   *
   * @returns {void}
   */
  closeSocket() {
    this.socket && this.socket.close();
  },
  /**
   * Initializes the socket connection with the server.
   * It connects to the server using the specified URL and socket options.
   * Sets up event listeners for 'chat' and 'chatHistory' events.
   * Emits the 'chatHistory' event to request chat history for the user.
   *
   * @returns {void}
   */
  setSocket() {
    this.socket = io.connect(this.url, this.socketConfig);
    this.socket.on(this.events.connect, this.onConnect.bind(this));
    this.socket.on(this.events.disconnect, this.onDisconnect.bind(this));
    this.socket.on(this.events.chat, this.onChat.bind(this));
    this.socket.on(this.events.chatHistory, this.onChatHistory.bind(this));

    this.socket.on('stream-start', () => {
      loadingDots.hide();
      this.elements.messageIncrementor.appendChild(rolesHTML['assistant'](''));
    });

    // Listen for the 'stream-data' event from the server
    this.socket.on('stream-data', data => {
      // Handle the received data
      console.log('Received stream data:', data);
      const lastMessageElement = this.getLastMessageElement('.assistant');
      lastMessageElement.innerHTML += data.chunk;
      lastMessageElement.addClass('cursor');
      // You can perform any desired operations with the received data here
    });

    // Listen for the 'stream-end' event from the server
    this.socket.on('stream-end', () => {
      // Handle the end of the stream
      const lastMessageElement = this.getLastMessageElement('.assistant');
      lastMessageElement.classList.remove('cursor');
      console.log('Stream ended');
    });

    // Optionally, handle any errors from the server
    this.socket.on('error', error => {
      console.error('Socket error:', error);
    });

    // TODO do something on server error
    // this.socket.on("error", (reason) => {});
  },
  /**
   * Handles the connect event.
   * It emits the 'chatHistory' event to request chat history for the user.
   *
   * @returns {void}
   */
  onConnect() {
    console.log(`Connected to ${this.url}, socket id: ${this.socket.id}`);

    this.socket.emit(this.events.chatHistory, {
      user_id: this.lastQuestionData.user_id,
    });
  },
  /**
   * Handles the disconnect event.
   *
   * @returns {void}
   */
  onDisconnect() {
    console.log(`Disconnected from ${this.url}`);
  },
  refreshLocalStorageHistory(history) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  },
  /**
   * Handles the chat response received from the server.
   * It checks for errors in the response and triggers an error state if any errors are present.
   * It extracts the last message from the response, along with a link if present.
   * it removes the wave element, performs necessary UI updates, and sets the link if available.
   *
   * @param {Object} res - The chat response object containing messages and errors.
   * @returns {void}
   */
  onChat(res) {
    console.log('onChat: ', res);

    const { answer, messages, errors } = res;
    this.refreshLocalStorageHistory(messages);

    if (errors && errors.length) {
      this.lastQuestionData.message = this.getLastUserMessage();
      this.onError();
      return;
    }

    errorMessage.hide();
    const lastMessage = messages[messages.length - 1];
    this.link = constructLink(answer);
    loadingDots.hide();
    // this.type(lastMessage);

    if (this.link) {
      this.setCtaButton();
    }
  },
  // type(data) {
  //   const state = this;
  //   const { time, role, content } = data;
  //   const { extractedString, updatedMessage } = extractStringWithBrackets(content);
  //   this.elements.messageIncrementor.appendChild(timeMarkup(time));
  //   this.elements.messageIncrementor.appendChild(rolesHTML[role](''));
  //   const lastMessageElement = this.getLastMessageElement('.assistant');
  //   let i = 0;
  //   this.typingEvents.push({
  //     content: updatedMessage,
  //     timerIds: [],
  //     element: lastMessageElement,
  //   });
  //   this.resetPreviousTyping();
  //   extractedString && input.hide(this);

  //   function typeWriter() {
  //     if (i < updatedMessage.length) {
  //       lastMessageElement.innerHTML += updatedMessage.charAt(i);
  //       lastMessageElement.addClass('cursor');
  //       state.scrollToBottom();
  //       const timerId = setTimeout(typeWriter, 50);
  //       state.typingEvents[0].timerIds.push(timerId);
  //       i++;
  //     }

  //   if (i === updatedMessage.length) {
  //     lastMessageElement.innerHTML = replaceLinksWithAnchors(updatedMessage);
  //     lastMessageElement.classList.remove('cursor');
  //     extractedString && state.addOptions(lastMessageElement, extractedString);
  //   }
  // }

  //   typeWriter();
  // },
  singleChoice(e) {
    this.lastQuestionData.message = e.target.textContent;
    const data = {
      role: roles.user,
      content: e.target.textContent,
      time: new Date().toISOString(),
    };
    this.socket.emit(events.chat, this.lastQuestionData);
    this.lastQuestionData.message = '';
    this.appendHtml(data);
    e.target.parentElement.remove();
  },
  addOptions(element, extractedString) {
    // set the listed answers inside the container
    const answerConfig = getAnswerConfig(extractedString);
    const answersContainer = document.createElement('div');
    answersContainer.classList.add('answers-container');
    [...answerConfig.list].forEach(answer => {
      const optionElement = document.createElement('div');
      optionElement.textContent = answer.content;
      optionElement.addEventListener(
        'click',
        this[answerConfig.answersType].bind(this),
      );
      answersContainer.appendChild(optionElement);
    });
    element.appendChild(answersContainer);
  },
  getLastMessageElement(role) {
    return this.elements.messageIncrementor.querySelectorAll(role)[
      this.elements.messageIncrementor.querySelectorAll(role).length - 1
    ];
  },
  /**
   * It shows the CTA button, sets the href attribute to the link, and hides the prompt container.
   *
   * @param {string} link - The link to be set.
   * @returns {void}
   */
  setCtaButton() {
    this.elements.ctaButton.classList.remove('hidden');
    this.elements.ctaButton.setAttribute('href', this.link);
    this.elements.promptContainer.classList.add('hidden');
    this.elements.messageInput.disabled = true;
  },
  /**
   * Sets custom variables and applies them to the main container element and font family.
   * Theme-specific properties are handled separately.
   *
   * @returns {void}
   */
  setCustomVars() {
    Object.entries(this.theme).forEach(([property, value]) => {
      this.mainContainer.style.setProperty(property, value);
    });
  },
  /**
   * Sets the DOM content of the chat widget by creating and appending the necessary HTML elements,
   * applying the provided styles, setting up the widget elements, and attaching event listeners.
   *
   * @returns {void}
   */
  setDomContent() {
    const style = document.createElement('style');
    this.initialHeight = window.innerHeight;
    style.textContent = cssMinify(styles(this.initialHeight));
    this.mainContainer.classList.add('chat-container');
    this.mainContainer.innerHTML += chatMarkup(this);
    this.mainContainer.appendChild(style);
    this.setElements();
    this.elements.messageIncrementor.appendChild(initiatorProfile(this));
    scroll.remove();
    this.attachListeners();
    initializeAddClassMethod();
  },
  setElements() {
    this.elements = {
      messageInput: document.getElementById('chat-prompt'),
      sendButton: document.getElementById('send-button'),
      messageIncrementor: document.getElementById('message-incrementor'),
      closeButton: document.getElementById('close-widget'),
      ctaButton: document.getElementById('cta-button'),
      promptContainer: document.getElementById('prompt-container'),
      loadingDots: document.querySelector('.js-wave'),
    };
  },
  /**
   * Appends the HTML content to the chat message container and scrolls to the bottom.
   *
   * @param {Object} data - The chat message data object.
   * @returns {void}
   */
  appendHtml(data) {
    const { time, role, content } = data;
    this.elements.messageIncrementor.appendChild(timeMarkup(time));
    this.elements.messageIncrementor.appendChild(rolesHTML[role](content));
  },
  /**
   * Loads and displays existing messages from localStorage.
   *
   * @returns {void}
   */
  loadExistingMessage() {
    loadingDots.show();
    setTimeout(() => {
      loadingDots.hide();
      const { extractedString, updatedMessage } = extractStringWithBrackets(
        this.assistant.initialMessage.content,
      );
      this.assistant.initialMessage.content = updatedMessage;
      this.appendHtml(this.assistant.initialMessage);
      const lastMessageElement = this.getLastMessageElement('.assistant');
      if (extractedString) {
        input.hide(this);
        this.addOptions(lastMessageElement, extractedString);
      }
    }, 1500);
  },
  /**
   * adds new message to lastQuestionData.message, clears the input field and visualizes it
   *
   * @returns {void}
   */
  addNewMessage() {
    const content = this.elements.messageInput.value.trim();
    this.typingHandler();
    input.focus(this);

    if (content === '') {
      return;
    }

    const data = { role: roles.user, content, time: new Date().toISOString() };
    const lastMessages = this.lastQuestionData.message
      ? this.lastQuestionData.message.split('\n')
      : [];
    lastMessages.push(content);
    this.lastQuestionData.message = lastMessages.join('\n');

    this.appendHtml(data);
    this.elements.messageInput.value = '';
  },
  /**
   * Emits a chat event to the socket server with the last question data.
   * If the socket is connected, it sends the data and adds loading dots to the message incrementor.
   * If the socket is disconnected, it hides the resend icon, triggers an error after a delay, and performs necessary UI updates.
   *
   * @returns {void}
   */
  socketEmitChat() {
    resendButton.hideAll();
    errorMessage.hide();
    if (this.lastQuestionData.message) {
      if (this.socket.connected) {
        this.socket.emit(this.events.chat, this.lastQuestionData);
        console.log('Emit chat: ', this.lastQuestionData);
        this.lastQuestionData.message = '';
        localStorage.removeItem(UNSENT_MESSAGES_KEY);
        loadingDots.show();
      } else {
        localStorage.setItem(
          UNSENT_MESSAGES_KEY,
          this.lastQuestionData.message,
        );
        setTimeout(() => {
          this.onError();
        }, 2000);
      }
    }
  },
  /**
   * Handles the error event by updating the last user message element to allow resending the message.
   * It adds a click event listener to the element and removes the hidden class from the resend icon.
   *
   * @returns {void}
   */
  onError() {
    console.log('onError: ', this);
    loadingDots.hide();
    errorMessage.show();
    resendButton.hideAll();
    this.lastQuestionData.message =
      localStorage.getItem(UNSENT_MESSAGES_KEY) || this.getLastUserMessage();
    resendButton.show(this);
  },
  /**
   * Retrieves the last user message element from the message incrementor.
   * If the element exists, it clones and replaces it to ensure it is the latest instance.
   *
   * @returns {Element|null} - The last user message element if found, otherwise null.
   */
  getLastUserMessageElement() {
    const oldChild = this.getLastMessageElement('.user');

    if (oldChild) {
      const newLast = oldChild.cloneNode(true);
      oldChild.parentNode.replaceChild(newLast, oldChild);
      return newLast;
    }
    return null;
  },
  /**
   * Closes the widget by clearing the main container, closing the socket connection,
   * and setting the chat as seen in localStorage.
   *
   * @returns {void}
   */
  closeWidget() {
    this.mainContainer.innerHTML = '';
    scroll.add();
    this.closeSocket();
    localStorage.setItem(CHAT_SEEN_KEY, true);
  },
  /**
   * Attaches event listeners to the chat widget elements.
   *
   * @returns {void}
   */
  attachListeners() {
    this.elements.closeButton?.addEventListener(
      'click',
      this.closeWidget.bind(this),
    );
    this.elements.sendButton.addEventListener(
      'click',
      this.addNewMessage.bind(this),
    );
    this.elements.ctaButton.addEventListener(
      'click',
      this.closeWidget.bind(this),
    );
    this.elements.messageInput.addEventListener(
      'keydown',
      this.onKeyDown.bind(this),
    );
    window.onresize = this.onResize;
  },
  onResize() {
    const element = document.querySelector('.chat-widget');
    const windowHeight = window.innerHeight;
    element.style.height = windowHeight + 'px';
  },
  /**
   * Handles the keydown event and sends a message when the Enter key is pressed.
   *
   * @param {KeyboardEvent} event - The keydown event object.
   * @returns {void}
   */
  onKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addNewMessage();
    }
    this.typingHandler();
  },
  typingHandler() {
    const timerId = setTimeout(() => {
      this.socketEmitChat();
    }, 3000);

    this.typingTimerIds.forEach(t => clearTimeout(t));
    this.typingTimerIds.push(timerId);
  },
  messages: {
    clear: () => {
      const messages = [
        ...document.querySelectorAll('.assistant'),
        ...document.querySelectorAll('.date-formatted'),
        ...document.querySelectorAll('.user'),
      ];
      messages.forEach(m => m.remove);
    },
  },
};

export default ChatUi;
