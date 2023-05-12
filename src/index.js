// this is an example js file where the lib will be loaded

const ChatbotConnect = require("./lib/chatbot-connect").default;
// theme could be passed in here, but it's not a must;
const theme = {
  '--lumina': '#252239',
  '--whisper': '#151226',
  '--seraph': '#f53373',
  '--ember': '#cacadb',
  '--zephyr': '255, 255, 255',
  '--enigma': '#0f0e1e',
  '--font-family': 'Plus Jakarta Sans',
};

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

document.addEventListener('DOMContentLoaded', () => {
  !localStorage.getItem('__cid') && localStorage.setItem('__cid', uuidv4());
  ChatbotConnect.init(localStorage.getItem('__cid'), 'vegan');
})
