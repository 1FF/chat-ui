import { translations } from './config/translations';

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
    <div class="chat-widget__close" id="close-widget">
      <svg height="24px" viewBox="0 0 24 24" width="24px">
        <g stroke="currentColor" stroke-linecap="round" stroke-width="2">
          <line x1="6" x2="18" y1="6" y2="18"></line>
          <line x1="6" x2="18" y1="18" y2="6"></line>
        </g>
      </svg>
    </div>
  </div>
  <div class="chat-widget__messages" id="scroll-incrementor">
  <div class="chat-widget__initiator-profile">
  <span class="assistant-welcome">${config.assistant.welcome}</span>
  <span class="img">
  <img src="${config.assistant.image}" alt="image">
  </span>
  <span class="w-start-profile">
  <div class="w-name">${config.assistant.name}</div>
  <div class="w-role">${config.assistant.role}</div>
  </span>
  </div>
  <div class="chat-widget__messages-container" id="message-incrementor"></div>
  </div>
  <a class="chat-widget__cta hidden" id="cta-button">${config.assistant.ctaTextContent}</a>
  <div class="chat-widget__prompt" id="prompt-container">
    <span class="widget__input">
      <textarea id="chat-prompt" name="chat-prompt"></textarea>
    </span>
    <div class="widget__button" id="send-button">
      <svg fill="currentColor" height="20px" viewBox="0 0 24 24" width="20px">
        <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 C22.8132856,11.0605983 22.3423792,10.4322088 21.714504,10.118014 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.8376543,3.0486314 1.15159189,3.99121575 L3.03521743,10.4322088 C3.03521743,10.5893061 3.34915502,10.7464035 3.50612381,10.7464035 L16.6915026,11.5318905 C16.6915026,11.5318905 17.1624089,11.5318905 17.1624089,12.0031827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z"></path>
      </svg>
    </div>
  </div>
</div>`;

export const rolesHTML = {
  user: content => `<span class="user js-user">${content}<span class="resend-icon hidden"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="none" d="M0 0h24v24H0V0z"/>
                            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                          </svg></span></span>`,
  assistant: content => `<span class="assistant">${content}</span>`,
};

export const loadingDots = `<div class="js-wave">
  <span class="dot"></span>
  <span class="dot"></span>
  <span class="dot"></span>
</div>`;

export const styles = height => `html {
  box-sizing: border-box;
  font-size: 16px;
}

*,
:after,
:before {
  box-sizing: inherit;
}

button:focus,
input:focus {
  outline: 0;
}

a {
  color: inherit;
  text-decoration: none;
}

input {
  -webkit-appearance: none;
}

button,
input,
textarea {
  margin: 0;
  border: 0;
  padding: 0;
  display: inline-block;
  vertical-align: middle;
  white-space: normal;
  background: 0 0;
  color: rgb(var(--zephyr));
}

:focus-visible {
  outline: 0;
}

input:focus {
  outline: 0;
}

input,
textarea {
  -webkit-box-sizing: content-box;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
}

textarea {
  resize: none;
  width: 100%;
  height: 100%;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  position: relative;
  font-family: inherit;
}

img {
  max-width: 100%;
  height: auto;
}

.chat-widget {
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  height: ${height}px;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  color: rgb(var(--zephyr));
  background-color: var(--whisper);
  margin: auto;
  max-width: 800px;
  font-family: inherit;
}

.chat-widget__head {
  height: fit-content;
  padding: 11px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: -1px 2px 5px 0 rgba(var(--zephyr), .1);
}

.chat-widget__info .img {
  border-radius: 100%;
  display: block;
  overflow: hidden;
  width: 50px;
  height: 50px;
  margin-right: 10px;
  position: relative;
}

.chat-widget__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.chat-widget__info:before {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: var(--seraph);
  bottom: 0;
  left: 37px;
  z-index: 1;
  border-radius: 100%;
}

.chat-widget__info img {
  width: 100%;
  height: 100%;
}

.w-name {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
}

.w-role {
  color: rgba(var(--zephyr), .6);
  text-align: center;
}

.chat-widget__role {
  display: flex;
  flex-direction: column;
}

.widget-name {
  font-size: 20px;
  font-weight: 700;
}

.widget-role {
  font-size: 16px;
  color: rgba(var(--zephyr), .8);
}

.chat-widget__close {
  cursor: pointer;
  color: var(--seraph);
}

.widget__input {
  border-radius: 20px;
  background-color: var(--lumina);
  width: 100%;
  max-height: 46px;
  overflow: hidden;
  padding: 11px 15px;
  margin-right: 11px;
}

.widget__button {
  color: var(--seraph);
  cursor: pointer;
}

.chat-widget__prompt {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 20px;
  height: fit-content;
}

.chat-widget__messages {
  width: 100%;
  height: 100%;
  padding: 40px 20px 20px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  overflow-y: scroll;
}

.chat-widget__initiator-profile {
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  padding-bottom: 40px;
}

.chat-widget__initiator-profile .img {
  width: 60px;
  height: 60px;
  overflow: hidden;
  position: relative;
  display: inline-block;
  margin: auto;
  border-radius: 100%;
}

.chat-widget__initiator-profile img {
  width: 100%;
  height: auto;
}

.resend-icon {
  position: absolute;
  top: 60%;
  width: 24px;
  height: 24px;
  border-radius: 100%;
  background: var(--seraph);
  pointer-events: all;
}

.resend-icon svg {
  position: absolute;
  width: 20px;
  height: 20px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  fill: white;
}

.chat-widget__messages .user,
.chat-widget__messages .assistant {
  position: relative;
  display: block;
  background-color: var(--lumina);
  width: fit-content;
  margin-left: 0;
  margin-right: auto;
  padding: 11px 15px;
  border-radius: 20px;
  max-width: 375px;
  margin-bottom: 20px;
  white-space: pre-wrap;
  text-align: left;
  font-family: inherit;
}

.chat-widget__messages .date-formatted {
  text-align: center;
  color: rgba(var(--zephyr), .4);
  font-size: 14px;
  margin-bottom: 5px;
}

.chat-widget__messages .assistant {
  background-color: var(--seraph);
  color: #fff;
  margin-left: auto;
  margin-right: 0;
}

.chat-container {
  font-family: inherit;
  background: var(--lumina);
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.assistant-welcome {
  text-align: center;
  margin-inline: 30px;
  margin-bottom: 30px;
  max-width: 400px;
}

.chat-widget__cta {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 11px 20px;
  max-width: 375px;
  color: rgba(var(--zephyr));
  cursor: pointer;
  position: relative;
  letter-spacing: 2px;
  padding: 11px 20px;
  border-radius: 20px;
  margin-inline: auto;
  max-width: 320px;
  width: 100%;
  font-weight: bolder;
  font-size: 20px;
  background: var(--enigma);
  box-shadow: 0px 12px 24px -4px rgba(255, 174, 25, 0.2);
}

div.js-wave {
  position: relative;
  text-align: center;
  width: 100px;
  height: 100px;
  margin-left: auto;
  margin-right: 0;
}

div.js-wave .dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 3px;
  background: var(--seraph);
  animation: wave 1.3s linear infinite;
}

div.js-wave .dot:nth-child(2) {
  animation-delay: -1.1s;
}

div.js-wave .dot:nth-child(3) {
  animation-delay: -0.9s;
}

@keyframes wave {
  0%,
  60%,
  100% {
    transform: initial;
  }

  30% {
    transform: translateY(-15px);
  }
}

.underline {
  text-decoration: underline;
}

.hidden {
  display: none;
}`;
