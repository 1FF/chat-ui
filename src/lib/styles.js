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

html, body {
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
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
  font-weight: var(--font-weight-normal);
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

input {
  resize: none;
  width: 93%;
  height: auto;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  position: relative;
  font-family: inherit;
  overflow: auto;
  padding: 11px 15px;
}

img {
  max-width: 100%;
  height: auto;
}

.chat-container {
  background: var(--lumina);
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99999;
  overflow: hidden;
  font-family: inherit;
  pointer-events: all;
}

.scroll-stop {
  overflow: hidden;
  position:fixed;
  left:0;
  right:0;
  bottom:0;
}

.chat-widget {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  color: rgb(var(--zephyr));
  background-color: var(--whisper);
  margin: 0 auto;
  padding-bottom: 11px;
  max-width: 800px;
  height: ${height}px;
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
  height: auto;
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
  padding: 11px 20px 0px;
  height: fit-content;
}

.answers-container {
  margin-top: 30px;
  color: var(--glaze-text);
}

#scroll-incrementor * {
  transform: translateZ(0);
}

.answers-container div{
  cursor: pointer;
  text-align: center;
  border-radius: 20px;
  padding: 11px 15px;
  margin-top: 10px;
  background-color: var(--glaze-bg);
  border: 1px solid var(--glaze);
}

.chat-widget__messages {
  width: 100%;
  height: 100%;
  padding: 40px 20px 20px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  overflow-y: scroll;
  display: flex;
  flex-direction: column-reverse;
}

.chat-widget__messages-container {
  margin-top: 0;
  margin-bottom: auto;
  font-weight: var(--font-weight-normal);
}

.chat-widget__messages-container strong {
  font-weight: var(--font-weight-bold);
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
  bottom: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  border-radius: 100%;
  background: white;
  pointer-events: all;
}

.resend-icon svg {
  position: absolute;
  width: 20px;
  height: 20px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) !important;
  fill: var(--seraph);
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

.chat-widget__messages .user {
  background-color: var(--seraph);
  color: #fff;
  margin-left: auto;
  margin-right: 0;
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
  height: auto;
  margin-right: auto;
  margin-left: 25px;
}

div.js-wave .dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 3px;
  background: rgba(var(--zephyr), .4);
  animation: wave 1.3s linear infinite;
}

div.js-wave .dot:nth-child(2) {
  animation-delay: -1.1s;
}

div.js-wave .dot:nth-child(3) {
  animation-delay: -0.9s;
}

.error-message {
  color: #ff0043;
  margin-left: 35px;
  font-weight: 500;
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

.assistant.cursor {
  width:100%;
}

.cursor::after {
  content:'';
  display:inline-block;
  margin-left:3px;
  background-color: rgb(var(--zephyr));
  animation-name:blink;
  animation-duration:0.5s;
  animation-iteration-count: infinite;
  height:18px;
  width:6px;
}

@keyframes blink {
  0% {
    opacity:1;
  }
  49% {
    opacity:1;
  }
  50% {
    opacity:0;
  }
  100% {
    opacity:0;
  }
}

.hidden {
  display: none;
}`;
