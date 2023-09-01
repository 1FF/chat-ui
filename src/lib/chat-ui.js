import {io} from 'socket.io-client';
import {chatMarkup, getDisplayInfo, initiatorProfile, paymentHeader, rolesHTML, timeMarkup} from './chat-widgets';
import {styles} from './styles';
import {assistant} from './config/assistant';
import {events} from './config/events';
import {roles} from './config/roles';
import {socketConfig} from './config/socket';
import {theme} from './config/theme';
import {translations} from './config/translations';
import cssMinify from './css-minify';
import {
  constructLink,
  extractStringWithBrackets,
  getAnswerConfig,
  getTerm,
  getUserId,
  initializeAddClassMethod,
  isExpired,
} from './helpers';
import {emailLoader, errorMessage, input, loadingDots, resendButton, scroll} from './utils';
import {
  onChatHistory,
  onConnect,
  onDisconnect,
  onStreamData,
  onStreamEnd,
  onStreamError,
  onStreamStart,
  socketEmitChat,
} from './socket-services';
import {actionService} from './action-service';
import {customEventTypes, standardEventTypes} from "./custom/tracking-events";

const nodeEvents = require('events');

export const intentions = new nodeEvents.EventEmitter();
export const STORAGE_KEY = 'history';
export const CHAT_SEEN_KEY = 'chatSeen';
export const ALREADY_REGISTERED_KEY = 'showAlreadyRegisteredUser';
export const SHOW_PAYMENT_BUTTON_KEY = 'showPaymentButton';
export const SOCKET_IO_URL = 'http://localhost:5000';
export const UNSENT_MESSAGES_KEY = 'unsent';
export const GO_THROUGH_QUIZ_KEY = 'hasToGoThroughQuiz';
export const EXISTING_PRODUCT_LINK_KEY = 'existingProductLink';

