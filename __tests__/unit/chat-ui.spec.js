import ChatUi, { CHAT_SEEN_KEY, STORAGE_KEY } from '../../src/lib/chat-ui';
import { assistant } from '../../src/lib/config/assistant';
import { roles } from '../../src/lib/config/roles';
import { loadingDots, messageIncrementor } from '../__mocks__/htmlFixtures';
import { loadingDots as loadingDotsObj } from '../../src/lib/utils';
import { customEventTypes } from '../../src/lib/custom/tracking-events';
import { actionService } from '../../src/lib/action-service';
import { getStringInAngleBrackets } from '../../src/lib/helpers';

const chatWidgets = require('../../src/lib/chat-widgets');

jest.mock('../../src/lib/helpers', () => {
  const originalModule = jest.requireActual('../../src/lib/helpers');
  const mockHelpers = {
    __esModule: true,
    ...originalModule,
    getStringInAngleBrackets: jest.fn().mockReturnValue(['https://mysite.com']),
  };

  // Define the different return values for getAnswerConfig
  let getAnswerConfigCounter = 0;

  mockHelpers.getAnswerConfig = jest.fn(() => {
    if (getAnswerConfigCounter === 0) {
      getAnswerConfigCounter++;
      return {
        list: [
          {
            actions: ['1', '10'],
          },
        ],
        answersType: 'word',
      };
    } else {
      return {
        list: [
          {
            actions: ['2', '3'],
          },
        ],
        answersType: 'word',
      };
    }
  });

  return mockHelpers;
});

jest.mock('../../src/lib/action-service', () => {
  const originalModule = jest.requireActual('../../src/lib/action-service');
  return {
    __esModule: true,
    ...originalModule,
    actionService: {
      getActionCodes: jest.fn().mockReturnValue(['1111']),
      handleAction: jest.fn(),
      removeTextBetweenHashtags: jest.fn().mockReturnValue('text'),
    },
  };
});
jest.mock('socket.io-client');

