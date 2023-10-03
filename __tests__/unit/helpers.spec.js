import {
  constructLink,
  replaceLinksWithAnchors,
  extractStringWithBrackets,
  getAnswerConfig,
  buildConfig,
  getTerm,
  isExpired,
  splitText,
  clearCarets,
  removeTextBetweenHashtags,
} from '../../src/lib/helpers';

describe('extractLink', () => {
  const link =
    'www.example.com?utm_source=facebook&utm_medium=cpc&utm_campaign=sale_2020&utm_term=visitors-90d&utm_content=image-101';

  test('should extract link with www only in the string', () => {
    // Act
    const result = constructLink(link);
    const expected =
      'www.example.com?utm_source=facebook&utm_medium=cpc&utm_campaign=sale_2020&utm_term=visitors-90d&utm_content=image-101';

    // Assert
    expect(result).toEqual(expected);
  });

  test('should extract link with http://', () => {
    // Act
    const result = constructLink('http://' + link);
    const expected = 'http://' + link;

    // Assert
    expect(result).toEqual(expected);
  });

  test('should extract link with https://', () => {
    // Act
    const result = constructLink('https://' + link);
    const expected = 'https://' + link;

    // Assert
    expect(result).toEqual(expected);
  });

  test('should should extract link with https:// and additional words', () => {
    // Act
    const result = constructLink('global https://' + link + ' you can visit this website for further assistance');
    const expected = 'https://' + link;

    // Assert
    expect(result).toEqual(expected);
  });

  test('should return the link when some other words are added', () => {
    // Act
    const result = constructLink(
      'global https:// some https inserted before link ' + link + ' you can visit this website for further assistance',
    );

    // Assert
    expect(result).toEqual(link);
  });

  test('should not return link when there is only https is included in string', () => {
    // Act
    const result = constructLink('global https:// some broken link you can visit this website for further assistance');
    const expected = false;

    // Assert
    expect(result).toEqual(expected);
  });

  test('should return empty string if no link is found', () => {
    // Act
    const result = constructLink('global wwww some broken link you can visit this website for further assistance');
    const expected = false;

    // Assert
    expect(result).toEqual(expected);
  });

  test('should return empty string if no link is found', () => {
    // Act
    const result = constructLink(
      'global wwww some broken link you can visit test.diet this website for further assistance',
    );
    const expected = false;

    // Assert
    expect(result).toEqual(expected);
  });

  test('should extract link with https://', () => {
    // Act
    const result = constructLink(
      'global wwww some broken link you can visit https://test.diet this website for furtger assistance',
    );
    const expected = 'https://test.diet';

    // Assert
    expect(result).toEqual(expected);
  });

  test('should extract link with http://', () => {
    // Act
    const result = constructLink(
      'global wwww some broken link you can visit http://test.diet this website for further assistance',
    );
    const expected = 'http://test.diet';

    // Assert
    expect(result).toEqual(expected);
  });

  test('should extract link with www', () => {
    // Act
    const result = constructLink(
      'global wwww healthy link you can visit www.test.diet this website for further assistance',
    );
    const expected = 'www.test.diet';

    // Assert
    expect(result).toEqual(expected);
  });

  test('should add the query params if we have query params in the url without utm_chat', () => {
    // Act
    window.location.search = '?foo=bar&utm_chat=vegan';
    const userId = 'randomUseId';
    localStorage.setItem('__cid', userId);

    const result = constructLink(
      'global wwww healthy link you can visit www.test.diet this website for further assistance',
    );
    const expected = 'www.test.diet/?foo=bar&utm_chat=vegan&chatSeen=true&cid=randomUseId';

    // Assert
    expect(result).toEqual(expected);
  });
});

describe('replaceLinksWithAnchors', () => {
  test('should replace links with anchors', () => {
    // Arrange
    const text = 'Visit www.example.com for more information';
    const expected = 'Visit <a class="underline" href="www.example.com">www.example.com</a> for more information';
    // Act
    const result = replaceLinksWithAnchors(text);

    // Assert
    expect(result).toEqual(expected);
  });

  test('should not do anything in case there are no links replace links with anchors', () => {
    // Arrange
    const text = 'Visit www for more information';

    // Act
    const result = replaceLinksWithAnchors(text);

    // Assert
    expect(result).toEqual(text);
  });

  test('should replace multiple links with anchors', () => {
    // Arrange
    const text = 'Visit www.example.com  for more information www.example2.com www.example3.com';

    // Act
    const result = replaceLinksWithAnchors(text);

    // Assert
    expect(result).toContain('<a class="underline" href="www.example2.com">www.example2.com</a>');
    expect(result).toContain('<a class="underline" href="www.example.com">www.example.com</a>');
    expect(result).toContain('<a class="underline" href="www.example3.com">www.example3.com</a>');
  });
});

