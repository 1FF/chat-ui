import { loadingDots } from "../../src/lib/chat-widgets";
import ChatbotConnect from "../../src/lib/chatbot-connect";
jest.mock("socket.io-client");


describe('ChatbotConnect', () => {
  beforeEach(() => {
    // Create a DOM container element for the chatbot
    jest.useFakeTimers(); // Enable fake timers
    document.body.innerHTML = '<div id="chatbot-container"></div>';
  });

  afterEach(() => {
    // Clean up the DOM after each test
    document.body.innerHTML = '';
    jest.useRealTimers(); // Restore real timers
    ChatbotConnect.socketData = {
      "term": "vegan", //hardcoded for now it will be taken from url
      "customer_id": "c5f8d601-cf76-4b2c-8a68-31980341a3d8", //hardcoded for now it will be taken from localStorage
      "messages": [] // updated on each user prompt and each assistant response
    }
  });

  test('initializes the chatbot with default theme and container ID', () => {
    // Act
    ChatbotConnect.init();

    // Assert
    expect(ChatbotConnect.mainContainer).toBeDefined();
    expect(ChatbotConnect.theme).toEqual(expect.objectContaining({
      '--lumina': '#f0f2f5',
      '--whisper': '#ffffff',
      // ... other default theme properties
    }));
    expect(ChatbotConnect.mainContainer).not.toBeEmptyDOMElement();
    expect(ChatbotConnect.socket).toBeDefined();
  });

  test('initializes the chatbot with custom theme and container ID', () => {
    // Arrange
    const customTheme = {
      '--lumina': '#252239',
      '--whisper': '#151226',
      // ... custom theme properties
    };
    const customContainerId = 'custom-container';
    document.body.innerHTML = `<div id="${customContainerId}"></div>`;

    // Act
    ChatbotConnect.init(customTheme, customContainerId);

    // Assert
    expect(ChatbotConnect.mainContainer.id).toBe(customContainerId);
    expect(ChatbotConnect.theme).toEqual(expect.objectContaining(customTheme));
  });

  test('sends a user message', () => {
    // Act
    ChatbotConnect.init();

    // Arrange
    const messageInput = document.getElementById('chat-prompt');
    const sendButton = document.getElementById('send-button');
    // Simulate user input and button click
    messageInput.value = 'Hello, chatbot!';
    sendButton.click();

    // Assertions
    expect(ChatbotConnect.socket.emit).toHaveBeenCalledWith(ChatbotConnect.events.chat, expect.any(Object));
    expect(ChatbotConnect.socketData.messages.length).toBe(1);
    expect(ChatbotConnect.elements.messageIncrementor.innerHTML).toContain('Hello, chatbot!');
    expect(messageInput.value).toBe('');
    expect(ChatbotConnect.socket.on).toBeCalledWith(ChatbotConnect.events.chat, expect.any(Function));
  });

  test('does not send an empty user message', () => {
    // Act
    ChatbotConnect.init();

    // Arrange
    const sendButton = document.getElementById('send-button');
    sendButton.click();

    // Assert
    expect(ChatbotConnect.socket.emit).not.toHaveBeenCalled();
    expect(ChatbotConnect.socketData.messages.length).toBe(0);
    expect(ChatbotConnect.elements.messageIncrementor.innerHTML).toBe('');
  });
  test('does close the socket', () => {
    // Act
    ChatbotConnect.closeSocket();

    // Assert
    expect(ChatbotConnect.socket.close).toHaveBeenCalled();
  });

  test('should update UI and add message when no error and last message is from assistant', () => {
    // Arrange
    // Mock the response with no errors and a last message from assistant
    const response = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ];

    // Act
    // Call the onChat method with the mocked response
    ChatbotConnect.onChat(response);

    // Assert that the UI is updated as expected
    expect(ChatbotConnect.elements.ctaButton.classList.contains('hidden')).toBe(true);
    expect(ChatbotConnect.elements.promptContainer.classList.contains('hidden')).toBe(false);
    expect(ChatbotConnect.elements.messageIncrementor.innerHTML).toContain(loadingDots);
  });
});


// Test init method:

// Verify that the theme is correctly set when a custom theme is provided.
// Verify that the main container element is correctly set.
// Verify that the custom variables are correctly set and applied to the main container element.
// Verify that the socket is set up and the event listener is attached.
// Test closeSocket method:

// Verify that the socket connection is closed when the socket is open.
// Verify that no error occurs when the socket is already closed.
// Test setSocket method:

// Verify that the socket connection is set up with the correct options.
// Test onChat method:

// Mock the server response and verify that the appropriate actions are taken based on the response.
// Test getRandomInteger method:

// Verify that a random integer is generated within the specified range.
// Test setCustomVars method:

// Verify that the custom variables are correctly set and applied to the main container element.
// Test setCustomFont method:

// Verify that the custom font is loaded if it is not already loaded.
// Test setDomContent method:

// Verify that the HTML content is correctly appended to the main container element.
// Verify that the necessary elements are correctly set up and event listeners are attached.
// Test setElements method:

// Verify that the elements are correctly set and retrieved.
// Test formatDateByLocale method:

// Verify that the date string is correctly formatted according to the locale.
// Test appendHtml method:

// Verify that the HTML content is correctly appended to the chat message container.
// Verify that the scroll container is scrolled to the bottom.
// Test loadExistingMessages method:

// Mock the localStorage data and verify that the existing messages are correctly loaded and displayed.
// Test addMessage method:

// Verify that a new message is correctly added to the socketData and stored in localStorage.
// Test sendMessage method:

// Mock the input message and verify that the message is correctly sent, added to the socketData, and displayed.
// Test containsURL method:

// Verify that a string containing a URL returns true.
// Verify that a string without a URL returns false.
// Test closeWidget method:

// Verify that the main container is cleared, the socket connection is closed, and the chat is marked as seen in localStorage.
// Test event listeners:

// Test the click event listeners for the close button, send button, and CTA button, and verify that the corresponding methods are called.