describe('ChatUi', () => {
  let sut;
  const term = 'test';
  const userID = 'userID';
  const translations = { paymentLoaderTexts: ['Loading...'] };
  beforeEach(() => {
    setContainer();
    jest.useFakeTimers(); // Enable fake timers
    localStorage.setItem('__cid', userID);
    sut = { ...ChatUi };
    Object.defineProperty(window, 'location', {
      value: {
        search: `?utm_chat=${term}`,
      },
      writable: true,
    });
  });

  afterEach(() => {
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
    sut.init({ translations });

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
    const customConfig = { url, customTheme, containerId, translations };
    document.body.innerHTML = `<div id="${containerId}"></div>`;

    // Act
    sut.init(customConfig);

    // Assert
    expect(sut.mainContainer.id).toBe(containerId);
    expect(sut.theme).toEqual(expect.objectContaining(customTheme));
  });

  test('should setConfig correctly and override default set ones', () => {
    // Arrange
    const config = {
      url: 'test.url',
      containerId: 'new-id',
      assistantConfig: {},
      customTheme: { '--lumina': '0' },
      translations: { error: 'some custom error message' },
      socketConfig: { pingInterval: 0 },
    };

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

    sut.init({ containerId, translations });
    sut.setLastMessageButtons = jest.fn();
    sut.track = jest.fn();

    // Arrange
    const messageInput = document.getElementById('chat-prompt');
    const sendButton = document.getElementById('send-button');
    // Simulate user input and button click
    messageInput.value = 'Hello, chatbot!';
    sendButton.click();

    // Assert
    expect(sut.socket.emit).not.toHaveBeenCalledWith(sut.events.chat, expect.any(Object));
    expect(sut.elements.messageIncrementor.innerHTML).toContain('Hello, chatbot!');

    jest.advanceTimersByTime(3000);

    expect(sut.socket.emit).toHaveBeenCalledWith(sut.events.chat, expect.any(Object));

    expect(messageInput.value).toBe('');
    expect(sut.setLastMessageButtons).toBeCalledTimes(1);
    expect(sut.setLastMessageButtons).toBeCalledWith(undefined, false);

    expect(sut.track).toBeCalledTimes(1);
    expect(sut.track).toBeCalledWith(customEventTypes.firstMessage);
  });

  test('test last message buttons set for not last message', () => {
    sut.addOptions = jest.fn();
    sut.setLastMessageButtons('extracted sting', false);
    expect(sut.addOptions).not.toBeCalled();
  });

  test('test last message buttons set for last message', () => {
    sut.init({ translations });
    sut.addOptions = jest.fn();

    sut.setLastMessageButtons('extracted sting', true);

    expect(sut.addOptions).toBeCalledTimes(1);
  });

  test('that initial buttons are not appended from assistant if actions number is 10', () => {
    const element = document.createElement('span');
    element.appendChild = jest.fn();
    sut.getLastMessageElement = jest.fn().mockReturnValue(element);
    actionService.handleAction = jest.fn().mockReturnValue(document.createElement('div'));
    sut.word = jest.fn();

    sut.addOptions();

    //Assert
    expect(element.appendChild).not.toBeCalled();
  });

  test('that initial buttons are appended from assistant if actions number is 10', () => {
    const element = document.createElement('span');
    element.appendChild = jest.fn();
    sut.getLastMessageElement = jest.fn().mockReturnValue(element);
    actionService.handleAction = jest.fn().mockReturnValue(document.createElement('div'));

    sut.word = jest.fn();

    sut.addOptions();

    //Assert
    expect(element.appendChild).toBeCalledTimes(1);
  });

  test('does not send an empty user message', () => {
    // Act
    sut.init({ containerId: 'chatbot-container', translations });
    sut.track = jest.fn();

    // Arrange
    const sendButton = document.getElementById('send-button');
    sendButton.click();
    jest.advanceTimersByTime(3000);

    // Assert
    expect(sut.socket.emit).not.toBeCalledWith('chat');
    // this means that we only have the initiator profile as an element
    expect(sut.elements.messageIncrementor.children.length).toBe(1);

    expect(sut.track).toBeCalledTimes(1);
    expect(sut.track).toBeCalledWith(customEventTypes.firstMessage);
  });

  test('does close the socket', () => {
    // Act
    sut.init({ translations });

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
      role: roles.user,
    });
  });

  test('setCtaButton sets link to an element and disables the field', () => {
    // Act
    sut.init({ containerId: 'chatbot-container', translations });
    sut.track = jest.fn();

    sut.link = 'https://www.test.com';
    sut.setCtaButton();

    // Assert

    expect(sut.elements.ctaButton.classList.contains('hidden')).toBe(false);
    expect(sut.elements.promptContainer.classList.contains('hidden')).toBe(true);
    expect(sut.elements.messageInput.disabled).toBe(true);
    expect(sut.elements.ctaButton.getAttribute('href')).toBe(sut.link);

    expect(sut.track).toBeCalledTimes(1);
    expect(sut.track).toBeCalledWith(customEventTypes.linkProvided);
  });

  test('should setLink', () => {
    // Arrange
    const link = 'https://example.com';

    // Act
    sut.init({ containerId: 'chatbot-container', translations });
    sut.track = jest.fn();

    sut.link = link;
    sut.setCtaButton();

    // Assert
    expect(sut.elements.ctaButton.getAttribute('href')).toBe(link);
    expect(sut.elements.ctaButton.classList.contains('hidden')).toBe(false);
    expect(sut.elements.promptContainer.classList.contains('hidden')).toBe(true);

    expect(sut.track).toBeCalledTimes(1);
    expect(sut.track).toBeCalledWith(customEventTypes.linkProvided);
  });

  test('shouldHideChat returns true when user has seen the chat and the history has not expired (24hrs)', () => {
    // Arrange
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          role: 'user',
          content: 'Get started',
          time: new Date(),
        },
      ]),
    );
    localStorage.setItem(CHAT_SEEN_KEY, true);

    // Act
    const expected = sut.shouldHideChat();

    // Assert
    expect(expected).toBe(true);
  });

  test('shouldHideChat returns false when user has seen the chat and the history has expired (24hrs)', () => {
    // Arrange
    const givenDate = new Date();
    givenDate.setDate(givenDate.getDate() - 1);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          role: 'user',
          content: 'Get started',
          time: givenDate,
        },
      ]),
    );
    localStorage.setItem(CHAT_SEEN_KEY, true);

    // Act
    const expected = sut.shouldHideChat();

    // Assert
    expect(expected).toBe(false);
  });

  test('shouldHideChat returns false when we have history but the user did not see cta button', () => {
    // Arrange
    const givenDate = new Date();
    givenDate.setDate(givenDate.getDate() - 1);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          role: 'user',
          content: 'Get started',
          time: givenDate,
        },
      ]),
    );

    // Act
    const expected = sut.shouldHideChat();

    // Assert
    expect(expected).toBe(false);
  });

  test('should load assistant initial message and send it', async () => {
    // Arrange
    sut.init({ translations: { paymentLoaderTexts: [] } });
    sut.loadInitialMessageSettings = jest.fn();
    sut.delay = jest.fn();
    sut.elements = {
      chatbotContainer: {
        appendChild: jest.fn()
      },
      messageIncrementor: {
        appendChild: jest.fn(),
      },
    };
    sut.appendHtml = jest.fn();
    sut.hideInput = jest.fn();

    jest.spyOn(sut, 'sendAssistantInitialMessage');
    jest.spyOn(sut.socket, 'emit');

    // Act
    await sut.loadAssistantInitialMessage();

    // Assert
    expect(sut.sendAssistantInitialMessage).toHaveBeenCalled();
    expect(sut.socket.emit).toHaveBeenCalledWith('chat', {
      message: assistant.initialMessage.content,
      role: roles.assistant,
      term,
      user_id: 'userID',
    });
  });

  describe('historyTraverse', () => {
    test('iterates over the history with one element', () => {
      sut.appendHtml = jest.fn();
      sut.initMedia = jest.fn();

      sut.historyTraverse([{ content: 'element1' }]);

      expect(sut.appendHtml).toBeCalledTimes(1);
      expect(sut.initMedia).toBeCalledTimes(1);
      expect(sut.appendHtml).toBeCalledWith({ content: 'element1' }, true);
    });

    test('iterates over the history without action data with 2 elements', () => {
      sut.appendHtml = jest.fn();
      sut.initMedia = jest.fn();

      actionService.clearButtonCodes = jest.fn().mockReturnValue('element2', true);

      sut.historyTraverse([{ content: 'element1' }, { content: 'element2' }]);

      expect(sut.initMedia).toBeCalledTimes(1);
      expect(sut.appendHtml).toBeCalledTimes(2);
      expect(sut.appendHtml).toBeCalledWith({ content: 'element1' }, false);
      expect(sut.appendHtml).toBeCalledWith({ content: 'element2' }, true);
      expect(actionService.clearButtonCodes).toBeCalled();
    });

    test('iterates over the history with two element with caret', () => {
      sut.appendHtml = jest.fn();
      sut.initMedia = jest.fn();
      sut.initNewLine = jest.fn();

      sut.historyTraverse([{ content: 'elem^ent1' }, { content: 'element2' }]);

      expect(sut.appendHtml).toBeCalledTimes(1);
      expect(sut.appendHtml).toBeCalledWith({ content: 'element2' }, true);
      expect(sut.initNewLine).toBeCalledTimes(1);
      expect(sut.initMedia).toBeCalledTimes(1);
    });
  });

  describe('initNewLine', () => {
    test('adds new line in case of no caret', () => {
      sut.appendHtml = jest.fn();

      sut.initNewLine({ content: 'element1' }, false);

      expect(sut.appendHtml).toBeCalledTimes(1);
      expect(sut.appendHtml).toBeCalledWith({ content: 'element1' }, false);
    });

    test('adds new line in case of caret', () => {
      sut.appendHtml = jest.fn();

      sut.initNewLine({ content: 'elem^ent1' }, false);

      expect(sut.appendHtml).toBeCalledTimes(2);
      expect(sut.appendHtml).toBeCalledWith({ content: 'elem' }, false);
      expect(sut.appendHtml).toBeCalledWith({ content: 'ent1' }, false);
    });
  });

  describe('initMedia', () => {
    test('appends the media link to the dom', () => {
      sut.appendMedia = jest.fn();

      sut.initMedia(`Hi! I'm here to assist you. {Are you ready?} <https://mylink.com> [Let's start]`);

      expect(getStringInAngleBrackets).toBeCalledTimes(1);
      expect(sut.appendMedia).toBeCalledWith('https://mysite.com');
    });
  });

  test('that processMessageInCaseOfCaret formats the string in the correct format', () => {
    //Arrange
    const text = '^^ ^^ Do^^ you ^^^want^ ^^to ^^^ lose weight [Yes|No]^ ^ ^^^';

    //Act
    const formattedText = ChatUi.formatInitialMessage(text);

    //Assert
    expect(formattedText).toBe('Do^ you^ want^ to^ lose weight [Yes|No]');
  });

  test('that processMessageInCaseOfCaret returns the same string if no carets are present', () => {
    //Arrange
    const text = 'NO CARETS PRESENT';

    //Act
    const formattedText = ChatUi.formatInitialMessage(text);

    //Assert
    expect(formattedText).toBe('NO CARETS PRESENT');
  });

  test('that rebuildInitialMessage builds the correct string from an array', () => {
    //Arrange
    const arr = ['One', 'Two', 'Three'];

    //Act
    const stringResult = ChatUi.rebuildInitialMessage(arr);

    //Assert
    expect(stringResult).toBe('One^ Two^ Three');
  });

  test('that processMessageInCaseOfCaret formats the string in the correct format', () => {
    //Arrange
    const text = '^^ ^^ Do^^ you ^^^want^ ^^to ^^^ lose weight [Yes|No]^ ^ ^^^';

    //Act
    const formattedText = ChatUi.formatInitialMessage(text);

    //Assert
    expect(formattedText).toBe('Do^ you^ want^ to^ lose weight [Yes|No]');
  });

  test('that processMessageInCaseOfCaret returns the same string if no carets are present', () => {
    //Arrange
    const text = 'NO CARETS PRESENT';

    //Act
    const formattedText = ChatUi.formatInitialMessage(text);

    //Assert
    expect(formattedText).toBe('NO CARETS PRESENT');
  });

  test('that rebuildInitialMessage builds the correct string from an array', () => {
    //Arrange
    const arr = ['One', 'Two', 'Three'];

    //Act
    const stringResult = ChatUi.rebuildInitialMessage(arr);

    //Assert
    expect(stringResult).toBe('One^ Two^ Three');
  });
});

