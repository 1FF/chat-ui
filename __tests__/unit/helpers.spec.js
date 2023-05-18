import { extractLink } from "../../src/lib/helpers";

describe('extractLink', () => {
  const link = 'www.example.com?utm_source=facebook&utm_medium=cpc&utm_campaign=sale_2020&utm_term=visitors-90d&utm_content=image-101';

  test('should extract link with www only in the string', () => {
    // Act
    const result = extractLink(link)
    const expected = 'www.example.com?utm_source=facebook&utm_medium=cpc&utm_campaign=sale_2020&utm_term=visitors-90d&utm_content=image-101';

    // Assert
    expect(result).toEqual(expected);
  });

  test('should extract link with http://', () => {
    // Act
    const result = extractLink('http://' + link)
    const expected = 'http://' + link;

    // Assert
    expect(result).toEqual(expected);
  });

  test('should extract link with https://', () => {
    // Act
    const result = extractLink('https://' + link)
    const expected = 'https://' + link;

    // Assert
    expect(result).toEqual(expected);
  });

  test('should should extract link with https:// and additional words', () => {
    // Act
    const result = extractLink('global https://' + link + ' you can visit this website for further assistance')
    const expected = 'https://' + link;

    // Assert
    expect(result).toEqual(expected);
  });

  test('should return the link when some other words are added', () => {
    // Act
    const result = extractLink('global https:// some https inserted before link' + link + ' you can visit this website for further assistance')

    // Assert
    expect(result).toEqual(link);
  });

  test('should not return link when there is only https is included in string', () => {
    // Act
    const result = extractLink('global https:// some broken link you can visit this website for further assistance')
    const expected = false;

    // Assert
    expect(result).toEqual(expected);
  });

  test('should return empty string if no link is found', () => {
    // Act
    const result = extractLink('global wwww some broken link you can visit this website for further assistance');
    const expected = false;

    // Assert
    expect(result).toEqual(expected);
  });

  test('should return empty string if no link is found', () => {
    // Act
    const result = extractLink('global wwww some broken link you can visit test.diet this website for further assistance');
    const expected = false;

    // Assert
    expect(result).toEqual(expected);
  });

  test('should extract link with https://', () => {
    // Act
    const result = extractLink('global wwww some broken link you can visit https://test.diet this website for furtger assistance');
    const expected = 'https://test.diet';

    // Assert
    expect(result).toEqual(expected);
  });

  test('should extract link with http://', () => {
    // Act
    const result = extractLink('global wwww some broken link you can visit http://test.diet this website for furtger assistance');
    const expected = 'http://test.diet';

    // Assert
    expect(result).toEqual(expected);
  });

  test('should extract link with www', () => {
    // Act
    const result = extractLink('global wwww healthy link you can visit www.test.diet this website for further assistance');
    const expected = 'www.test.diet';

    // Assert
    expect(result).toEqual(expected);
  });

  test('should add the query params', () => {
    // Act
    window.location.search = '?foo=bar'
    const result = extractLink('global wwww healthy link you can visit www.test.diet this website for further assistance');
    const expected = 'www.test.diet' + window.location.search;

    // Assert
    expect(result).toEqual(expected);
  });
})
