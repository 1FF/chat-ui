// this is an example js file where the lib will be loaded
const ChatbotConnect = require("./lib/chatbot-connect").default;

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

document.addEventListener('DOMContentLoaded', () => {
  !localStorage.getItem('__cid') && localStorage.setItem('__cid', uuidv4());
  ChatbotConnect.init('http://localhost:5000', { ctaTextContent: 'goodbuy' });
})
