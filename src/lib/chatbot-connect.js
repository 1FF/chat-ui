import { io } from "socket.io-client";
import { chatMarkup, loadingDots, styles } from "./chat-widgets";
import cssMinify from "./css-minify";
import { extractLink, formatDateByLocale, getRandomInteger } from "./helpers";
const STORAGE_KEY = 'history';
const CHAT_SEEN_KEY = 'chatSeen';

// these are the default colors set in case no customTheme is passed upon init ChatbotConnect.init(theme);
// const theme = {
//   '--lumina': '#f0f2f5',
//   '--whisper': '#ffffff',
//   '--seraph': '#21bb5a',
//   '--ember': '#cacadb',
//   '--zephyr': '43, 49, 57',
//   '--font-family': 'Roboto',
// };

const theme = {
  '--lumina': '#252239',
  '--whisper': '#151226',
  '--seraph': '#f53373',
  '--ember': '#cacadb',
  '--zephyr': '255, 255, 255',
  '--enigma': '#0f0e1e',
  '--font-family': 'Plus Jakarta Sans',
};

const SOCKET_IO_URL = 'http://localhost:5000';

const themeSpecificKeys = {
  fontFamily: '--font-family',
}

const ChatbotConnect = {
  theme,
  fontFamily: 'Arial',
  socket: null,
  elements: null,
  events: { chat: 'chat', chatHistory: 'chat-history' },
  userId: '',
  term: '',
  assistant: {
    image: 'https://randomuser.me/api/portraits/women/90.jpg', //hardcoded for now may be set on connection
    role: 'Lead Nutrition Expert, PhD', //hardcoded for now may be set on connection
    name: 'Jenny Wilson',//hardcoded for now may be set on connection
    welcome: 'Have a quick chat with our personal nutritionist and get a free consultation about the perfect diet for you',
  },
  /**
   * Initializes the chatbot, setting up the necessary configurations and elements.
   *
   * @param {String} userId - The user ID of the user.
   * @param {Object} customTheme - Custom theme configuration for the chatbot (optional).
   * @param {string} containerId - ID of the HTML container element for the chatbot (optional).
   * @returns {void}
   */
  init(userId, term, customTheme = {}, containerId = 'chatbot-container') {
    if (localStorage.getItem(CHAT_SEEN_KEY)) {
      this.closeSocket();
      return;
    };
    this.term = term;
    this.userId = userId;
    this.theme = { ...this.theme, ...customTheme };
    this.mainContainer = document.getElementById(containerId);
    this.setCustomVars();
    this.setCustomFont();
    this.setDomContent();
    this.setSocket();
    this.loadExistingMessages();
    this.socket && this.socket.on(this.events.chat, this.onChat.bind(this));
    this.socket && this.socket.on(this.events.chatHistory, this.onChatHistory.bind(this));
    this.socket && this.socket.emit(this.events.chatHistory, { user_id: this.userId });
  },
  onChatHistory(res) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res.history));
    this.loadExistingMessages();
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
    this.socket = io.connect(SOCKET_IO_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      secure: true,
      reconnect: true,
    });
  },
  /**
   * Handles the chat response received from the server.
   *
   * @param {Object} res - The chat response object.
   * @returns {void}
   */
  onChat(res) {
    const { messages, errors } = res;

    // TODO do something on error
    if (errors && errors.length) {
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const link = extractLink(lastMessage.content);

    setTimeout(() => {
      document.getElementById('wave').remove();
      this.togglePointerEvents();
      this.appendHtml(lastMessage);
      if (link) {
        this.elements.ctaButton.classList.remove('hidden');
        this.elements.ctaButton.setAttribute('href', link);
        this.elements.promptContainer.classList.add('hidden');
      }
    }, getRandomInteger(2500, 5000));
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
    const documentHeight = window.innerHeight;
    style.textContent = cssMinify(styles(documentHeight));
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
    if (!this.elements.messageIncrementor) {
      return;
    }

    const { time, role, content } = data;

    this.elements.messageIncrementor.innerHTML += `<div class="date-formatted">${formatDateByLocale(time)}</div>` + `<span class="${role}">${content}</span>`;
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
    const questionData = {
      "term": this.term, //hardcoded for now it will be taken from url
      "user_id": this.userId,
      "message": "" // updated on each user prompt and each assistant response
    }
    const data = { role: 'user', content, time: new Date().toISOString() };
    this.appendHtml(data);
    questionData.message = content;
    this.socket.emit(this.events.chat, questionData);
    this.elements.messageInput.value = '';
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
    this.elements.messageInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.sendMessage();
        this.togglePointerEvents();
        this.elements.messageIncrementor.innerHTML += loadingDots;
        this.scrollToBottom();
        event.preventDefault();
      }
    });
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