import { constructLink, replaceLinksWithAnchors } from '../../src/lib/helpers';

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
    const result = constructLink(
      'global https://' +
        link +
        ' you can visit this website for further assistance',
    );
    const expected = 'https://' + link;

    // Assert
    expect(result).toEqual(expected);
  });

  test('should return the link when some other words are added', () => {
    // Act
    const result = constructLink(
      'global https:// some https inserted before link' +
        link +
        ' you can visit this website for further assistance',
    );

    // Assert
    expect(result).toEqual(link);
  });

  test('should not return link when there is only https is included in string', () => {
    // Act
    const result = constructLink(
      'global https:// some broken link you can visit this website for further assistance',
    );
    const expected = false;

    // Assert
    expect(result).toEqual(expected);
  });

  test('should return empty string if no link is found', () => {
    // Act
    const result = constructLink(
      'global wwww some broken link you can visit this website for further assistance',
    );
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
    const expected = 'www.test.diet/?foo=bar&cid=randomUseId';

    // Assert
    expect(result).toEqual(expected);
  });
});

describe('replaceLinksWithAnchors', () => {
  test('should replace links with anchors', () => {
    // Arrange
    const text = 'Visit www.example.com for more information';
    const expected =
      'Visit <a class="underline" href="www.example.com">www.example.com</a>\n for more information';
    // Act
    const result = replaceLinksWithAnchors(text);

    // Assert
    expect(result).toEqual(expected);
  });

  test('should not do anything in case there are no links replace links with anchors', () => {
    // Arrange
    const text = 'Visit www for more information';
    const expected = undefined;
    // Act
    const result = replaceLinksWithAnchors(text);

    // Assert
    expect(result).toEqual(expected);
  });

  test('should replace multiple links with anchors', () => {
    // Arrange
    const text =
      'Visit www.example.com  for more information www.example2.com www.example3.com';

    // Act
    const result = replaceLinksWithAnchors(text);

    // Assert
    expect(result).toContain(
      '<a class="underline" href="www.example2.com">www.example2.com</a>',
    );
    expect(result).toContain(
      '<a class="underline" href="www.example.com">www.example.com</a>',
    );
    expect(result).toContain(
      '<a class="underline" href="www.example3.com">www.example3.com</a>',
    );
  });
});
