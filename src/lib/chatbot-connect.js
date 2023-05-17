import { io } from "socket.io-client";
import { chatMarkup, loadingDots, rolesHTML, styles } from "./chat-widgets";
import { assistant } from "./config/assistant";
import { events } from "./config/events";
import { roles } from "./config/roles";
import { theme } from "./config/theme";
import cssMinify from "./css-minify";
import { extractLink, formatDateByLocale, getRandomInteger, replaceLinkWithAnchor } from "./helpers";

const STORAGE_KEY = 'history';
const CHAT_SEEN_KEY = 'chatSeen';
const SOCKET_IO_URL = 'http://localhost:5000';

const themeSpecificKeys = {
  fontFamily: '--font-family',
}

const ChatbotConnect = {
  theme,
  assistant,
  events,
  roles,
  fontFamily: 'Arial',
  socket: null,
  elements: null,
  userId: null,
  term: null,
  url: null,
  initialHeight: null,
  lastQuestionData: {
    "term": '',
    "user_id": '',
    "message": '',
  },
  /**
   * Initializes the chatbot, setting up the necessary configurations and elements.
   *
   * @param {String} [url=SOCKET_IO_URL] - The URL of the socket server. Defaults to SOCKET_IO_URL constant.
   * @param {Object} [assistantConfig] - Custom configuration for the assistant (optional).
   * @param {Object} [customTheme={}] - Custom theme configuration for the chatbot (optional).
   * @param {String} [containerId='chatbot-container'] - ID of the HTML container element for the chatbot (optional).
   * @returns {void}
   */
  init(url = SOCKET_IO_URL, assistantConfig = {}, customTheme = {}, containerId = 'chatbot-container') {
    if (localStorage.getItem(CHAT_SEEN_KEY)) {
      this.closeSocket();
      return;
    };
    this.url = url;
    this.theme = { ...this.theme, ...customTheme };
    this.assistant = { ...this.assistant, ...assistantConfig };
    this.mainContainer = document.getElementById(containerId);
    this.setMessageObject();
    this.setCustomVars();
    this.setCustomFont();
    this.setDomContent();
    this.setSocket();
  },
  setMessageObject() {
    this.lastQuestionData.term = this.getTerm();
    this.lastQuestionData.user_id = localStorage.getItem('__cid');
  },
  getTerm() {
    const url = window.location.search;
    const urlParams = new URLSearchParams(url);

    return urlParams.get('utm_chat');
  },
  onChatHistory(res) {
    res.history.unshift(this.assistant.initialMessage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res.history));
    if (res.history.length === 1) {
      this.elements.messageIncrementor.innerHTML += loadingDots;
      setTimeout(() => {
        document.getElementById('wave').remove();
        this.appendHtml(res.history[0]);
      }, 1500);
    } else {
      this.loadExistingMessages();
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
   * Sets up the socket connection by creating a socket instance with the specified options.
   *
   * @returns {void}
   */
  setSocket() {
    this.socket = io.connect(this.url, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      secure: true,
      reconnect: true,
    });

    this.socket.on(this.events.chat, this.onChat.bind(this));
    this.socket.on(this.events.chatHistory, this.onChatHistory.bind(this));
    this.socket.emit(this.events.chatHistory, { user_id: this.lastQuestionData.user_id });
    // TODO do something on server error or disconnection
    // this.socket.on("disconnect", (reason) => {
    //   console.log(reason);
    // });
    // this.socket.on("error", this.onSocketError.bind(this));
  },
  /**
   * Handles the chat response received from the server.
   *
   * @param {Object} res - The chat response object.
   * @returns {void}
   */
  onChat(res) {
    const { messages, errors } = res;

    if (errors && errors.length) {
      document.getElementById('wave')?.remove();
      this.onError();
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const link = extractLink(lastMessage.content);

    setTimeout(() => {
      document.getElementById('wave').remove();
      this.togglePointerEvents();
      this.appendHtml(lastMessage);
      if (link) {
        this.setLink(link);
      }
    }, getRandomInteger(2500, 5000));
  },
  setLink(link) {
    const lastMessageElement = this.elements.messageIncrementor.querySelectorAll('.assistant')[this.elements.messageIncrementor.querySelectorAll('.assistant').length - 1];
    lastMessageElement.innerHTML = replaceLinkWithAnchor(lastMessageElement.textContent)
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
      if (property === themeSpecificKeys.fontFamily) {
        this.fontFamily = value;
      }
      this.mainContainer.style.setProperty(property, value);
    });
  },
  /**
   * Sets the custom font for the chatbot if it is not already loaded.
   *
   * @returns {void}
   */
  setCustomFont() {
    const isCurrentFontLoaded = document.fonts.check(`1em ${this.fontFamily}`);
    if (isCurrentFontLoaded) {
      return;
    }

    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = `https://fonts.googleapis.com/css2?family=${this.fontFamily.replace(/\s/g, '+')}&display=swap`;
    document.head.appendChild(linkElement);
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
    this.attachListeners();
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

    this.elements.messageIncrementor.innerHTML += `<div class="date-formatted">${formatDateByLocale(time)}</div>` + rolesHTML[role](content);
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
  loadExistingMessages() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!history) {
      return
    }

    this.elements.messageIncrementor.innerHTML = '';
    history.forEach((data) => this.appendHtml(data));
  },
  /**
   * Sends a user message by extracting the content from the message input,
   * adding the message to the socketData, updating the UI, and emitting the chat event.
   *
   * @returns {void}
   */
  sendMessage() {
    const content = this.elements.messageInput.value.trim();
    if (content === '') {
      return;
    }

    const data = { role: 'user', content, time: new Date().toISOString() };
    this.lastQuestionData.message = content;

    this.appendHtml(data);
    this.socketEmitChat();
  },
  socketEmitChat() {
    const lastChild = this.getLastUserMessageElement();

    if (this.socket.connected) {
      this.socket.emit(this.events.chat, this.lastQuestionData);
      this.elements.messageIncrementor.innerHTML += loadingDots;
    } else {
      lastChild.querySelector('.resend-icon').classList.add('hidden');
      setTimeout(() => {
        this.onError();
      }, 2000);
    }

    this.togglePointerEvents();
    this.scrollToBottom();
    this.elements.messageInput.value = '';
  },
  onError() {
    const lastUserMessageElement = this.getLastUserMessageElement();
    lastUserMessageElement.style.cursor = 'pointer';
    lastUserMessageElement.addEventListener('click', this.socketEmitChat.bind(this, this.lastQuestionData));
    lastUserMessageElement.querySelector('.resend-icon').classList.remove('hidden');
  },
  getLastUserMessageElement() {
    const oldChild = this.elements.messageIncrementor.querySelectorAll('.user')[this.elements.messageIncrementor.querySelectorAll('.user').length - 1];
    if (oldChild && oldChild.classList.contains('user')) {
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
    this.closeSocket();
    localStorage.setItem(CHAT_SEEN_KEY, true);
  },
  /**
   * Attaches event listeners to the chat widget elements.
   *
   * @returns {void}
   */
  attachListeners() {
    this.elements.closeButton.addEventListener('click', this.closeWidget.bind(this));
    this.elements.sendButton.addEventListener('click', this.sendMessage.bind(this));
    this.elements.ctaButton.addEventListener('click', this.closeWidget.bind(this));
    this.elements.messageInput.addEventListener('keydown', (event) => this.onKeyDown(event));
  },
  onKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
  },
  /**
   * Toggles the pointer events for the message input and send button elements.
   *
   * @returns {void}
   */
  togglePointerEvents() {
    this.elements.messageInput.style.pointerEvents = this.elements.messageInput.style.pointerEvents === 'none' ? 'auto' : 'none';
    this.elements.messageInput.disabled = !this.elements.messageInput.disabled;
    this.elements.sendButton.style.pointerEvents = this.elements.sendButton.style.pointerEvents === 'none' ? 'auto' : 'none';
    this.elements.sendButton.disable = !this.elements.sendButton.disable;
  },
};

export default ChatbotConnect;