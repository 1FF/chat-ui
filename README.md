## **1ff-chat-ui**

1ff-chat-ui is a Node.js package that provides a chatbot widget for integrating a chatbot into Node.js projects. It uses Socket.IO for real-time communication with the server.

## **Installation**

To install 1ff-chat-ui, use the following command:

`npm install 1ff-chat-ui`

## **Usage**

To use ChatUi in your Node.js project, follow these steps:

*   Import the required modules:

```javascript
import ChatUi from "chat-ui";
```

*   Initialize it (Make sure to replace **SOCKET\_IO\_URL** with the URL of your socket server.):

```javascript
document.addEventListener('DOMContentLoaded', () => {
  ChatUi.init(config);
})
```

*   Define the necessary configuration **(optional):**

```javascript
const assistantConfig = {
  image: 'https://randomuser.me/api/portraits/women/90.jpg',
  role: 'Lead Nutrition Expert, PhD',
  name: 'Jenny Wilson',
  welcome: 'Have a quick chat with our personal nutritionist and get a free consultation about the perfect diet for you',
  ctaTextContent: 'Visit',
  initialMessage: { 
  	role: roles.assistant, 
  	content: 'Hi, Im Jenny Wilson, your personal nutritionist. Im here to help you with your nutritional needs.', 
  	time: '2023-05-12T12:34:56.000Z'
  }
};
```

```javascript
const customTheme = {
  '--lumina': '#f0f2f5',
  '--whisper': '#ffffff',
  '--seraph': '#21bb5a',
  '--ember': '#cacadb',
  '--zephyr': '43, 49, 57',
  '--enigma': '#FFAE19',
  '--font-family': 'Roboto',
};
```

```javascript
const containerId = "chatbot-container"; 
```

*   In the end, run this command, which is one of the commands found in package.json file:  
     `npm run build`

## **Configuration**

ChatUi supports the following configuration options:

*   **SOCKET\_IO\_URL** (String, default: '[http://localhost:5000](http://localhost:5000/)'): The URL of the socket server.
*   **assistant** (Object, default: **/lib/config/theme.js**): Custom configuration for the assistant.
*   **theme** (Object, default: **/lib/config/theme.js**): Custom theme configuration for the chatbot.
*   **socketConfig** (Object, default: **/lib/config/socket.js**): Default socket.io-client config.
*   **containerId** (String, default: 'chatbot-container'): ID of the HTML container element for the chatbot.

## **Methods**

ChatUi provides the following methods:

*   **init(config)**: Initializes the chatbot with the specified configurations and elements.
*   **closeWidget()**: Closes the chat widget.
*   **getTerm()**: Retrieves the value of the 'utm\_chat' parameter from the current URL.
*   **setSocket()**: Initializes the socket connection with the server.
*   **socketEmitChat()**: Emits a chat event to the socket server with the last question data.
*   **sendMessage()**: Sends a user message.
*   **onError()**: Handles the error event.
*   **onKeyDown(event)**: Handles the keydown event.
*   **toggleActiveTextarea()**: Toggles the pointer events for the message textarea and send button elements.

## **Example**

NOTE: everything outside of `lib` is a boilerplate example of how 1ff-chat-ui could be used in your project with an example, `index.js file and index.html` file where the index.js file is placed into a script tag;

![](https://33333.cdn.cke-cs.com/kSW7V9NHUXugvhoQeFaf/images/5a4e8db41e500fad13153ba6a24967509663ff5badc56422.png)

Remember to replace **SOCKET\_IO\_URL** with the actual URL of your socket server.