import ChatUi, { CHAT_SEEN_KEY, STORAGE_KEY } from '../../src/lib/chat-ui';
import { assistant } from '../../src/lib/config/assistant';
import { roles } from '../../src/lib/config/roles';

jest.mock('socket.io-client');

describe('ChatUi', () => {
  let sut;
  const term = "test";
  const userID = 'userID';
  beforeEach(() => {
    setContainer();
    jest.useFakeTimers(); // Enable fake timers
    localStorage.setItem('__cid', userID);
    sut = ChatUi;
    Object.defineProperty(window, 'location', {
      value: {
        search: `?utm_chat=${term}`,
      },
      writable: true,
    });
  });

  afterEach(() => {
    sut = null;
    localStorage.clear();
    jest.useRealTimers();
    jest.clearAllTimers();
    delete window.location;
    document.body.innerHTML = '';
  });

  test('initializes the chatbot with default theme and container ID', () => {
    jest.spyOn(sut, 'setConfig');
    jest.spyOn(sut, 'setMessageObject');
    jest.spyOn(sut, 'setCustomVars');
    jest.spyOn(sut, 'setDomContent');
    jest.spyOn(sut, 'setSocket');

    // Act
    sut.init();

    // Assert
    expect(sut.mainContainer).toBeDefined();
    expect(sut.theme).toEqual(
      expect.objectContaining({
        '--ember': '#cacadb',
        '--enigma': '#FFAE19',
        '--lumina': '#f0f2f5',
        '--seraph': '#21bb5a',
        '--whisper': '#ffffff',
        '--zephyr': '43, 49, 57',
      }),
    );
    expect(sut.mainContainer).not.toBeEmptyDOMElement();
    expect(sut.setConfig).toHaveBeenCalledTimes(1);
    expect(sut.setMessageObject).toHaveBeenCalledTimes(1);
    expect(sut.setCustomVars).toHaveBeenCalledTimes(1);
    expect(sut.setSocket).toHaveBeenCalledTimes(1);
    expect(sut.socket).toBeDefined();
  });

  test('initializes the chatbot with custom theme and container ID', () => {
    // Arrange
    const customTheme = {
      '--lumina': '#252239',
      '--whisper': '#151226',
      '--seraph': '#f53373',
      '--ember': '#cacadb',
      '--zephyr': '255, 255, 255',
    };
    const containerId = 'custom-container';
    const url = 'http://localhost:3000';
    const customConfig = { url, customTheme, containerId };
    document.body.innerHTML = `<div id="${containerId}"></div>`;

    // Act
    sut.init(customConfig);

    // Assert
    expect(sut.mainContainer.id).toBe(containerId);
    expect(sut.theme).toEqual(expect.objectContaining(customTheme));
  });

  test('should setConfig correctly and override default set ones', () => {
    // Arrange
    const config = { url: 'test.url', containerId: 'new-id', assistantConfig: {}, customTheme: { '--lumina': '0' }, translations: { error: 'some custom error message' }, socketConfig: { pingInterval: 0 } };

    // Act
    sut.setConfig(config);

    // Assert
    expect(sut.url).toEqual(config.url);
    expect(sut.containerId).toEqual(config.containerId);
    expect(sut.socketConfig.pingInterval).toEqual(config.socketConfig.pingInterval);
    expect(sut.theme['--lumina']).toEqual(config.customTheme['--lumina']);
    expect(sut.translations.error).toEqual(config.translations.error);
  });

  test('sends an user message after 3 seconds of not typing', () => {
    // Act
    const containerId = 'custom-container';
    document.body.innerHTML = `<div id="${containerId}"></div>`;

    sut.init({ containerId });

    // Arrange
    const messageInput = document.getElementById('chat-prompt');
    const sendButton = document.getElementById('send-button');

    // Simulate user input and button click
    messageInput.value = 'Hello, chatbot!';
    sendButton.click();

    // Assert
    expect(sut.socket.emit).not.toHaveBeenCalledWith(
      sut.events.chat,
      expect.any(Object),
    );
    expect(sut.elements.messageIncrementor.innerHTML).toContain(
      'Hello, chatbot!',
    );

    jest.advanceTimersByTime(3000);

    expect(sut.socket.emit).toHaveBeenCalledWith(
      sut.events.chat,
      expect.any(Object),
    );

    expect(messageInput.value).toBe('');
  });

  test('does not send an empty user message', () => {
    // Act
    sut.init({ containerId: 'chatbot-container' });

    // Arrange
    const sendButton = document.getElementById('send-button');
    sendButton.click();
    jest.advanceTimersByTime(3000);

    // Assert
    expect(sut.socket.emit).not.toBeCalledWith('chat');
    // this means that we only have the initiator profile as an element
    expect(sut.elements.messageIncrementor.children.length).toBe(1);
  })

  test('does close the socket', () => {
    // Act
    sut.closeSocket();

    // Assert
    expect(sut.socket.close).toHaveBeenCalled();
  });

  test('should setMessageObject correctly', () => {
    // Assert
    expect(sut.lastQuestionData).toEqual({
      message: '',
      term,
      user_id: 'userID',
      role: roles.user
    });
  });

  test('setCtaButton sets link to an element and disables the field', () => {
    // Arrange
    // Act
    sut.init({ containerId: 'chatbot-container' });
    sut.link = 'https://www.test.com';
    sut.setCtaButton();
    // Assert
    expect(sut.elements.ctaButton.classList.contains('hidden')).toBe(false);
    expect(sut.elements.promptContainer.classList.contains('hidden')).toBe(true);
    expect(sut.elements.messageInput.disabled).toBe(true);
    expect(sut.elements.ctaButton.getAttribute('href')).toBe(sut.link);
  });

  test('should setLink', () => {
    // Arrange
    const link = 'https://example.com';

    // Act
    sut.init({ containerId: 'chatbot-container' });
    sut.link = link;
    sut.setCtaButton();

    // Assert
    expect(sut.elements.ctaButton.getAttribute('href')).toBe(link);
    expect(sut.elements.ctaButton.classList.contains('hidden')).toBe(false);
    expect(sut.elements.promptContainer.classList.contains('hidden')).toBe(
      true,
    );
  });

  test('shouldHideChat returns true when user has seen the chat and the history has not expired (24hrs)', () => {
    // Arrange
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      {
        "role": "user",
        "content": "Get started",
        "time": new Date()
      }
    ]));
    localStorage.setItem(CHAT_SEEN_KEY, true);

    // Act
    const expected = sut.shouldHideChat();

    // Assert
    expect(expected).toBe(true);
  });

  test('shouldHideChat returns false when user has seen the chat and the history has expired (24hrs)', () => {
    // Arrange
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      {
        "role": "user",
        "content": "Get started",
        "time": new Date().getDate() - 2
      }
    ]));
    localStorage.setItem(CHAT_SEEN_KEY, true);

    // Act
    const expected = sut.shouldHideChat();

    // Assert
    expect(expected).toBe(false);
  });

  test('shouldHideChat returns false when we have history but the user did not see cta button', () => {
    // Arrange
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      {
        "role": "user",
        "content": "Get started",
        "time": new Date().getDate() - 2
      }
    ]));

    // Act
    const expected = sut.shouldHideChat();

    // Assert
    expect(expected).toBe(false);
  });

  test('should load assistant initial message and send it', () => {
    // Arrange
    sut.init();
    jest.spyOn(sut, 'sendAssistantInitialMessage');
    jest.spyOn(sut.socket, 'emit');

    // Act
    sut.loadAssistantInitialMessage();

    // Assert
    expect(sut.sendAssistantInitialMessage).toHaveBeenCalled();
    expect(sut.socket.emit).toHaveBeenCalledWith("chat", { "message": assistant.initialMessage.content, "role": roles.assistant, term, "user_id": "userID" });
  });
});

function setContainer() {
  const container = document.createElement('div');
  container.id = 'chatbot-container';
  document.body.appendChild(container);
}