describe('extractStringWithBrackets', () => {
  test('should extract string with brackets from the message', () => {
    const message = 'Hello [World]!';
    const expected = {
      extractedString: 'World',
      updatedMessage: 'Hello !',
    };
    const result = extractStringWithBrackets(message);
    expect(result).toEqual(expected);
  });

  test('removeTextBetweenHashtags', () => {
    //Arrange
    let input = '#1111#This is a test message';
    const expected = 'This is a test message';

    //Act
    const result = removeTextBetweenHashtags(input);

    //Assert
    expect(result).toEqual(expected);
  });

  test('should handle multiple brackets in the message', () => {
    const message = 'Hello [World]! [How] are [you]?';
    const expected = {
      extractedString: 'World',
      updatedMessage: 'Hello ! [How] are [you]?',
    };
    const result = extractStringWithBrackets(message);
    expect(result).toEqual(expected);
  });

  test('should return original message if no brackets are found', () => {
    const message = 'Hello World!';
    const expected = {
      extractedString: '',
      updatedMessage: 'Hello World!',
    };
    const result = extractStringWithBrackets(message);
    expect(result).toEqual(expected);
  });
});

describe('getAnswerConfig', () => {
  test('should return answer config with singleChoice type', () => {
    const output = 'Option 1 | Option 2 | Option 3';
    const expected = {
      answersType: 'singleChoice',
      list: [
        { content: 'Option 1', actions: [] },
        { content: 'Option 2', actions: [] },
        { content: 'Option 3', actions: [] },
      ],
    };
    const result = getAnswerConfig(output);
    expect(result).toEqual(expected);
  });

  test('should handle trimmed options with empty content', () => {
    const output = '   Option 1   |   Option 2   |   Option 3   ';
    const expected = {
      answersType: 'singleChoice',
      list: [
        { content: 'Option 1', actions: [] },
        { content: 'Option 2', actions: [] },
        { content: 'Option 3', actions: [] },
      ],
    };
    const result = getAnswerConfig(output);
    expect(result).toEqual(expected);
  });

  test('that buildConfig() builds the correct object', () => {
    //Arrange
    const data = ['#1# #9 Yes', 'No #3# ###4 ###2# ', ' ##456 4### 4 ###44 Yes #4 4# 343 # ##'];

    //Act
    const config = buildConfig(data);

    //Assert
    expect(config.list[0].content).toBe('Yes');
    expect(config.list[0].actions).toHaveLength(1);
    expect(config.list[0].actions[0]).toBe('1');
    expect(config.list[1].content).toBe('No');
    expect(config.list[1].actions).toHaveLength(2);
    expect(config.list[1].actions[0]).toBe('3');
    expect(config.list[1].actions[1]).toBe('2');
    expect(config.list[2].content).toBe('4  Yes   343');
    expect(config.list[2].actions).toHaveLength(0);
  });
});

describe('getTerm', () => {
  test('should retrieve the value of the utm_chat parameter', () => {
    // Mocking the URLSearchParams
    global.URLSearchParams = jest.fn(() => ({
      get: jest.fn((param) => {
        if (param === 'utm_chat') {
          return 'example-value';
        }
        return null;
      }),
    }));

    const result = getTerm();
    expect(result).toBe('example-value');
  });

  test('should return null if utm_chat parameter is not present', () => {
    // Mocking the URLSearchParams
    global.URLSearchParams = jest.fn(() => ({
      get: jest.fn(() => null),
    }));

    const result = getTerm();
    expect(result).toBeNull();
  });
});

describe('isExpired', () => {
  test('returns true if 24 hours have passed since the given date', () => {
    // Arrange
    // Set the given date 24 hours in the past
    const givenDate = new Date();
    givenDate.setDate(givenDate.getDate() - 1);

    // Act
    const expected = isExpired(givenDate.toISOString());

    // Assert
    expect(expected).toBe(true);
  });

  test('returns false if less than 24 hours have passed since the given date', () => {
    // Arrange
    // Set the given date to the current date
    const givenDate = new Date();

    // Act
    const expected = isExpired(givenDate.toISOString());

    // Assert
    expect(expected).toBe(false);
  });

  test('returns false if the given date is in the future', () => {
    // Arrange
    // Set the given date to 24 hours in the future
    const givenDate = new Date();
    givenDate.setDate(givenDate.getDate() + 1);

    // Act
    const expected = isExpired(givenDate.toISOString());

    // Assert
    expect(expected).toBe(false);
  });

  test('that splitText() splits the text with the with the given separator', () => {
    //Arrange
    const text = 'This^is^test^text!';
    const separator = '^';

    //Act
    const resultArr = splitText(text, separator);

    //Assert
    expect(resultArr).toHaveLength(4);
  });

  test('that splitText() trims the text of each element', () => {
    //Arrange
    const text = 'This  ^  is ^ test   ^text!   ';
    const separator = '^';

    //Act
    const resultArr = splitText(text, separator);

    //Assert
    resultArr.forEach((element) => {
      expect(element).not.toContain(' ');
    });
  });

  test('that splitText() removes the empty elements', () => {
    //Arrange
    const text = '^This  ^  is ^ test   ^text! ^ ^  ';
    const separator = '^';

    //Act
    const resultArr = splitText(text, separator);

    //Assert
    expect(resultArr).not.toContain('');
  });

  test('that clearCaret() removes all the carets from a string', () => {
    //Arrange
    const text = '^This^ is^ test^ text!^';

    //Act
    const resultText = clearCarets(text);

    //Assert
    expect(resultText).toBe('This is test text!');
  });

  test('that clearCaret() returns the same string if no carets are present', () => {
    //Arrange
    const text = '^This is test text!';

    //Act
    const resultText = clearCarets(text);

    //Assert
    expect(resultText).toBe('This is test text!');
  });
});
