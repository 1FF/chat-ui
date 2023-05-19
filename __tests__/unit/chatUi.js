import ChatUi from "../../src/lib/chat-ui";
jest.mock("socket.io-client");

describe('ChatUi', () => {
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
    ChatUi.init();

    // Assert
    expect(ChatUi.mainContainer).toBeDefined();
    expect(ChatUi.theme).toEqual(expect.objectContaining({
      "--ember": "#cacadb",
      "--enigma": "#FFAE19",
      "--font-family": "Roboto",
      "--lumina": "#f0f2f5",
      "--seraph": "#21bb5a",
      "--whisper": "#ffffff",
      "--zephyr": "43, 49, 57",
    }));
    expect(ChatUi.mainContainer).not.toBeEmptyDOMElement();
    expect(ChatUi.socket).toBeDefined();
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
    ChatUi.init(url, {}, customTheme, customContainerId);

    // Assert
    expect(ChatUi.mainContainer.id).toBe(customContainerId);
    expect(ChatUi.theme).toEqual(expect.objectContaining(customTheme));
  });

  test('sends an user message', () => {
    // Act
    ChatUi.init();

    // Arrange
    const messageInput = document.getElementById('chat-prompt');
    const sendButton = document.getElementById('send-button');
    // Simulate user input and button click
    messageInput.value = 'Hello, chatbot!';
    sendButton.click();

    // Assertions
    expect(ChatUi.socket.emit).toHaveBeenCalledWith(ChatUi.events.chatHistory, expect.any(Object));
    expect(ChatUi.elements.messageIncrementor.innerHTML).toContain('Hello, chatbot!');
    expect(messageInput.value).toBe('');
    expect(ChatUi.socket.on).toBeCalledWith(ChatUi.events.chat, expect.any(Function));
  });

  test('does not send an empty user message', () => {
    // Act
    ChatUi.init();

    // Arrange
    const sendButton = document.getElementById('send-button');
    sendButton.click();

    // Assert
    expect(ChatUi.socket.emit).not.toBeCalledWith('chat');
    expect(ChatUi.socket.emit).toBeCalledWith('chat-history', { user_id: userID });
    expect(ChatUi.elements.messageIncrementor.innerHTML).toBe('');
  });

  test('does close the socket', () => {
    // Act
    ChatUi.closeSocket();

    // Assert
    expect(ChatUi.socket.close).toHaveBeenCalled();
  });

  test('should return the value of "utm_chat" parameter from the URL', () => {
    // Act
    const term = ChatUi.getTerm();

    // Assert
    expect(term).toEqual('test');
    delete window.location;
  });

  test('should setMessageObject correctly', () => {
    // Assert
    expect(ChatUi.lastQuestionData).toEqual({ "message": "Hello, chatbot!", "term": "test", "user_id": "userID" });
  });

  test('should call onError when onChat we have errors', () => {
    // Arrange
    jest.spyOn(ChatUi, 'onError');

    // Act
    ChatUi.onChat({ message: 'hello', errors: ['server error'] });

    // Assert
    expect(ChatUi.onError).toBeCalled();
  });

  test('should call onError when onChat we have no errors', () => {
    // Arrange
    jest.spyOn(ChatUi, 'toggleActiveTextarea');
    jest.spyOn(ChatUi, 'appendHtml');

    // Act
    ChatUi.onChat({ messages: [testMessage], errors: [] });
    // advance the timer by this hardcoded value because it is the largest possible amount
    jest.advanceTimersByTime(60000);

    // Assert
    expect(ChatUi.elements.messageIncrementor.innerHTML).toEqual("<div class=\"date-formatted\">MAY 12, 2023, 1:30 PM</div><span class=\"assistant\">hello</span>")
  });

  test('should setLink', () => {
    // Arrange
    const link = 'https://example.com';

    // Act
    ChatUi.setLink(link);

    // Assert
    expect(ChatUi.elements.ctaButton.getAttribute('href')).toBe(link);
    expect(ChatUi.elements.ctaButton.classList.contains('hidden')).toBe(false);
    expect(ChatUi.elements.promptContainer.classList.contains('hidden')).toBe(true);
  });
});
