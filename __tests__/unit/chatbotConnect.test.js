import ChatbotConnect from "../../src/lib/chatbot-connect";
jest.mock("socket.io-client");

describe('ChatbotConnect', () => {
  const userID = 'userID';
  const testMessage = {
    content: 'hello',
    time: '2023-05-12T10:30:45.123Z',
    role: 'assistant'
  }
  beforeEach(() => {
    document.body.innerHTML = '<div id="chatbot-container"></div>';
    jest.useFakeTimers(); // Enable fake timers
    localStorage.setItem('__cid', userID);
    Object.defineProperty(window, 'location', {
      value: {
        search: '?utm_chat=test'
      },
      writable: true
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    jest.useRealTimers();
    jest.clearAllTimers();
    delete window.location;
  });

  test('initializes the chatbot with default theme and container ID', () => {
    // Act
    ChatbotConnect.init();

    // Assert
    expect(ChatbotConnect.mainContainer).toBeDefined();
    expect(ChatbotConnect.theme).toEqual(expect.objectContaining({
      "--ember": "#cacadb",
      "--enigma": "#FFAE19",
      "--font-family": "Roboto",
      "--lumina": "#f0f2f5",
      "--seraph": "#21bb5a",
      "--whisper": "#ffffff",
      "--zephyr": "43, 49, 57",
    }));
    expect(ChatbotConnect.mainContainer).not.toBeEmptyDOMElement();
    expect(ChatbotConnect.socket).toBeDefined();
  });

  test('initializes the chatbot with custom theme and container ID', () => {
    // Arrange
    const customTheme = {
      '--lumina': '#252239',
      '--whisper': '#151226',
      '--seraph': '#f53373',
      '--ember': '#cacadb',
      '--zephyr': '255, 255, 255'
    };
    const customContainerId = 'custom-container';
    document.body.innerHTML = `<div id="${customContainerId}"></div>`;
    const url = "http://localhost:3000";

    // Act
    ChatbotConnect.init(url, {}, customTheme, customContainerId);

    // Assert
    expect(ChatbotConnect.mainContainer.id).toBe(customContainerId);
    expect(ChatbotConnect.theme).toEqual(expect.objectContaining(customTheme));
  });

  test('sends an user message', () => {
    // Act
    ChatbotConnect.init();

    // Arrange
    const messageInput = document.getElementById('chat-prompt');
    const sendButton = document.getElementById('send-button');
    // Simulate user input and button click
    messageInput.value = 'Hello, chatbot!';
    sendButton.click();

    // Assertions
    expect(ChatbotConnect.socket.emit).toHaveBeenCalledWith(ChatbotConnect.events.chatHistory, expect.any(Object));
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
    expect(ChatbotConnect.socket.emit).not.toBeCalledWith('chat');
    expect(ChatbotConnect.socket.emit).toBeCalledWith('chat-history', { user_id: userID });
    expect(ChatbotConnect.elements.messageIncrementor.innerHTML).toBe('');
  });

  test('does close the socket', () => {
    // Act
    ChatbotConnect.closeSocket();

    // Assert
    expect(ChatbotConnect.socket.close).toHaveBeenCalled();
  });

  test('should return the value of "utm_chat" parameter from the URL', () => {
    // Act
    const term = ChatbotConnect.getTerm();

    // Assert
    expect(term).toEqual('test');
    delete window.location;
  });

  test('should setMessageObject correctly', () => {
    // Assert
    expect(ChatbotConnect.lastQuestionData).toEqual({ "message": "Hello, chatbot!", "term": "test", "user_id": "userID" });
  });

  test('should call onError when onChat we have errors', () => {
    // Arrange
    jest.spyOn(ChatbotConnect, 'onError');

    // Act
    ChatbotConnect.onChat({ message: 'hello', errors: ['server error'] });

    // Assert
    expect(ChatbotConnect.onError).toBeCalled();
  });

  test('should call onError when onChat we have no errors', () => {
    // Arrange
    jest.spyOn(ChatbotConnect, 'toggleActiveTextarea');
    jest.spyOn(ChatbotConnect, 'appendHtml');

    // Act
    ChatbotConnect.onChat({ messages: [testMessage], errors: [] });
    // advance the timer by this hardcoded value because it is the largest possible amount
    jest.advanceTimersByTime(60000);

    // Assert
    expect(ChatbotConnect.elements.messageIncrementor.innerHTML).toEqual("<div class=\"date-formatted\">MAY 12, 2023, 1:30 PM</div><span class=\"assistant\">hello</span>")
  });

  test('should setLink', () => {
    // Arrange
    const link = 'https://example.com';

    // Act
    ChatbotConnect.setLink(link);

    // Assert
    expect(ChatbotConnect.elements.ctaButton.getAttribute('href')).toBe(link);
    expect(ChatbotConnect.elements.ctaButton.classList.contains('hidden')).toBe(false);
    expect(ChatbotConnect.elements.promptContainer.classList.contains('hidden')).toBe(true);
  });
});
