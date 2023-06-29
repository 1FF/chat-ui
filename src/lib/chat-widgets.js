import { extractStringWithBrackets, formatDateByLocale } from './helpers';
import { translations } from './config/translations';
import ChatUi from './chat-ui';
import { roles } from './config/roles';
import { events } from './config/events';

export const chatMarkup = config => `<div class="chat-widget">
  <div class="chat-widget__head">
    <div class="chat-widget__info">
      <span class="img">
        <img src="${config.assistant.image}" alt="image">
      </span>
      <span class="chat-widget__role">
        <span class="widget-name">${config.assistant.name}</span>
        <span class="widget-role">${config.assistant.role}</span>
      </span>
    </div>
  </div>
  <div class="chat-widget__messages" id="scroll-incrementor">
    <div class="chat-widget__messages-container" id="message-incrementor"></div>
  </div>
  <a class="chat-widget__cta hidden" id="cta-button">${config.assistant.ctaTextContent}</a>
  <div>
    <div class="js-error error-message hidden">${config.translations.error}</div>
    ${loadingDots}
    <div class="chat-widget__prompt" id="prompt-container">
      <span class="widget__input">
        <input id="chat-prompt" minlength="1" name="chat" autofocus="chat" name="chat-prompt" type="text" placeholder="${translations.textareaPlaceholder}">
        </span>
      <div class="widget__button" id="send-button">
        <svg fill="currentColor" height="20px" viewBox="0 0 24 24" width="20px">
          <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 C22.8132856,11.0605983 22.3423792,10.4322088 21.714504,10.118014 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.8376543,3.0486314 1.15159189,3.99121575 L3.03521743,10.4322088 C3.03521743,10.5893061 3.34915502,10.7464035 3.50612381,10.7464035 L16.6915026,11.5318905 C16.6915026,11.5318905 17.1624089,11.5318905 17.1624089,12.0031827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z"></path>
        </svg>
      </div>
    </div>
  </div>
</div>`;

export const initiatorProfile = (config) => {
  const initiatorContainer = document.createElement('div');
  initiatorContainer.className = "chat-widget__initiator-profile";
  initiatorContainer.innerHTML = `<span class="assistant-welcome">${config.assistant.welcome}</span>
  <span class="img">
  <img src="${config.assistant.image}" alt="image">
  </span>
  <span class="w-start-profile">
  <div class="w-name">${config.assistant.name}</div>
  <div class="w-role">${config.assistant.role}</div>
  </span>`;
  return initiatorContainer;
};

const closeButton = `<div class="chat-widget__close" id="close-widget">
  <svg height="24px" viewBox="0 0 24 24" width="24px">
    <g stroke="currentColor" stroke-linecap="round" stroke-width="2">
      <line x1="6" x2="18" y1="6" y2="18"></line>
      <line x1="6" x2="18" y1="18" y2="6"></line>
    </g>
  </svg>
</div>`;

export const rolesHTML = {
  user: content => {
    const element = document.createElement('span');
    element.classList.add('user');
    element.classList.add('js-user');
    element.innerHTML = content;
    element.innerHTML += `<span class="resend-icon hidden"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path fill="none" d="M0 0h24v24H0V0z"/>
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
  </svg></span>`;
    return element;
  },
  assistant: (content) => {
    const element = document.createElement('span');
    const elementContent = document.createElement('span');
    elementContent.className = 'js-assistant-message';
    element.classList.add('assistant');
    element.appendChild(elementContent);
    const { updatedMessage } = extractStringWithBrackets(content);
    elementContent.innerHTML = updatedMessage;
    return element;
  },
};

export const timeMarkup = time => {
  const element = document.createElement('div');
  element.classList.add('date-formatted');
  element.textContent = formatDateByLocale(time);
  return element;
};

export const loadingDots = `<div class="js-wave hidden">
  <span class="dot"></span>
  <span class="dot"></span>
  <span class="dot"></span>
</div>`;