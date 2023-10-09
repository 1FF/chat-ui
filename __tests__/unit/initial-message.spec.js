import ChatUi from '../../src/lib/chat-ui';
import { actionService } from '../../src/lib/action-service';
import { getPopUp, timeMarkup } from '../../src/lib/chat-widgets';
import { loadingDots } from '../../src/lib/utils';
import { extractStringWithBrackets } from '../../src/lib/helpers';

jest.mock('../../src/lib/utils.js', () => {
  return {
    loadingDots: {
      show: jest.fn(),
      hide: jest.fn(),
    },
  };
});

jest.mock('../../src/lib/helpers.js', () => {
  return {
    extractStringWithBrackets: jest.fn().mockReturnValue({
      extractedString: 'extracted-string',
      updatedMessage: 'updated-message',
    }),
    getStringInAngleBrackets: jest.fn().mockReturnValue([''])
  };
});

jest.mock('../../src/lib/chat-widgets', () => {
  return {
    getPopUp: jest.fn().mockReturnValue('<div></div>'),
    timeMarkup: jest.fn().mockReturnValue('markup'),
    imageMarkup: jest.fn()
  };
});

jest.mock('../../src/lib/action-service', () => {
  return {
    ...jest.requireActual('../../src/lib/action-service'),
    actionService: {
      getActionCodes: jest.fn().mockReturnValue(['1111']),
      handleAction: jest.fn(),
      ACTION_CODE_REGEX: 'action_code_regex',
    },
  };
});

describe('ChatUi', () => {
  let sut;
  beforeEach(() => {
    setContainer();
    sut = { ...ChatUi };
  });

  test('should load assistant initial message and send it', async () => {
    // Arrange
    sut.loadInitialMessageSettings = jest.fn();
    sut.sendAssistantInitialMessage = jest.fn();
    sut.delay = jest.fn();
    sut.elements = {
      messageIncrementor: {
        appendChild: jest.fn(),
      },
    };
    sut.appendHtml = jest.fn();
    sut.hideInput = jest.fn();

    // Act
    await sut.loadAssistantInitialMessage();

    // Assert
    expect(sut.loadInitialMessageSettings).toHaveBeenCalled();
    expect(sut.sendAssistantInitialMessage).toHaveBeenCalled();
    expect(loadingDots.show).toHaveBeenCalled();
    expect(loadingDots.hide).toHaveBeenCalled();
    expect(sut.delay).toBeCalledWith(1500);
    expect(extractStringWithBrackets).toHaveBeenCalled();
    expect(sut.elements.messageIncrementor.appendChild).toHaveBeenCalledWith('markup');
    expect(timeMarkup).toHaveBeenCalled();
    expect(sut.appendHtml).toHaveBeenCalled();
    expect(sut.hideInput).toHaveBeenCalled();
  });

  test('should load initial message settings if action code', async () => {
    sut.elements = {
      chatbotContainer: {
        appendChild: jest.fn(),
      },
    };
    sut.delay = jest.fn();

    await sut.loadInitialMessageSettings();

    expect(getPopUp).toHaveBeenCalledWith('1111');
    expect(sut.elements.chatbotContainer.appendChild).toHaveBeenCalledWith('<div></div>');
    expect(sut.delay).toHaveBeenCalledWith(3000);
    expect(actionService.getActionCodes).toHaveBeenCalledWith(
      `Hey there! I'm here to provide nutritional assistance. Let's create the perfect meal plan tailored to your favorite foods. Please share your diet goals with me!`,
      'action_code_regex',
    );
  });
});

function setContainer() {
  const container = document.createElement('div');
  container.id = 'chatbot-container';
  document.body.appendChild(container);
}