export const intentionType = {
  email: 'email_intent',
  payment: 'payment_intent',
  emailError: 'email_validation_error',
  emailSuccess: 'email_validation_success',
};

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
  showModalForRegisteredUser: '',
  showPaymentButton: '',
  lastQuestionData: {
    term: '',
    user_id: '',
    message: '',
    role: roles.user,
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
    if (this.shouldHideChat()) {
      this.closeSocket();
      return;
    }
    this.setConfig(config);
    this.setMessageObject();
    this.setCustomVars();
    this.setDomContent();
    this.setSocket();
    this.setIntentionEvents();
  },
  setIntentionEvents() {
    intentions.on(intentionType.emailError, (response) => {
      emailLoader.hide();
      this.elements.emailInput.disabled = false;
      this.elements.sendButton.style.pointerEvents = 'auto';
      this.lastQuestionData.message = '';

      if (response.status === 409) {
        this.track(customEventTypes.emailExist);
        localStorage.setItem(ALREADY_REGISTERED_KEY, 'true');
        this.showOptionsForRegisteredUser();
        return;
      }

      if (response.status === 422) {
        this.elements.errorEmail.textContent = response.errors.email[0];
        this.elements.errorEmail.classList.remove('hidden');
        this.track(customEventTypes.emailWrong);
      }
    });

    intentions.on(intentionType.emailSuccess, () => {
      this.lastQuestionData.message = this.elements.emailInput.value;
      this.appendHtml({ role: roles.user, content: this.elements.emailInput.value });
      socketEmitChat(this);
      emailLoader.hide();

      input.hide(this);
      store.set('answers', { 'saved-email': this.elements.emailInput.value });
      this.elements.emailInput.value = '';
      this.elements.emailInput.addClass('hidden');
      this.track(customEventTypes.emailEntered);
    });
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
    this.showModalForRegisteredUser = localStorage.getItem(ALREADY_REGISTERED_KEY);
    this.showPaymentButton = localStorage.getItem(SHOW_PAYMENT_BUTTON_KEY);
    this.hasToGoThroughQuiz = localStorage.getItem(GO_THROUGH_QUIZ_KEY);
  },
  setMessageObject() {
    this.lastQuestionData.term = getTerm();
    this.lastQuestionData.user_id = getUserId();
  },
  loadUserHistory(history) {
    input.show(this);
    this.elements.messageIncrementor.appendChild(timeMarkup(history[0].time));

    this.historyTraverse(history);

    const { content } = history.pop();
    const lastMessageByAssistant = this.getLastMessageElement('.assistant');
    this.link = lastMessageByAssistant.querySelector('a');

    if (this.hasToGoThroughQuiz) {
      this.showSuccessfulPaymentMessage();
      return;
    }

    if (this.link) {
      this.setCtaButton();
    }

    if (content.includes(intentionType.email)) {
      this.setEmailVisibility();
    }

    if (this.showModalForRegisteredUser) {
      this.showOptionsForRegisteredUser();
    }

    if (content.includes(intentionType.payment) || this.showPaymentButton) {
      this.setPaymentIntent();
    }
  },
  historyTraverse(history) {
    let counter = 1;
    let isLastMessage = false;
    history.forEach((data) => {
      if (counter > 1) {
        const updatedContent = actionService.clearButtonCodes(data.content);
        data.content = updatedContent;
      }
      if (counter === history.length) {
        isLastMessage = true;
      }
      this.appendHtml(data, isLastMessage);
      counter++;
    });
  },
  appendUnsentMessage() {
    const data = {
      content: localStorage.getItem(UNSENT_MESSAGES_KEY),
      time: new Date().toISOString(),
      role: roles.user,
    };
    this.appendHtml(data);
    this.onError();
  },
  shouldHideChat() {
    const { time } = this.getLastUserMessage();
    let hasExpired;

    if (time) {
      hasExpired = isExpired(time);
    }

    // when time has expired chatSeen must be removed from localStorage
    if (hasExpired) {
      localStorage.removeItem(CHAT_SEEN_KEY);
    }

    // when user has clicked on ctaButton chatSeen is being set to true
    const chatSeen = localStorage.getItem(CHAT_SEEN_KEY);

    return chatSeen === 'true' ? true : false;
  },
  getLastUserMessage() {
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const messageFound = messages.reverse().find((message) => message.role === roles.user);
    const lastMessage = messageFound ? messageFound : {};

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
    }

    if (this.answersFromStream) {
      this.answersFromStream += this.chunk;
    }

    if (this.answersFromStream.includes(']')) {
      if (this.answersFromStream.includes(intentionType.payment)) {
        this.setPaymentIntent();
        return;
      }

      if (this.answersFromStream.includes(intentionType.email)) {
        this.setEmailVisibility();
        return;
      }

      this.answersFromStream = actionService.clearButtonCodes(this.answersFromStream);
      this.addOptions();
      this.chunk = '';
    }
  },
  processTextInCaseOfCurlyBrackets() {
    if (this.chunk.includes('{')) {
      this.boldedText = this.chunk;
      this.chunk = '';
    }

    if (this.boldedText || (this.boldedText && this.chunk.includes('}'))) {
      this.boldedText += this.chunk;
      this.chunk = '';
    }

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
    }
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
    if (this.isFirstUserMessage()) {
      this.track(customEventTypes.firstMessage);
    }
    socketEmitChat(this);
    this.appendHtml(data);
    e.target.parentElement.remove();
  },
  addOptions() {
    const element = this.getLastMessageElement('.assistant');
    const answerConfig = getAnswerConfig(this.answersFromStream);

    const answersContainer = document.createElement('div');
    answersContainer.classList.add('answers-container');
    [...answerConfig.list].forEach((answer) => {
      const optionElement = document.createElement('div');
      optionElement.textContent = answer.content;
      actionService.handleAction(optionElement, answer.actions);
      optionElement.addEventListener('click', this[answerConfig.answersType].bind(this));
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
  isFirstUserMessage() {
    let history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    return !history.find(obj => {
      return obj.role === roles.user;
    });
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
    this.track(customEventTypes.linkProvided);
    this.elements.ctaButton.addEventListener('click', () => {
      this.track(customEventTypes.linkClicked);
    });
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
      paymentButton: document.getElementById('chat-pay'),
      paymentContainer: document.getElementById('primer-form-container'),
      closePaymentButton: document.querySelector('.close-payment-form'),
      paymentViewForm: document.getElementById('chat-payment-view'),
      emailInput: document.getElementById('chat-email'),
      errorEmail: document.querySelector('.js-error-email'),
      paymentFormLoader: document.querySelector('.js-payment-form-loader'),
    };
  },
  /**
   * Appends the HTML content to the chat message container.
   *
   * @param {Object} data - The chat message data object.
   * @returns {void}
   */
  appendHtml(data, isLastMessage = false) {
    const { role, content } = data;
    const result = rolesHTML[role](content);

    this.elements.messageIncrementor.appendChild(result.element || result);

    this.setLastMessageButtons(result.extractedString, isLastMessage);
  },
  // logic with last message buttons should be refactored
  setLastMessageButtons(extractedString, isLastMessage) {
    if ([intentionType.payment, intentionType.email].includes(extractedString)) {
      return;
    }

    if (extractedString && extractedString !== '' && isLastMessage) {
      input.hide(this);
      this.answersFromStream = '[' + extractedString + ']';
      this.addOptions();
    }
  },
  /**
   * Sends the initial message to the socket server.
   * If the socket is connected, it emits the chat event with the last question data.
   * If the socket is disconnected, it appends the last question data to the local storage history.
   *
   * @returns {void}
   */
  sendAssistantInitialMessage() {
    const data = {
      ...this.lastQuestionData,
      role: roles.assistant,
      message: this.assistant.initialMessage.content,
    };
    this.socket.emit(this.events.chat, data);
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
    this.sendAssistantInitialMessage();
    setTimeout(() => {
      loadingDots.hide();
      const { extractedString, updatedMessage } = extractStringWithBrackets(this.assistant.initialMessage.content);

      const data = {
        content: updatedMessage,
        ...this.assistant.initialMessage,
      };
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
    if (!this.elements.emailInput.classList.contains('hidden')) {
      this.emailSendHandler();
      return;
    }

    if (this.isFirstUserMessage()) {
      this.track(customEventTypes.firstMessage);
    }

    const content = this.elements.messageInput.value.trim();
    this.typingHandler();
    input.focus(this);

    if (content === '') {
      return;
    }

    const data = { role: roles.user, content, time: new Date().toISOString() };
    const lastMessages = this.lastQuestionData.message ? this.lastQuestionData.message.split('\n') : [];
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
    const { content } = this.getLastUserMessage();
    this.lastQuestionData.message = localStorage.getItem(UNSENT_MESSAGES_KEY) || content;
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
    this.elements.closeButton?.addEventListener('click', this.closeWidget.bind(this));
    this.elements.sendButton.addEventListener('click', this.addNewMessage.bind(this));
    this.elements.ctaButton.addEventListener('click', this.closeWidget.bind(this));
    this.elements.messageInput.addEventListener('keydown', this.onKeyDown.bind(this));
    this.elements.emailInput.addEventListener('keydown', this.onKeyDownEmail.bind(this));
    this.elements.paymentButton.addEventListener('click', this.emitPaymentIntentions.bind(this));
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

    this.typingTimerIds.forEach((t) => clearTimeout(t));
    this.typingTimerIds.push(timerId);
  },
  emailSendHandler() {
    const data = this.getCurrentCustomerData();

    emailLoader.show();
    this.elements.emailInput.disabled = true;
    this.elements.sendButton.style.pointerEvents = 'none';
    intentions.emit(intentionType.email, data);
  },
  getCurrentCustomerData() {
    const storedCustomerUuid = localStorage.getItem('__pd')
      ? JSON.parse(localStorage.getItem('__pd')).customerUuid
      : null;
    const data = {
      email: this.elements.emailInput.value,
      customerUuid: storedCustomerUuid || this.lastQuestionData.user_id,
    };

    return data;
  },
  showSuccessfulPaymentMessage() {
    localStorage.setItem(GO_THROUGH_QUIZ_KEY, true);
    const { element } = rolesHTML[roles.assistant](this.translations.tm1226);
    this.elements.messageIncrementor.appendChild(element);
    const last = this.getLastMessageElement('.assistant');
    const answersContainer = document.createElement('div');
    answersContainer.classList.add('answers-container');
    this.link = '/';
    this.elements.ctaButton.textContent = this.translations.tm530;
    this.setCtaButton();

    this.elements.ctaButton.addEventListener('click', () => {
      localStorage.removeItem(GO_THROUGH_QUIZ_KEY);
    });

    // in case the user does not click on take the quiz button
    setTimeout(() => {
      this.elements.ctaButton.click();
    }, 7000);

    last.appendChild(answersContainer);

    this.elements.paymentViewForm.addClass('hidden');
    this.elements.paymentButton.addClass('hidden');
    this.elements.sendButton.addClass('hidden');
    input.hide(this);
  },
  showOptionsForRegisteredUser() {
    const buttonLink = localStorage.getItem(EXISTING_PRODUCT_LINK_KEY);
    const { element } = rolesHTML[roles.assistant](this.translations.tm716);
    this.elements.messageIncrementor.appendChild(element);
    const last = this.getLastMessageElement('.assistant');
    const answersContainer = document.createElement('div');
    answersContainer.classList.add('answers-container');
    const continueToMyPlanButton = document.createElement('a');
    continueToMyPlanButton.href = buttonLink;
    const enterNewEmail = document.createElement('div');
    continueToMyPlanButton.textContent = this.translations.tm526;
    enterNewEmail.textContent = this.translations.tm715;

    this.elements.emailInput.disabled = true;
    this.elements.sendButton.style.pointerEvents = 'none';

    enterNewEmail.addEventListener('click', () => {
      this.elements.emailInput.value = '';
      this.elements.emailInput.disabled = false;
      this.elements.sendButton.style.pointerEvents = 'auto';

      // NOTE: this message is not being send to socket until valid;
      this.lastQuestionData.message = this.elements.emailInput.value;
      answersContainer.remove();
      this.appendHtml({ role: roles.user, content: this.translations.tm715 });

      localStorage.removeItem(ALREADY_REGISTERED_KEY);
      localStorage.removeItem(EXISTING_PRODUCT_LINK_KEY);
    });

    continueToMyPlanButton.addEventListener('click', () => {
      this.lastQuestionData.message = this.translations.tm526;
      localStorage.removeItem(ALREADY_REGISTERED_KEY);
      localStorage.removeItem(EXISTING_PRODUCT_LINK_KEY);
    });

    last.appendChild(answersContainer);
    answersContainer.appendChild(continueToMyPlanButton);
    answersContainer.appendChild(enterNewEmail);
  },
  emitPaymentIntentions() {
    this.elements.paymentButton.disabled = true;
    localStorage.setItem(SHOW_PAYMENT_BUTTON_KEY, true);
    intentions.emit(intentionType.payment, {
      ...this.elements,
      paymentHeader,
      onPaymentSuccess: this.showSuccessfulPaymentMessage.bind(this),
    });
  },
  setPaymentIntent() {
    // set chosen box
    const lastMessageTextContainer = this.getLastMessageElement('.assistant .js-assistant-message');
    const configuredOption = getDisplayInfo();
    lastMessageTextContainer.innerHTML += configuredOption.price + ' ' + configuredOption.period;

    input.hide(this);

    //show payment button
    this.elements.paymentButton.classList.remove('hidden');
    this.elements.paymentButton.disabled = false;
    this.answersFromStream = '';
    this.chunk = '';
    this.track(standardEventTypes.addToCart);
    this.track(customEventTypes.priceSeen);
  },
  setEmailVisibility() {
    this.elements.messageInput.addClass('hidden');
    this.elements.emailInput.classList.remove('hidden');
    this.answersFromStream = '';
    this.chunk = '';
    this.track(standardEventTypes.contact);
    this.track(customEventTypes.emailField);
  },
  track(eventType) {
    const event = tracking.event({
      eventType: eventType,
      systemType: backEndVars.systemType,
      uri: window.location.pathname,
      domain: window.location.hostname,
      email: store.getAnswers()['saved-email'] || null,
      phone: store.get('__ph') || null,
      customerUuid: store.getCustomerUuid(),
      additionalData: {},
      utmParams: store.getMarketingInfo('lastUtmParams'),
    });
    tracking.trackClient(event);
    trackEventInGTM(event);
  },
  onKeyDownEmail(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addNewMessage();
    }
    this.elements.errorEmail.addClass('hidden');
  },
};

export default ChatUi;
