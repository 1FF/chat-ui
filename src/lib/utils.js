import { socketEmitChat } from "./socket-services";

export const errorMessage = {
  show() {
    document.querySelector('.js-error').classList.remove('hidden');
  },
  hide() {
    document.querySelector('.js-error').addClass('hidden');
  },
};

export const loadingDots = {
  show: () => {
    document.querySelector('.js-wave').classList.remove('hidden');
  },
  hide: () => {
    document.querySelector('.js-wave').addClass('hidden');
  },
};

export const resendButton = {
  show: state => {
    const lastUserMessageElement = state.getLastUserMessageElement();
    if (lastUserMessageElement) {
      lastUserMessageElement.style.cursor = 'pointer';
      lastUserMessageElement
        .querySelector('.resend-icon')
        .classList.remove('hidden');
      lastUserMessageElement.addEventListener(
        'click', () => socketEmitChat(state)
      );
    }
  },
  hideAll: () => {
    document.querySelectorAll('.user').forEach(element => {
      element.style.cursor = 'default';
    });
    document.querySelectorAll('.resend-icon').forEach(element => {
      element.addClass('hidden');
    });
  },
};

export const scroll = {
  add: () => { document.body.classList.remove('scroll-stop') },
  remove: () => { document.body.classList.add('scroll-stop') },
};

export const input = {
  hide: (state) => {
    state.elements.promptContainer.addClass('hidden');
    state.elements.messageInput.disabled = true;
    state.elements.messageInput.addClass('hidden');
  },
  show: (state) => {
    state.elements.promptContainer.classList.remove('hidden');
    state.elements.messageInput.disabled = false;
    state.elements.messageInput.classList.remove('hidden');
  },
  focus: (state) => {
    // it scrolls to top 0 because we have flex-direction: column-reverse;
    // so we can always see the last message;
    state.elements.messageIncrementor.scrollTop = 0;
    const inputField = state.elements.promptContainer.querySelector('input#chat-prompt');
    inputField.focus();
  }
};

export const messages = {
  clear: () => {
    const messages = [
      ...document.querySelectorAll('.assistant'),
      ...document.querySelectorAll('.date-formatted'),
      ...document.querySelectorAll('.user'),
    ];
    messages.forEach(m => m.remove());
  },
};

export const emailLoader = {
  hide: () => {
    document.querySelector('.js-email-processing').addClass('hidden');
  },
  show: () => {
    document.querySelector('.js-email-processing').classList.remove('hidden');
  }
}
