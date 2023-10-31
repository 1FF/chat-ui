import {
  extractStringWithBrackets,
  formatDateByLocale,
  replaceLinksWithAnchors,
  replaceStringInCurlyBracketsWithStrong,
  removeStringInAngleBrackets,
  getTerm,
} from './helpers';
import { actionService } from './action-service';
import { translations } from './config/translations';
import { experimentsPrompt } from '../../src/lib/config/prompts-affected';

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
    ${getTerm() === experimentsPrompt.finalPage ? closeButton : ''}
  </div>
  <div class="chat-widget__messages" id="scroll-incrementor">
    <div class="chat-widget__messages-container" id="message-incrementor"></div>
  </div>
    <a class="chat-widget__cta hidden" id="cta-button" data-e2e="quiz-trigger-btn">${config.translations.mealButton}</a>
  ${paymentButton(config.translations)}
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
      }" data-e2e="email-input">
      <input id="chat-prompt" minlength="1" autofocus="chat" name="chat-prompt" type="text" placeholder="${
        translations.textareaPlaceholder
      }">
        ${loaderEmail}
      </span>
      <div class="widget__button" id="send-button" data-e2e="email-validate-btn">
        ${sendIcon}
      </div>
    </div>
  </div>
  ${imageFullscreen}
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
    element.dataset.e2e = "stream-assistant-msg";
    element.appendChild(elementContent);
    const { extractedString, updatedMessage } = extractStringWithBrackets(content);

    const clearedMessage = actionService.removeTextBetweenHashtags(updatedMessage);

    const messageWithoutLink = removeStringInAngleBrackets(clearedMessage);

    elementContent.innerHTML = replaceLinksWithAnchors(replaceStringInCurlyBracketsWithStrong(messageWithoutLink));

    return { extractedString, element };
  },
};

export const videoMarkup = (extractedLink) => {
  const element = document.createElement('iframe');
  element.src = `${extractedLink}?enablejsapi=1&rel=0`;
  element.setAttribute('allow', 'fullscreen');
  element.id = 'player';
  element.classList.add('media-video');
  return element;
};

export const imageMarkup = (extractedLink) => {
  const img = document.createElement('img');
  const element = document.createElement('div');

  img.src = `${extractedLink}`;
  img.classList.add('media-image');
  element.classList.add('image-wrapper');
  element.appendChild(img);
  return element;
};

export const timeMarkup = (time) => {
  const element = document.createElement('div');
  element.classList.add('date-formatted');
  element.dataset.e2e = "stream-assistant-msg-date";
  element.textContent = formatDateByLocale(time);
  return element;
};

export const loadingDots = `<div class="js-wave hidden" data-e2e="stream-response-loader">
  <span class="dot"></span>
  <span class="dot"></span>
  <span class="dot"></span>
</div>`;

export const paymentButton = (translations) => `<button id="chat-pay" class="js-payment-button payment-button hidden" data-e2e="payment-form-trigger-btn">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path opacity=".3" d="M4 12h16v6H4v-6zm0-6h16v2H4V6z" fill="currentColor"/>
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/>
  </svg>
  <span class="payment-button__text">${translations.payButton}</span>
</button>`;

export const imageFullscreen = `<div class="fullscreen-background-filter"><div class="fullscreen-image-wrapper"><img class="media-image" src="https://www.worldatlas.com/upload/cf/93/4b/shutterstock-1385689649.jpg"><span class="close-mark">×</span></div></div>`

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

