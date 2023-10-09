import { getPopUp, videoMarkup, imageMarkup } from '../../src/lib/chat-widgets';

describe('getPopUp function', () => {
  it('should create the first modal when type is "1111"', () => {
    // Arrange
    const type = '1111';

    // Act
    const modal = getPopUp(type);

    // Assert
    expect(modal).toBeInstanceOf(HTMLDivElement);
    expect(modal.classList.contains('modal-wrapper')).toBe(true);

    const popUp = modal.querySelector('.pop-up');
    expect(popUp).toBeInstanceOf(HTMLDivElement);
    expect(popUp.classList.contains('pop-up')).toBe(true);

    const counter = popUp.querySelector('.image1');
    expect(counter).toBeInstanceOf(HTMLDivElement);
    expect(counter.classList.contains('image1')).toBe(true);

    const header = popUp.querySelector('.header');
    expect(header).toBeInstanceOf(HTMLDivElement);
    expect(header.textContent).toBe('Connection with our best Nutrition Agent');

    const subHeader = popUp.querySelector('.sub-header');
    expect(subHeader).toBeInstanceOf(HTMLDivElement);
    expect(subHeader.textContent).toBe('A few seconds until the chat starts');
  });

  it('should create the second modal when type is "1112"', () => {
    // Arrange
    const type = '1112';

    // Act
    const modal = getPopUp(type);

    // Assert
    expect(modal).toBeInstanceOf(HTMLDivElement);
    expect(modal.classList.contains('modal-wrapper')).toBe(true);

    const popUp = modal.querySelector('.pop-up');
    expect(popUp).toBeInstanceOf(HTMLDivElement);
    expect(popUp.classList.contains('pop-up')).toBe(true);

    const counter = popUp.querySelector('.image2');
    expect(counter).toBeInstanceOf(HTMLDivElement);
    expect(counter.classList.contains('image2')).toBe(true);

    const header = popUp.querySelector('.header');
    expect(header).toBeInstanceOf(HTMLDivElement);
    expect(header.textContent).toBe('Connection with our best Nutrition Agent');

    const subHeader = popUp.querySelector('.sub-header');
    expect(subHeader).toBeInstanceOf(HTMLDivElement);
    expect(subHeader.textContent).toBe('A few seconds until the chat starts');
  });
});

describe('videoMarkup and imageMarkup works correctly', () => {
  it('should create an iframe element with the correct attributes', () => {
    // Arrange
    const extractedLink = 'https://example.com/video';

    // Act
    const result = videoMarkup(extractedLink);

    // Assert
    expect(result).toBeInstanceOf(HTMLIFrameElement);
    expect(result.src).toBe(`${extractedLink}?enablejsapi=1&rel=0`);
    expect(result.getAttribute('allow')).toBe('fullscreen');
    expect(result.id).toBe('player');
    expect(result.classList.contains('media-video')).toBe(true);
  });

  it('should create a div element containing an img element with the correct attributes', () => {
    // Arrange
    const extractedLink = 'https://example.com/image.jpg';

    // Act
    const result = imageMarkup(extractedLink);

    // Assert
    expect(result).toBeInstanceOf(HTMLDivElement);

    const imgElement = result.querySelector('img');
    expect(imgElement).toBeInstanceOf(HTMLImageElement);
    expect(imgElement.src).toBe(extractedLink);
    expect(imgElement.classList.contains('media-image')).toBe(true);

    expect(result.classList.contains('image-wrapper')).toBe(true);
  });
});
