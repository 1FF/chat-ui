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
import { onChatHistory, onConnect, onDisconnect, onStreamData, onStreamEnd, onStreamError, onStreamStart, socketEmitChat } from './socket-services';
import { constructLink } from "./helpers";

const STORAGE_KEY = 'history';
const CHAT_SEEN_KEY = 'chatSeen';
const SOCKET_IO_URL = 'http://localhost:5000';
export const UNSENT_MESSAGES_KEY = 'unsent';

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
  answersFromStream: '',
  boldedText: '',
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
    // optional parts of the config that need to be initialized as object at least
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
  loadUserHistory(history) {
    input.show(this);
    history.unshift(this.assistant.initialMessage);
    this.elements.messageIncrementor.appendChild(timeMarkup(history[0].time));
    history.forEach(data => this.appendHtml(data));
    const lastMessageByAssistant = this.getLastMessageElement('.assistant');
    this.link = lastMessageByAssistant.querySelector('a');
    if (this.link) {
      this.setCtaButton();
    }
  },
  appendUnsentMessage() {
    const data = { content: localStorage.getItem(UNSENT_MESSAGES_KEY), time: new Date().toISOString(), role: roles.user }
    this.appendHtml(data);
    this.onError();
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
   * Sets up event listeners for all events defined
   *
   * @returns {void}
   */
  setSocket() {
    this.socket = io.connect(this.url, this.socketConfig);
    this.socket.on(this.events.connect, onConnect.bind(this));
    this.socket.on(this.events.disconnect, onDisconnect.bind(this));
    this.socket.on(this.events.chatHistory, onChatHistory.bind(this));
    this.socket.on(this.events.streamStart, onStreamStart.bind(this));
    this.socket.on(this.events.streamData, onStreamData.bind(this));
    this.socket.on(this.events.streamEnd, onStreamEnd.bind(this));
    this.socket.on(this.events.streamError, onStreamError.bind(this));
    // TODO do something on server error
    // this.socket.on("error", (reason) => {});
  },
  processTextInCaseOfSquareBrackets() {
    if (this.chunk.includes('[')) {
      this.answersFromStream = this.chunk;
    };

    if (this.answersFromStream) {
      this.answersFromStream += this.chunk;
    };

    if (this.answersFromStream.includes(']')) {
      this.addOptions();
      this.chunk = '';
    };
  },
  processTextInCaseOfCurlyBrackets() {
    if (this.chunk.includes('{')) {
      this.boldedText = this.chunk;
      this.chunk = '';
    };

    if (this.boldedText || this.boldedText && this.chunk.includes('}')) {
      this.boldedText += this.chunk;
      this.chunk = '';
    };

    if (this.boldedText.includes('}')) {
      this.link = constructLink(this.boldedText);
      if (this.link) {
        this.setCtaButton();
      }

      let strongTaggedText = this.boldedText.replace('{', '').replace('}', '');
      strongTaggedText = `<strong>${strongTaggedText}</strong>`;
      const lastMessageTextContainer = this.getLastMessageElement('.assistant .js-assistant-message');
      lastMessageTextContainer.innerHTML += strongTaggedText;
      this.boldedText = '';
    };
  },
  refreshLocalStorageHistory(history) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  },
  singleChoice(e) {
    this.lastQuestionData.message = e.target.textContent;
    const data = {
      role: roles.user,
      content: e.target.textContent,
      time: new Date().toISOString(),
    };
    socketEmitChat(this);
    this.appendHtml(data);
    e.target.parentElement.remove();
  },
  addOptions() {
    const element = this.getLastMessageElement('.assistant');
    const answerConfig = getAnswerConfig(this.answersFromStream);

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
    this.answersFromStream = '';
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
    input.hide(this);
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
   * Appends the HTML content to the chat message container.
   *
   * @param {Object} data - The chat message data object.
   * @returns {void}
   */
  appendHtml(data) {
    const { time, role, content } = data;
    this.elements.messageIncrementor.appendChild(rolesHTML[role](content));
  },
  /**
   * Loads initial message from the assistant object and checks if the message contains any brackets.
   * If it does, it extracts the string between the brackets and sets the initial message to the extracted string.
   * It also adds the options to the chat widget.
   * If the message doesn't contain any brackets, it sets the initial message to the message content.
   * It also hides the input field and adds the options to the chat widget.
   *
   * @returns {void}
   */
  loadAssistantInitialMessage() {
    loadingDots.show();
    setTimeout(() => {
      loadingDots.hide();
      const { extractedString, updatedMessage } = extractStringWithBrackets(
        this.assistant.initialMessage.content,
      );

      const data = { content: updatedMessage, ...this.assistant.initialMessage };
      this.elements.messageIncrementor.appendChild(timeMarkup(data.time));
      this.appendHtml(data);

      if (extractedString) {
        input.hide(this);
        this.answersFromStream = extractedString;
        this.addOptions();
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
   * Handles the error event by updating the last user message element to allow resending the message.
   * It adds a click event listener to the element and removes the hidden class from the resend icon.
   *
   * @returns {void}
   */
  onError() {
    window.debugMode && console.log('onError: ', this);
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
      socketEmitChat(this);
    }, 3000);

    this.typingTimerIds.forEach(t => clearTimeout(t));
    this.typingTimerIds.push(timerId);
  },
};

export default ChatUi;