describe('test appendHtmlInChunks and all its supporting functions', () => {
  beforeEach(() => {
    document.body.innerHTML = loadingDots + messageIncrementor;

    ChatUi.elements = {
      loadingDots: document.querySelector('.js-wave'),
      messageIncrementor: document.getElementById('message-incrementor'),
    };

    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  test('that delay() promise is resolved after a given time', async () => {
    //Arrange
    const delayTime = 1000;

    //Act
    const promise = ChatUi.delay(delayTime);
    jest.advanceTimersByTime(delayTime);

    //Assert
    await expect(promise).resolves.toBeUndefined();
  });

  test('appendHtmlInChunks calls appendHtml once for each element of the splitted message array', async () => {
    // Arrange
    const appendHtmlSpy = jest.spyOn(ChatUi, 'appendHtml');
    const splitMessage = ['Do you', 'want', 'to lose weight', 'and have fun? [#1#Yes|#2#No]'];
    const data = {
      message: 'Do you^ want^ to lose weight^ and have fun? [#1#Yes|#2#No]',
      role: 'assistant',
      term: 'term',
      user_id: '123',
    };
    ChatUi.setElements();

    // Mock the delay function to resolve immediately
    jest.spyOn(ChatUi, 'delay').mockResolvedValue();

    // Act
    await ChatUi.appendHtmlInChunks(splitMessage, data);

    // Assert
    expect(appendHtmlSpy).toBeCalledTimes(splitMessage.length);
  });

  test('appendHtmlInChunks calls loadingDots.show() once for each element of the splitted message array', async () => {
    // Arrange
    const loadingDotsSpy = jest.spyOn(loadingDotsObj, 'show');
    const splitMessage = ['one', 'two', 'three'];
    const data = {
      message: 'Do you^ want^ to lose weight^ and have fun? [#1#Yes|#2#No]',
      role: 'assistant',
      term: 'term',
      user_id: '123',
    };
    ChatUi.setElements();

    // Mock the delay function to resolve immediately
    jest.spyOn(ChatUi, 'delay').mockResolvedValue();

    // Act
    await ChatUi.appendHtmlInChunks(splitMessage, data);

    // Assert
    expect(loadingDotsSpy).toBeCalledTimes(splitMessage.length);
  });

  test('appendHtmlInChunks calls loadingDots.hide() once for each element of the splitted message array', async () => {
    // Arrange
    const loadingDotsSpy = jest.spyOn(loadingDotsObj, 'hide');
    const splitMessage = ['one', 'two', 'three', 'four'];
    const data = {
      message: 'Do you^ want^ to lose weight^ and have fun? [#1#Yes|#2#No]',
      role: 'assistant',
      term: 'term',
      user_id: '123',
    };
    ChatUi.setElements();

    // Mock the delay function to resolve immediately
    jest.spyOn(ChatUi, 'delay').mockResolvedValue();

    // Act
    await ChatUi.appendHtmlInChunks(splitMessage, data);

    // Assert
    expect(loadingDotsSpy).toBeCalledTimes(splitMessage.length);
  });
});

function setContainer() {
  const container = document.createElement('div');
  container.id = 'chatbot-container';
  document.body.appendChild(container);
}

describe('appendMedia calls the proper media markup', () => {
  test('appendMedia calls videoMarkup if the extractedLink is a video link', () => {
    //Arrange
    let extractedLink = 'https://www.youtube.com/embed/cptE_T8okoo';
    const videoMarkupSpy = jest.spyOn(chatWidgets, 'videoMarkup');
    const imageMarkupSpy = jest.spyOn(chatWidgets, 'imageMarkup');

    //Act
    ChatUi.appendMedia(extractedLink);

    //Assert
    expect(videoMarkupSpy).toBeCalledTimes(1);
    expect(imageMarkupSpy).not.toBeCalled();
  });

  test('appendMedia calls imageMarkup if the extractedLink is of image', () => {
    //Arrange
    const extractedLink = 'www.google.com/image.jpg';
    const imageMarkupSpy = jest.spyOn(chatWidgets, 'imageMarkup');
    const videoMarkupSpy = jest.spyOn(chatWidgets, 'videoMarkup');
    document.appendChild = jest.fn();
    ChatUi.fullScreenImage = jest.fn();

    //Act
    ChatUi.appendMedia(extractedLink);

    //Assert
    expect(imageMarkupSpy).toBeCalledTimes(1);
    expect(videoMarkupSpy).not.toBeCalled();
  });
});