export function getFemaleSvg() {
  return (
    '<svg class="gender-svg female" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">' +
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M14 0C6.268 0 0 6.268 0 14c0 6.409 4.306 11.811 10.183 13.473.018-.03.037-.059.056-.087-.128-.033-3.889-2.49-4.371-3.105a4.534 4.534 0 0 0-.103-.12c-.085-.095-.14-.156-.283-.397-.096-.097-.193-.194-.257-.29-.016-.033-.04-.058-.064-.082a.316.316 0 0 1-.064-.08c-.189-.253.263-1.738.637-2.968.2-.66.378-1.245.423-1.527.032-.42.097-.841.193-1.229.134-.522.346-1.07.528-1.54.168-.432.31-.797.34-1.014 0-.518.064-1.132.129-1.456.064-.226.257-.679.61-1.099.012-.025.15-.17.332-.364.297-.315.71-.754.89-.994.482-.614.739-1.358.9-2.134.096-.453.16-1.035.032-1.52-.248-.294-.48-.604-.706-.908-.098-.13-.194-.26-.29-.385-.049-.081-.105-.162-.161-.243-.057-.08-.113-.162-.161-.242a4.396 4.396 0 0 1-.418-.776c.004.315.06.648.114.97l.047.29c.06.271.13.54.2.807.19.725.378 1.445.378 2.2-.032 2.685-2.667 3.202-2.667 3.202 1.176-1.206.813-2.795.467-4.313-.137-.598-.27-1.185-.307-1.734-.064-.905.097-1.94.418-2.813.257-.647.675-1.455 1.318-1.81l.096-.098c.29-.258.74-.388 1.061-.129.064.032.097.097.129.162.134 0 .292-.093.466-.195.116-.069.24-.141.37-.193.222-.075.445-.117.662-.159.158-.03.313-.06.462-.1.45-.032.9 0 1.318.097.08.016.153.032.225.049.073.016.145.032.225.048.193.032.354.065.515.13.128.032.675.226 1.157.71.096.065.16.195.225.356 0-.032.128.291.128.42v.065c0 .015.002.031.004.049.006.061.014.142-.036.242 0 0 .064.065.097.13.032.064.064.13.096.161 0 0 0 .033.032.033.064.13.129.258.193.42.064 0 .16.194.16.227.014.039.032.078.051.12.029.06.06.126.078.203 0 .016.008.024.016.032s.016.016.016.033v.032c.097.162.065.453 0 .679 0 .065 0 .097.033.162.135.19.34.359.516.504l.094.078c.012.012.025.02.035.026.017.01.03.018.03.038l.032.033.032.032c.064.032.096.13.096.194a.295.295 0 0 1-.128.259c-.032.064-.097.097-.161.129-.016.016-.04.032-.064.049-.024.016-.049.032-.065.048l-.064.065a.708.708 0 0 0-.096.161v.065l.096.194c.012.025.025.04.035.053.017.021.03.036.03.076 0 .065-.033.13-.097.194 0 .017-.008.025-.016.033s-.016.016-.016.032l-.065.065c.065.032.097.097.097.13.032.064 0 .16-.032.225-.032 0-.064.033-.097.065l-.064.065c-.07.1-.048.236-.025.375.029.177.059.357-.103.466-.054.08-.175.139-.289.194l-.065.032c-.096.032-.193.032-.29.032H15.158c-.032 0-.064 0-.096-.032a.954.954 0 0 0-.162-.035c-.048-.007-.1-.015-.16-.03a.236.236 0 0 1-.08-.016c-.024-.008-.048-.016-.08-.016-.014 0-.027-.006-.043-.012-.022-.01-.048-.02-.086-.02a1.653 1.653 0 0 0-.177-.033c-.056-.008-.112-.016-.176-.032h-.129c-.129 0-.29.032-.418.065-.193.388-.45.97-.578 1.39.068.23.186.345.329.486.058.057.12.118.185.193.128.146.273.25.418.356.144.105.289.21.418.355a.987.987 0 0 1 .16.227c.032.064.065.097.161.129.128.065.25.13.37.194.12.065.24.13.37.194.219.118.43.229.638.337.642.335 1.237.646 1.868 1.086.611.42 1.254 1.26 1.383 2.037.096.711-.193 1.455-.675 1.746v.226c.052.04.095.069.137.096.161.108.296.199.859.842.027-.189.3-.761.577-1.34l.162-.341c.161-.356.707-1.585 1.029-3.072.09-.576-.045-.64-.168-.7a1.146 1.146 0 0 1-.025-.012c-.129-.097-.322-.452-.386-.582-.064-.129-.546-.711-.546-.711s0-.485.193-.647l.321.13s-.193-.744.482-.647l.177.025c.597.084 1.088.154 1.205.33.129.195.258.906.258.906s.224 1.326.064 1.843c-.386 3.686-1.447 8.407-1.704 8.537-.225.097-.771 0-.996-.097-.103-.021-.75-.389-1.209-.65-.255-.144-.451-.256-.463-.256-.01.075-.017.265-.028.548-.021.574-.057 1.526-.164 2.654-.077.928-.379 1.835-.661 2.542C23.641 25.877 28 20.447 28 14c0-7.732-6.268-14-14-14zm-1.478 20.433c.16.195.289.356.385.55.225.388.386 1.65.257 2.846-.064.355-.771 1.325-1.35 1.713-.257.194-.482.42-.707.68-.494-.401-.965-.967-1.447-1.547-.647-.777-1.315-1.58-2.088-2.043.139-.6.5-1.09.892-1.62.242-.327.494-.67.715-1.064.964-1.746 1.125-2.263 1.125-2.263.144.266.36.495.566.715.07.075.14.149.205.223.26.278.52.622.779.967.223.295.445.59.668.843z" fill="currentColor" />' +
    '</svg>'
  );
}

