import ChatUi from '../../src/lib/chat-ui';
import { initiatorProfile } from '../../src/lib/chat-widgets';
import { formatDateByLocale } from '../../src/lib/helpers';
jest.mock('socket.io-client');

describe('ChatUi', () => {
  let sut;
  const userID = 'userID';
  const testMessage = {
    content: 'hello',
    time: '2023-05-12T10:30:45.123Z',
    role: 'assistant',
  };
  beforeEach(() => {
    setContainer();
    jest.useFakeTimers(); // Enable fake timers
    localStorage.setItem('__cid', userID);
    sut = ChatUi;
    Object.defineProperty(window, 'location', {
      value: {
        search: '?utm_chat=test',
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

  test('sends an user message', () => {
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
    jest.advanceTimersByTime(3000);

    // Assert
    expect(sut.socket.emit).toHaveBeenCalledWith(
      sut.events.chat,
      expect.any(Object),
    );
    expect(sut.elements.messageIncrementor.innerHTML).toContain(
      'Hello, chatbot!',
    );
    expect(messageInput.value).toBe('');
    expect(sut.socket.on).toBeCalledWith(sut.events.chat, expect.any(Function));
  });

  test('does not send an empty user message', () => {
    // Act
    sut.init({ containerId: 'chatbot-container' });

    // Arrange
    const sendButton = document.getElementById('send-button');
    sendButton.click();

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
      message: 'Hello, chatbot!',
      term: 'test',
      user_id: 'userID',
    });
  });

  test('should call onError and all its methods when onChat we have errors', () => {
    // Arrange
    jest.spyOn(ChatUi, 'onError');
    sut.init({ containerId: 'chatbot-container' });

    // Act
    sut.onChat({ message: 'hello', errors: ['server error'] });

    // Assert
    expect(sut.onError).toBeCalled();
  });

  test('should not call onError when onChat we have no errors', () => {
    // Arrange
    jest.spyOn(sut, 'appendHtml');

    // Act
    sut.init({ containerId: 'chatbot-container' });
    sut.onChat({ messages: [testMessage], errors: [] });
    // advance the timer by this hardcoded value because it is the largest possible amount
    jest.advanceTimersByTime(8500);

    // Assert
    expect(sut.elements.messageIncrementor.querySelector('.date-formatted').textContent).toEqual(
      formatDateByLocale(
        testMessage.time
      ),
    );
  });

  test('should setLink', () => {
    // Arrange
    const link = 'https://example.com';

    // Act
    sut.init({ containerId: 'chatbot-container' });
    sut.elements.messageIncrementor.innerHTML = `<div class="date-formatted">MAY 12, 2023, 1:30 PM</div><span class="assistant">${link}</span>`;
    sut.setCtaButton(link);

    // Assert
    expect(sut.elements.ctaButton.getAttribute('href')).toBe(link);
    expect(sut.elements.ctaButton.classList.contains('hidden')).toBe(false);
    expect(sut.elements.promptContainer.classList.contains('hidden')).toBe(
      true,
    );
  });
});

function setContainer() {
  const container = document.createElement('div');
  container.id = 'chatbot-container';
  document.body.appendChild(container);
}
