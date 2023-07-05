import { UNSENT_MESSAGES_KEY } from "./chat-ui";
import { rolesHTML } from "./chat-widgets";
import { constructLink, replaceLinksWithAnchors } from "./helpers";
import { errorMessage, input, loadingDots, messages, resendButton } from "./utils";
/**
 * Handles the start of the stream.
 * Hides loading dots, appends the current timestamp, and adds the assistant role element.
 *
 * @function onStreamStart
 * @memberof module:Chat
 * @returns {void}
 */
export function onStreamStart() {
  window.debugMode && console.log('stream-start');
  loadingDots.hide();
  this.elements.messageIncrementor.appendChild(rolesHTML['assistant'](''));
};

/**
* Handles the connect event.
* It emits the 'chatHistory' event to request chat history for the user.
*
* @returns {void}
*/
export function onConnect() {
  window.debugMode && console.log(`Connected to ${this.url}, socket id: ${this.socket.id}`);

  this.socket.emit(this.events.chatHistory, {
    user_id: this.lastQuestionData.user_id,
  });
};

/**
 * Handles the disconnect event.
 *
 * @returns {void}
 */
export function onDisconnect() {
  window.debugMode && console.log(`Disconnected from ${this.url}`);
};


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
export function onChatHistory(res) {
  window.debugMode && console.log('onChatHistory: ', res);
  messages.clear();
  errorMessage.hide();
  loadingDots.hide();
  this.refreshLocalStorageHistory(res.history);

  // when it is a fresh user without any history
  if (!res.history.length) {
    this.loadAssistantInitialMessage();
    return;
  }

  // when it is an user with history load all its messages
  this.loadUserHistory(res.history);

  if (localStorage.getItem(UNSENT_MESSAGES_KEY)) {
    this.appendUnsentMessage();
  }

  if (res.errors.length) {
    this.onError();
  }
};

/**
 * Handles the data received in the stream.
 * Logs the received data in debug mode, refreshes the local storage history,
 * handles errors if present, processes the received text, and updates the last assistant message.
 *
 * @function onStreamData
 * @memberof module:Chat
 * @param {Object} data - The data received in the stream.
 * @param {Array} data.messages - The array of messages received.
 * @param {Array} data.errors - The array of errors received.
 * @returns {void}
 */
export function onStreamData(data) {
  window.debugMode && console.log('Received stream data:', data);

  const { messages, errors } = data;
  this.refreshLocalStorageHistory(messages);

  if (errors && errors.length) {
    this.onError();
    return;
  }

  const lastMessageElement = this.getLastMessageElement('.assistant .js-assistant-message');
  this.chunk = data.chunk;

  this.processTextInCaseOfSquareBrackets();
  this.processTextInCaseOfCurlyBrackets();

  !this.answersFromStream && (lastMessageElement.innerHTML += this.chunk);
  lastMessageElement.addClass('cursor');
};

/**
 * Handles the end of the stream.
 * Performs necessary actions such as removing the last assistant message if it's empty,
 * adjusting CSS classes,
 * and showing/hiding the input based on the presence of answers.
 *
 * @function onStreamEnd
 * @memberof module:Chat
 * @returns {void}
 */
export function onStreamEnd() {
  window.debugMode && console.log('Stream ended');
  const lastMessageElement = this.getLastMessageElement('.assistant');
  const lastMessageTextContainer = lastMessageElement.querySelector('.js-assistant-message');

  // in case stream ended with empty message, remove it from the DOM.
  lastMessageTextContainer.textContent === '' && lastMessageElement.remove();

  lastMessageTextContainer.classList.remove('cursor');
  this.hasAnswers = lastMessageElement.querySelector('.answers-container');
  this.link = constructLink(lastMessageTextContainer.innerHTML);
  lastMessageTextContainer.innerHTML = replaceLinksWithAnchors(lastMessageTextContainer.innerHTML);

  if (this.link) {
    this.setCtaButton();
    return;
  }

  if (this.hasAnswers) {
    input.hide(this);
    return;
  };

  input.show(this);
  input.focus(this);
};

export function onStreamError(error) {
  window.debugMode && console.log('Stream error:', error);
  this.onError();
};

/**
 * Emits a chat event to the socket server with the last question data.
 * If the socket is connected, it sends the data and adds loading dots to the message incrementor.
 * If the socket is disconnected, it hides the resend icon, triggers an error after a delay, and performs necessary UI updates.
 *
 * @returns {void}
 */
export function socketEmitChat(state) {
  resendButton.hideAll();
  errorMessage.hide();
  if (state.lastQuestionData.message) {
    if (state.socket.connected) {
      state.socket.emit(state.events.chat, state.lastQuestionData);
      window.debugMode && console.log('Emit chat: ', state.lastQuestionData);
      state.lastQuestionData.message = '';
      localStorage.removeItem(UNSENT_MESSAGES_KEY);
      loadingDots.show();
    } else {
      localStorage.setItem(
        UNSENT_MESSAGES_KEY,
        state.lastQuestionData.message,
      );
      setTimeout(() => {
        state.onError();
      }, 2000);
    }
  }
};
