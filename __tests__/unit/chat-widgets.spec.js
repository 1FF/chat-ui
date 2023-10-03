import { getPopUp } from '../../src/lib/chat-widgets';

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
