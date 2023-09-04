import {
  extractStringWithBrackets,
  formatDateByLocale,
  replaceLinksWithAnchors,
  replaceStringInCurlyBracketsWithStrong,
} from './helpers';
import { translations } from './config/translations';

export const chatMarkup = (config) => `<div class="chat-widget">
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
  ${paymentButton}
  ${loadingDots}
  ${chatPaymentFormContainer(config.translations)}
  <div id="container">
    <div class="js-error error-message hidden">${config.translations.error}</div>
    <div class="js-error-email error-message hidden"></div>
    <div id="error-label" class="error-message hidden"></div>
    <div class="chat-widget__prompt" id="prompt-container">
      <span class="widget__input">
      <input id="chat-email" class="hidden" autofocus="chat" name="email" type="email" placeholder="${
        translations.emailPlaceholder
      }">
      <input id="chat-prompt" minlength="1" autofocus="chat" name="chat-prompt" type="text" placeholder="${
        translations.textareaPlaceholder
      }">
        ${loaderEmail}
      </span>
      <div class="widget__button" id="send-button">
        ${sendIcon}
      </div>
    </div>
  </div>
</div>`;

export const initiatorProfile = (config) => {
  const initiatorContainer = document.createElement('div');
  initiatorContainer.className = 'chat-widget__initiator-profile';
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
  user: (content) => {
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
    const { extractedString, updatedMessage } = extractStringWithBrackets(content);

    elementContent.innerHTML = replaceLinksWithAnchors(replaceStringInCurlyBracketsWithStrong(updatedMessage));
    return { extractedString, element };
  },
};

export const timeMarkup = (time) => {
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

export const paymentButton = `<button id="chat-pay" class="js-payment-button payment-button hidden">
  <svg class="h-6 w-6">
      <use xlink:href="./img/sprite.svg#cart-toned-pay"></use>
    </svg>
  <span class="payment-button__text">${translations.paymentButton}</span>
</button>`;

export const closePaymentFormButton = `<span id="payment-form-close-button" class="close-payment-form hidden">
  <svg
    fill="none"
    viewBox="0 0 18 18">
    <path d="M13.725 4.282a.747.747 0 0 0-1.058 0L9 7.942 5.332 4.276a.748.748 0 1 0-1.057 1.057L7.942 9l-3.667 3.668a.748.748 0 1 0 1.057 1.057L9 10.057l3.667 3.668a.748.748 0 1 0 1.058-1.057L10.057 9l3.668-3.668a.752.752 0 0 0 0-1.05z"
        fill="currentColor" />
  </svg>
</span>`;

const paymentLoader = (translations) => {
  return `<div class="chat-payment-loader js-payment-loader">
  <div class="chat-payment-loader__inner">
    <div class="chat-payment-loader__dots">
      <div class="chat-payment-loader__dots-in">
        <span class="chat-payment-loader__dots_dots"></span>
      </div>
    </div>
    <div class="chat-payment-loader__progress-text">
      <span class="chat-payment-loader__progress_checkmark">
        <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12"></circle>
          <path d="m9.75 15.127-2.602-2.602a.748.748 0 0 0-1.058 1.057l3.135 3.136a.747.747 0 0 0 1.058 0l7.935-7.935a.748.748 0 0 0-1.058-1.058l-7.41 7.402z"
                fill="white"></path>
        </svg>
      </span>
      <p class="js-payment-message chat-payment-loader__title">${translations.tm1224}</p>
    </div>
    <div class="js-msg-spin chat-payment-loader__spinning-texts">
      <div class="chat-payment-loader__spinning-texts_film">
      ${translations.paymentLoaderTexts.map((text) => `<div class="chat-payment-loader__text">${text}</div>`).join('')}
      </div>
    </div>
  </div>
</div>`;
};

export const chatPaymentFormContainer = (translations) => {
  return `<div id="chat-payment-view" class="payment-view hidden">
  ${paymentLoader(translations)}
  <span class="payment-view__main-container primer-form-container light-pink-blue">
    ${closePaymentFormButton}
    <section id="primer-form-container"></section>
    <span class="js-payment-form-loader payment-loader">
      <span class="animate-spin-pay">
        <span class="spin-icon"></span>
      </span>
    </span>
    <span class="payment-form__footer">
      <svg fill="none"
          height="12"
          viewBox="0 0 12 12"
          width="12"
          xmlns="http://www.w3.org/2000/svg">
        <path d="M9 4h-.5V3a2.5 2.5 0 0 0-5 0v1H3c-.55 0-1 .45-1 1v5c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zM6 8.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM7.55 4h-3.1V3c0-.855.695-1.55 1.55-1.55.855 0 1.55.695 1.55 1.55v1z"
              fill="currentColor" />
      </svg>
      <span>SSL Secure Conection</span>
    </span>
  </span>
</div>`;
};

const sendIcon = `<svg fill="currentColor" height="20px" viewBox="0 0 24 24" width="20px">
  <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 C22.8132856,11.0605983 22.3423792,10.4322088 21.714504,10.118014 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.8376543,3.0486314 1.15159189,3.99121575 L3.03521743,10.4322088 C3.03521743,10.5893061 3.34915502,10.7464035 3.50612381,10.7464035 L16.6915026,11.5318905 C16.6915026,11.5318905 17.1624089,11.5318905 17.1624089,12.0031827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z"></path>
</svg>`;

const loaderEmail = `<span class="animate-spin hidden js-email-processing">
  <span class="spin-icon"></span>
</span>`;

export const paymentHeader = () => {
  const config = getDisplayInfo();
  return `<div class="payment-head">
        <span class="payment-head__left-wrap">
          <div class="payment-head__left">
            <span class="payment-head__icon">
              <svg width="26" height="26">
                <use xlink:href="/img/sprite.svg#secured-check"></use>
              </svg>
            </span>
            <span class="payment-head__text">
              ${backEndVars.tm1215}
            </span>
          </div>
          <div class="payment-head__bottom">
            ${backEndVars.tm240}
          </div>
        </span>
        <div class="payment-head__right">
          <div class="payment-head__right-price">${config.price}</div>
          <div class="payment-head__right-info">
            ${config.period}
          </div>
        </div>
      </div>`;
};

export function getDisplayInfo() {
  const paymentData = JSON.parse(localStorage.getItem('__pd'));
  const config = {
    price: paymentData.displayPlanPrice || '$10.99',
    period:
      paymentData.billingOptionType === 'one-time'
        ? backEndVars.tm241
        : getSubscriptionMessage(paymentData.frequencyInMonths),
  };

  return config;
}

function getSubscriptionMessage(frequencyInMonths) {
  const doc = new DOMParser().parseFromString(backEndVars.tm566, 'text/xml');
  const currentDurationContainer = doc.querySelector('.js-duration');
  currentDurationContainer.textContent = frequencyInMonths;
  return doc.children[0].innerHTML;
}
