import { io } from 'socket.io-client';
import { chatMarkup, loadingDots, rolesHTML, styles } from './chat-widgets';
import { assistant } from './config/assistant';
import { events } from './config/events';
import { roles } from './config/roles';
import { socketConfig } from './config/socket';
import { theme } from './config/theme';
import cssMinify from './css-minify';
import {
  constructLink,
  formatDateByLocale,
  getRandomInteger,
  getUserId,
  initializeAddClassMethod,
  replaceLinksWithAnchors,
} from './helpers';

const STORAGE_KEY = 'history';
const CHAT_SEEN_KEY = 'chatSeen';
const SOCKET_IO_URL = 'http://localhost:5000';

const ChatUi = {
  theme,
  assistant,
  events,
  roles,
  socketConfig,
  socket: null,
  elements: null,
  userId: null,
  term: null,
  url: null,
  initialHeight: null,
  containerId: 'chatbot-container',
  isTyping: false,
  timeStart: null,
  timerId: null,
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

    this.socketConfig = config.socketConfig || this.socketConfig;
    this.theme = { ...this.theme, ...config.customTheme };
    this.assistant = { ...this.assistant, ...config.assistantConfig };
    this.mainContainer = document.getElementById(this.containerId);
  },
  setMessageObject() {
    this.lastQuestionData.term = this.getTerm();
    this.lastQuestionData.user_id = getUserId();
  },
  /**
   * Retrieves the value of the 'utm_chat' parameter from the current URL.
   *
   * @returns {string|null} The value of the 'utm_chat' parameter, or null if it is not present.
   */
  getTerm() {
    const url = window.location.search;
    const urlParams = new URLSearchParams(url);

    return urlParams.get('utm_chat');
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(res.history));
    const visualizedHistory =
      document.querySelectorAll('#message-incrementor .user').length +
      document.querySelectorAll('#message-incrementor .assistant').length;

    if (!res.history.length && !visualizedHistory) {
      this.loadExistingMessage();
      return;
    }

    if (res.history.length + 1 > visualizedHistory) {
      this.elements.messageIncrementor.innerHTML = '';
      res.history.unshift(this.assistant.initialMessage);
      res.history.forEach(data => this.appendHtml(data));
    }
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
  /**
   * Handles the chat response received from the server.
   * It checks for errors in the response and triggers an error state if any errors are present.
   * It extracts the last message from the response, along with a link if present.
   * After a delay, it removes the wave element, performs necessary UI updates, and sets the link if available.
   *
   * @param {Object} res - The chat response object containing messages and errors.
   * @returns {void}
   */
  onChat(res) {
    console.log('onChat: ', res);

    const { messages, errors } = res;

    if (errors && errors.length) {
      document.getElementById('wave')?.remove();
      this.onError();
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const link = constructLink(lastMessage.content);
    setTimeout(() => {
      this.clearWavesLoader();
      this.appendHtml(lastMessage);
      this.lastQuestionData.message = '';
      if (link) {
        this.setLink(link);
      }
    }, this.getResponseTime());
  },
  getResponseTime() {
    const timeTookToResolvePromise = performance.now() - this.timeStart;

    if (timeTookToResolvePromise > 5000) {
      return 0;
    }

    return getRandomInteger(2500, 5000);
  },
  clearWavesLoader() {
    const wavingDots = document.querySelectorAll('.js-wave');
    wavingDots.forEach(dot => dot.remove());
  },
  /**
   * Sets the link and updates the last assistant message element to include an anchor tag with the link.
   * It also shows the CTA button, sets the href attribute to the link, and hides the prompt container.
   *
   * @param {string} link - The link to be set.
   * @returns {void}
   */
  setLink(link) {
    const lastMessageElement =
      this.elements.messageIncrementor.querySelectorAll('.assistant')[
        this.elements.messageIncrementor.querySelectorAll('.assistant').length -
          1
      ];

    if (!lastMessageElement) {
      return;
    }
    lastMessageElement.innerHTML = replaceLinksWithAnchors(
      lastMessageElement.textContent,
    );
    this.elements.ctaButton.classList.remove('hidden');
    this.elements.ctaButton.setAttribute('href', link);
    this.elements.promptContainer.classList.add('hidden');
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
    this.toggleScroll();
    this.attachListeners();
    initializeAddClassMethod();
  },
  toggleScroll() {
    const body = document.body;
    const getCurrent = () =>
      body.style.overflowY === 'hidden' ? 'visible' : 'hidden';
    body.style.overflowY = getCurrent();
  },
  setElements() {
    this.elements = {
      messageInput: document.getElementById('chat-prompt'),
      sendButton: document.getElementById('send-button'),
      messageIncrementor: document.getElementById('message-incrementor'),
      closeButton: document.getElementById('close-widget'),
      ctaButton: document.getElementById('cta-button'),
      promptContainer: document.getElementById('prompt-container'),
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

    this.elements.messageIncrementor.innerHTML +=
      `<div class="date-formatted">${formatDateByLocale(time)}</div>` +
      rolesHTML[role](content);
    this.scrollToBottom();
  },
  scrollToBottom() {
    const scrollContainer = this.elements.messageIncrementor.parentElement;
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  },
  /**
   * Loads and displays existing messages from localStorage.
   *
   * @returns {void}
   */
  loadExistingMessage() {
    this.elements.messageIncrementor.innerHTML += loadingDots;
    setTimeout(() => {
      this.clearWavesLoader();
      this.appendHtml(this.assistant.initialMessage);
    }, 1500);
  },
  /**
   * Sends a user message by extracting the content from the message input,
   * adding the message to the socketData, updating the UI, and emitting the chat event.
   *
   * @returns {void}
   */
  sendMessage() {
    const content = this.elements.messageInput.value.trim();
    this.typingHandler();

    if (content === '') {
      return;
    }

    const data = { role: 'user', content, time: new Date().toISOString() };
    this.lastQuestionData.message += content + ' ';

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
    if (this.socket.connected) {
      this.socket.emit(this.events.chat, this.lastQuestionData);
      this.elements.messageIncrementor.innerHTML += loadingDots;
      document.querySelectorAll('.resend-icon').forEach(el => {
        el.addClass('hidden');
      });
    } else {
      setTimeout(() => {
        this.onError();
      }, 2000);
    }
    this.scrollToBottom();
    this.elements.messageInput.value = '';
  },
  /**
   * Handles the error event by updating the last user message element to allow resending the message.
   * It adds a click event listener to the element and removes the hidden class from the resend icon.
   *
   * @returns {void}
   */
  onError() {
    console.log('onError: ', this);

    const lastUserMessageElement = this.getLastUserMessageElement();
    if (!lastUserMessageElement) return;
    lastUserMessageElement.style.cursor = 'pointer';
    lastUserMessageElement.addEventListener(
      'click',
      this.socketEmitChat.bind(this, this.lastQuestionData),
    );
    lastUserMessageElement
      .querySelector('.resend-icon')
      .classList.remove('hidden');
  },
  /**
   * Retrieves the last user message element from the message incrementor.
   * If the element exists, it clones and replaces it to ensure it is the latest instance.
   *
   * @returns {Element|null} - The last user message element if found, otherwise null.
   */
  getLastUserMessageElement() {
    const oldChild =
      this.elements.messageIncrementor.querySelectorAll('.user')[
        this.elements.messageIncrementor.querySelectorAll('.user').length - 1
      ];
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
    this.toggleScroll();
    this.closeSocket();
    localStorage.setItem(CHAT_SEEN_KEY, true);
  },
  /**
   * Attaches event listeners to the chat widget elements.
   *
   * @returns {void}
   */
  attachListeners() {
    this.elements.closeButton.addEventListener(
      'click',
      this.closeWidget.bind(this),
    );
    this.elements.sendButton.addEventListener(
      'click',
      this.sendMessage.bind(this),
    );
    this.elements.ctaButton.addEventListener(
      'click',
      this.closeWidget.bind(this),
    );
    this.elements.messageInput.addEventListener('keydown', event =>
      this.onKeyDown(event),
    );
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
      this.sendMessage();
      return;
    }
  },
  typingHandler() {
    clearTimeout(this.timerId);
    this.isTyping = true;
    this.timerId = setTimeout(() => {
      if (this.isTyping && this.elements.messageInput.value.trim() === '') {
        this.isTyping = false;
        this.timeStart = performance.now();
        this.socketEmitChat();
      }
    }, 2000);
  },
};

export default ChatUi;
