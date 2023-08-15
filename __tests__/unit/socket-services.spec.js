import { input, loadingDots } from "../../src/lib/utils";
import { onStreamData, onStreamEnd, onStreamStart } from "../../src/lib/socket-services";
import { constructLink, initializeAddClassMethod } from "../../src/lib/helpers";
import ChatUi from "../../src/lib/chat-ui";
import { doc } from "prettier";

describe('socket-services', () => {
  const testMessage = {
    content: 'hello',
    time: '2023-05-12T10:30:45.123Z',
    role: 'assistant',
  };
  test('should call onError and all its methods when onStreamData we have errors', () => {
    // Arrange
    const state = {
      onError: jest.fn(),
      refreshLocalStorageHistory: jest.fn()
    }

    // Act
    onStreamData.bind(state)({ chunk: 'chunk', messages: [{}, {}], errors: ['server error'] });

    // Assert
    expect(state.onError).toBeCalled();
    expect(state.refreshLocalStorageHistory).toBeCalled();
  });

  test('should not call onError when onStreamData we have no errors', () => {
    // Arrange
    document.body.innerHTML = `<div class="js-wave"></div>`
    const state = {
      onError: jest.fn(),
      refreshLocalStorageHistory: jest.fn(),
      getLastMessageElement: jest.fn().mockImplementationOnce(() => document.querySelector('div')),
      processTextInCaseOfSquareBrackets: jest.fn(),
      processTextInCaseOfCurlyBrackets: jest.fn(),
      elements: {
        messageIncrementor: { appendChild: jest.fn() }
      }
    };

    jest.spyOn(loadingDots, 'hide');
    initializeAddClassMethod();

    // Act
    onStreamStart.bind(state)();
    onStreamData.bind(state)({ chunk: 'chunk', messages: [testMessage], errors: [] });

    // Assert
    expect(state.onError).not.toBeCalled();
    expect(loadingDots.hide).toBeCalled();
    expect(state.refreshLocalStorageHistory).toBeCalled();
    expect(state.processTextInCaseOfSquareBrackets).toBeCalled();
    expect(state.elements.messageIncrementor.appendChild).toBeCalledTimes(1);
  });

  test('should call setCtaButton when we have link when onStreamEnd is called', () => {
    // Arrange
    document.body.innerHTML = `<div class="chat-widget__messages-container" id="message-incrementor">
      <span class="assistant">
        <span class="js-assistant-message">Let's find the perfect meal plan for you. </span>
      </span>
      <span class="user js-user">ok<span class="resend-icon hidden"></span></span>
      <span class="assistant">
        <span class="js-assistant-message">Hello! I'm your personal nutritionist. How can I assist you today?</span>
      </span>
      <span class="user js-user">helo<span class="resend-icon hidden"></span></span>
      <span class="assistant">
        <span class="js-assistant-message">Hi there! How can I assist you today https://test.test.com?</span>
        <div class="answers-container"><div>ok</div></div>
      </span>
    </div>`
    const state = {
      setCtaButton: jest.fn(),
      getLastMessageElement: ChatUi.getLastMessageElement,
      elements: { messageIncrementor: document.querySelector('#message-incrementor') },
    };
    jest.spyOn(input, 'show');
    jest.spyOn(input, 'hide');
    jest.spyOn(input, 'focus');

    // Act
    onStreamEnd.bind(state)();

    // Assert
    expect(state.link).toBe('https://test.test.com');
    expect(state.hasAnswers).toBeTruthy();
    expect(state.setCtaButton).toBeCalled();
    expect(input.show).not.toBeCalled();
    expect(input.hide).not.toBeCalled();
    expect(input.focus).not.toBeCalled();
  });

  test('should call input hide when we have answer options when onStreamEnd is called', () => {
    // Arrange
    document.body.innerHTML = `<div class="chat-widget__messages-container" id="message-incrementor">
      <span class="assistant">
        <span class="js-assistant-message">Let's find the perfect meal plan for you. </span>
      </span>
      <span class="user js-user">ok<span class="resend-icon hidden"></span></span>
      <span class="assistant">
        <span class="js-assistant-message">Hello! I'm your personal nutritionist. How can I assist you today?</span>
      </span>
      <span class="user js-user">helo<span class="resend-icon hidden"></span></span>
      <span class="assistant">
        <span class="js-assistant-message">Hi there! How can I assist you today?</span>
        <div class="answers-container"><div>ok</div></div>
      </span>
      <div class="chat-widget__prompt" id="prompt-container">
        <span class="widget__input">
          <input id="chat-prompt" minlength="1" name="chat" autofocus="chat" type="text" placeholder="Write your message here..." disabled="">
        </span>
      </div>
    </div>`
    const state = {
      setCtaButton: jest.fn(),
      getLastMessageElement: ChatUi.getLastMessageElement,
      elements: { messageIncrementor: document.querySelector('#message-incrementor'), promptContainer: document.querySelector('#prompt-container'), messageInput: document.querySelector('#chat-prompt') },
    };
    jest.spyOn(input, 'show');
    jest.spyOn(input, 'hide');
    jest.spyOn(input, 'focus');

    // Act
    onStreamEnd.bind(state)();

    // Assert
    expect(state.link).toBe(false);
    expect(state.hasAnswers).toBeTruthy();
    expect(input.hide).toBeCalled();
    expect(state.setCtaButton).not.toBeCalled();
    expect(input.show).not.toBeCalled();
    expect(input.focus).not.toBeCalled();
  });

  test('should call input show + focus when no link and no answer options when onStreamEnd is called', () => {
    // Arrange
    document.body.innerHTML = `<div class="chat-widget__messages-container" id="message-incrementor">
      <span class="assistant">
        <span class="js-assistant-message">Let's find the perfect meal plan for you. </span>
      </span>
      <span class="user js-user">ok<span class="resend-icon hidden"></span></span>
      <span class="assistant">
        <span class="js-assistant-message">Hello! I'm your personal nutritionist. How can I assist you today?</span>
      </span>
      <span class="user js-user">helo<span class="resend-icon hidden"></span></span>
      <span class="assistant">
        <span class="js-assistant-message">Hi there! How can I assist you today?</span>
      </span>
      <button id="chat-pay" class="js-payment-button payment-button hidden">
        <span class="payment-button__text">Proceed with payment</span>
      </button>
      <a class="chat-widget__cta hidden" id="cta-button">Create Your Menu!</a>
      <div class="chat-widget__prompt" id="prompt-container">
        <span class="widget__input">
          <input id="chat-prompt" minlength="1" name="chat" autofocus="chat" type="text" placeholder="Write your message here..." disabled="">
        </span>
      </div>
    </div>`
    const state = {
      setCtaButton: jest.fn(),
      getLastMessageElement: ChatUi.getLastMessageElement,
      elements: { messageIncrementor: document.querySelector('#message-incrementor'), promptContainer: document.querySelector('#prompt-container'), messageInput: document.querySelector('#chat-prompt'), paymentButton: document.querySelector('#chat-pay'), ctaButton: document.querySelector('#cta-button') },
    };
    jest.spyOn(input, 'show');
    jest.spyOn(input, 'hide');
    jest.spyOn(input, 'focus');

    // Act
    onStreamEnd.bind(state)();

    // Assert
    expect(state.link).toBe(false);
    expect(state.hasAnswers).toBeFalsy();
    expect(input.hide).not.toBeCalled();
    expect(state.setCtaButton).not.toBeCalled();
    expect(input.show).toBeCalled();
    expect(input.focus).toBeCalled();
  });
});
