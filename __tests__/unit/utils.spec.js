
import { initializeAddClassMethod } from '../../src/lib/helpers';
import {
  errorMessage,
  loadingDots,
  resendButton,
  scroll,
  input
} from '../../src/lib/utils';

describe('errorMessage', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="js-error"></div>
    `;
    initializeAddClassMethod()
  });

  test('show should remove the hidden class', () => {
    errorMessage.show();
    const errorElement = document.querySelector('.js-error');
    expect(errorElement.classList.contains('hidden')).toBe(false);
  });

  test('hide should add the hidden class', () => {
    const errorElement = document.querySelector('.js-error');
    errorElement.classList.remove('hidden');
    errorMessage.hide();
    expect(errorElement.classList.contains('hidden')).toBe(true);
  });
});

describe('loadingDots', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="js-wave"></div>
    `;
    initializeAddClassMethod()
  });

  test('show should remove the hidden class', () => {
    loadingDots.show();
    const waveElement = document.querySelector('.js-wave');
    expect(waveElement.classList.contains('hidden')).toBe(false);
  });

  test('hide should add the hidden class', () => {
    const waveElement = document.querySelector('.js-wave');
    waveElement.classList.remove('hidden');
    loadingDots.hide();
    expect(waveElement.classList.contains('hidden')).toBe(true);
  });
});

describe('resendButton', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="user">
        <div class="resend-icon"></div>
      </div>
    `;
    initializeAddClassMethod()
  });

  test('show should add click event listener to last user message element', () => {
    const mockSocketEmitChat = jest.fn();
    const mockLastQuestionData = {};
    const mockState = {
      getLastUserMessageElement: () => document.querySelector('.user'),
      socketEmitChat: mockSocketEmitChat,
      lastQuestionData: mockLastQuestionData
    };

    resendButton.show(mockState);

    const lastUserMessageElement = document.querySelector('.user');
    lastUserMessageElement.click();
    expect(mockSocketEmitChat).toBeCalled();
  });

  test('hideAll should add hidden class to all resend icons and reset cursor', () => {
    document.body.innerHTML += `
      <div class="user">
        <div class="resend-icon"></div>
      </div>
      <div class="user">
        <div class="resend-icon"></div>
      </div>
    `;

    resendButton.hideAll();

    const userElements = document.querySelectorAll('.user');
    const resendIconElements = document.querySelectorAll('.resend-icon');

    userElements.forEach((element) => {
      expect(element.style.cursor).toBe('default');
    });

    resendIconElements.forEach((element) => {
      expect(element.classList.contains('hidden')).toBe(true);
    });
  });
});

describe('scroll', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    initializeAddClassMethod()
  });

  test('add should remove scroll-stop class from body', () => {
    document.body.classList.add('scroll-stop');
    scroll.add();
    expect(document.body.classList.contains('scroll-stop')).toBe(false);
  });

  test('remove should add scroll-stop class to body', () => {
    scroll.remove();
    expect(document.body.classList.contains('scroll-stop')).toBe(true);
  });
});

describe('input', () => {
  let mockState;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="prompt-container"></div>
    `;
    initializeAddClassMethod()
    mockState = {
      elements: {
        promptContainer: document.querySelector('.prompt-container')
      }
    };
  });

  test('hide should add hidden class to prompt container', () => {
    input.hide(mockState);
    const promptContainer = document.querySelector('.prompt-container');
    expect(promptContainer.classList.contains('hidden')).toBe(true);
  });

  test('show should remove hidden class from prompt container', () => {
    const promptContainer = document.querySelector('.prompt-container');
    promptContainer.classList.add('hidden');
    input.show(mockState);
    expect(promptContainer.classList.contains('hidden')).toBe(false);
  });
});