export function getMaleSvg() {
  return (
    '<svg class="gender-svg male" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">' +
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M14 0C6.268 0 0 6.268 0 14c0 4.436 2.063 8.39 5.282 10.955-.268-1.516-.915-2.938-1.385-3.972a17.53 17.53 0 0 1-.415-.954c-.482-1.415-.514-1.865-.45-2.893.096-1.254.322-2.572.9-3.697.419-.803 1.32-2.185 2.51-3.15.225-.193.417-.418.578-.643a.67.67 0 0 1 .065-.096.67.67 0 0 0 .064-.096c.29-.386.965-1.993.997-2.411 0-.129 0-.29-.032-.418-.225-.579-.225-1.318-.16-1.896v-.01c.033-.396.133-1.604.835-2.401.386-.45.9-.772 1.48-.964.611-.258 1.319-.322 1.994-.322.45 0 2.54.257 3.731 1.607.354.386.772.868.804 1.415 0 .128 0 .289-.064.417a.619.619 0 0 1-.225.225c0-.032-.161 1.511-.161 1.608a1.19 1.19 0 0 1-.161.353c-.026.039-.067.083-.11.128a.672.672 0 0 0-.147.194c.112.336.102.55.097.642V8.49c0 .257-.13.45-.451.418-.048 0-.097-.008-.145-.016a.887.887 0 0 0-.145-.016h-.032c0 .064-.032.096-.064.129-.097.128-.129.225-.097.385 0 .065-.032.097-.064.097-.016 0-.032.008-.048.016a.114.114 0 0 1-.048.016c0 .016.008.048.016.08s.016.064.016.08c0 .033 0 .065-.065.097-.032 0-.16.129-.193.16-.032.033-.032.033-.032.065-.01.021-.01.075-.01.142 0 .133 0 .319-.086.404-.065.065-.193.161-.322.258a.717.717 0 0 1-.547.096c-.25-.028-1.007-.417-1.331-.584l-.116-.059c-.037.169-.086.338-.133.5-.033.116-.065.229-.092.336a.927.927 0 0 0-.032.145.927.927 0 0 1-.033.144c0 .097 0 .225-.032.322.097.064.225.16.322.257.292.087.557.254.796.404.025.016.049.03.072.046a5.29 5.29 0 0 1 1.351 1.189c.29.354.611.868.772 1.414.021.01.072.027.148.05.386.118 1.404.43 2.264 1.236 1.32 1.254 1.544 2.475 1.609 3.31.055-1.19.732-2.119 1.412-3.052.109-.15.218-.3.325-.45.032-.065.546-.869.61-.933.612-1.19.74-2.379.612-2.54-.161-.16-.322-.739-.354-.9-.032-.192-.547-1.156-.547-1.156s.161-.675.483-.836l.386.225s-.033-1.06.9-.74c.933.322 1.737.611 1.866.933.128.321.096 1.35.096 1.35s-.643 2.41-.772 4.403a50.434 50.434 0 0 1-.45 4.693c-.193 1.35-1.415 3.986-1.737 4.307a9.355 9.355 0 0 0-.197.205c-.263.279-.338.358-.896.438-.05.01-.136.042-.235.08-.217.082-.501.19-.634.145-1.286-.418-3.248-1.157-4.02-1.607a12.788 12.788 0 0 1-.837-.546 5.845 5.845 0 0 1-.675-.547c-.097.354-.354.707-.579.964a.44.44 0 0 0-.048.065c-.016.024-.032.048-.049.064v.032c.194.354.13.9.033 1.222a2.238 2.238 0 0 1-.354.739c0 .193 0 .418.032.61.064.416 0 .8-.126 1.214.16.005.32.008.48.008 7.732 0 14-6.268 14-14S21.732 0 14 0z" fill="currentColor" />' +
    '</svg>'
  );
}

export const getPopUp = (type) => {
  switch (type) {
    case '1111':
      const modalWrapper = document.createElement('div');
      const popUp = document.createElement('div');
      const counter = document.createElement('div');
      const header = document.createElement('div');
      const subHeader = document.createElement('div');

      modalWrapper.classList.add('modal-wrapper');
      popUp.classList.add('pop-up');
      counter.classList.add('image1');
      header.classList.add('header');
      subHeader.classList.add('sub-header');

      header.textContent = 'Connection with our best Nutrition Agent';
      subHeader.textContent = 'A few seconds until the chat starts';

      popUp.appendChild(counter);
      popUp.appendChild(header);
      popUp.appendChild(subHeader);
      modalWrapper.appendChild(popUp);

      return modalWrapper;
    case '1112':
      const modalWrapperTwo = document.createElement('div');
      const popUpTwo = document.createElement('div');
      const counterTwo = document.createElement('div');
      const headerTwo = document.createElement('div');
      const subHeaderTwo = document.createElement('div');

      modalWrapperTwo.classList.add('modal-wrapper');
      popUpTwo.classList.add('pop-up');
      counterTwo.classList.add('image2');
      headerTwo.classList.add('header');
      subHeaderTwo.classList.add('sub-header');

      headerTwo.textContent = 'Connection with our best Nutrition Agent';
      subHeaderTwo.textContent = 'A few seconds until the chat starts';

      popUpTwo.appendChild(counterTwo);
      popUpTwo.appendChild(headerTwo);
      popUpTwo.appendChild(subHeaderTwo);
      modalWrapperTwo.appendChild(popUpTwo);

      return modalWrapperTwo;
  }
};

function getSubscriptionMessage(frequencyInMonths) {
  const doc = new DOMParser().parseFromString(backEndVars.tm566, 'text/xml');
  const currentDurationContainer = doc.querySelector('.js-duration');
  currentDurationContainer.textContent = frequencyInMonths;
  return doc.children[0].innerHTML;
}
