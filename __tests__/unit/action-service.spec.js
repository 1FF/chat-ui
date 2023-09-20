import { actionService } from '../../src/lib/action-service.js';

describe('Test the action service', () => {
  test('that getActionCodes() works correctly', () => {
    //Arrange
    const text = '#1##2# #3#';

    //Act
    const actionCodes = actionService.getActionCodes(text, actionService.ACTION_CODE_REGEX);

    //Assert
    expect(actionCodes).toHaveLength(3);
  });

  test('that getActionCodes() does not match wrong codes', () => {
    //Arrange
    const text = '##456 4### 4 ###44 #4 4# 343 # ##';

    //Act
    const actionCodes = actionService.getActionCodes(text, actionService.ACTION_CODE_REGEX);

    //Assert
    expect(actionCodes).toHaveLength(0);
  });

  test('that clearButtonCodes() clears the correct patterns', () => {
    //Arrange
    const text = '##456## 4###### #44 434# ##434# CORRECT # ##';

    //Act
    const value = actionService.clearButtonCodes(text, actionService.CLEAR_ACTION_CODE_REGEX);

    //Assert
    expect(value).toBe('     CORRECT  ');
  });

  test('that handleAction() calls applyBackgroundColor() with the correct params', () => {
    //Arrange
    const applyBackGroundColorSpy = jest.spyOn(actionService, 'applyBackGroundColor');

    //Act
    const div = document.createElement('div');
    const answer = { content: 'Yes', actions: ['1'] };

    actionService.handleAction(div, answer.actions);

    //Assert
    expect(applyBackGroundColorSpy).toBeCalledWith(div, 'red');
  });

  test('that handleAction() calls applyBorder() with the correct params', () => {
    //Arrange
    const applyBorderSpy = jest.spyOn(actionService, 'applyBorder');

    //Act
    const div = document.createElement('div');
    const answer = { content: 'Yes', actions: ['3'] };

    actionService.handleAction(div, answer.actions);

    //Assert
    expect(applyBorderSpy).toBeCalledWith(div, ['1px', 'solid', 'blue', '20px']);
  });

  test('that handleAction() calls applyFont() with the correct params', () => {
    //Arrange
    const applyFontSpy = jest.spyOn(actionService, 'applyFont');

    //Act
    const div = document.createElement('div');
    const answer = { content: 'Yes', actions: ['2'] };

    actionService.handleAction(div, answer.actions);

    //Assert
    expect(applyFontSpy).toBeCalledWith(div, ['white', '1rem', 'normal']);
  });

  test('that handleAction() calls applyFont() with the correct params (div, 2)', () => {
    //Arrange
    const applyFontSpy = jest.spyOn(actionService, 'applyFont');

    //Act
    const div = document.createElement('div');
    const answer = { content: 'Yes', actions: ['4'] };

    actionService.handleAction(div, answer.actions);

    //Assert
    expect(applyFontSpy).toBeCalledWith(div, ['black', '1rem', 'normal']);
  });

  test('that handleAction() calls applyBackgroundColor(), applyBorder(), applyFont() 3 times each', () => {
    //Arrange
    const applyBackGroundColorSpy = jest.spyOn(actionService, 'applyBackGroundColor');
    const applyBorderSpy = jest.spyOn(actionService, 'applyBorder');
    const applyFontSpy = jest.spyOn(actionService, 'applyFont');

    //Act
    const div = document.createElement('div');
    const answer = { content: 'Yes', actions: ['1', '2', '3'] };

    actionService.handleAction(div, answer.actions);

    //Assert
    expect(applyBackGroundColorSpy).toBeCalledTimes(3);
    expect(applyBorderSpy).toBeCalledTimes(3);
    expect(applyFontSpy).toBeCalledTimes(3);
  });

  test('that handleAction() calls moveButtons', () => {
    //Arrange
    document.body.innerHTML = '<div id="container"></div>';
    const moveButtonsSpy = jest.spyOn(actionService, 'moveButtons');

    //Act
    const answersContainer = document.createElement('div');
    const buttonsWrapper = document.createElement('div');
    const answer = { content: 'Yes', actions: ['10'] };

    actionService.handleAction(buttonsWrapper, answer.actions, answersContainer);

    //Assert
    expect(moveButtonsSpy).toBeCalledTimes(1);
  });

  test('that handleAction() calls moveButtons() for as many times as the buttons count is', () => {
    const moveButtonsSpy = jest.spyOn(actionService, 'moveButtons');

    //Act
    const answersContainer = document.createElement('div');
    const buttonsWrapper = document.createElement('div');
    const answer = { content: 'Yes', actions: ['10', '10'] };

    actionService.handleAction(buttonsWrapper, answer.actions, answersContainer);

    //Assert
    expect(moveButtonsSpy).toBeCalledTimes(2);
  });

  test('that handleAction() calls moveButtons() alongside with other actions', () => {
    const moveButtonsSpy = jest.spyOn(actionService, 'moveButtons');
    const applyBackGroundColorSpy = jest.spyOn(actionService, 'applyBackGroundColor');
    const applyBorderSpy = jest.spyOn(actionService, 'applyBorder');
    const applyFontSpy = jest.spyOn(actionService, 'applyFont');

    //Act
    const answersContainer = document.createElement('div');
    const buttonsWrapper = document.createElement('div');
    const answer = { content: 'Yes', actions: ['10', '4'] };

    actionService.handleAction(buttonsWrapper, answer.actions, answersContainer);

    //Assert
    expect(moveButtonsSpy).toBeCalledTimes(1);
    expect(applyBackGroundColorSpy).toBeCalledTimes(1);
    expect(applyBorderSpy).toBeCalledTimes(1);
    expect(applyFontSpy).toBeCalledTimes(1);
  });

  test('that applyBackgroundColor() applies red background color for code = 1', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 'red');

    //Assert
    expect(div.style.backgroundColor).toBe('red');
  });

  test('that applyBackgroundColor() applies green background color for code = 2', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 'green');

    //Assert
    expect(div.style.backgroundColor).toBe('green');
  });

  test('that applyBackgroundColor() applies blue background colorfor code = 3', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 'blue');

    //Assert
    expect(div.style.backgroundColor).toBe('blue');
  });

  test('that applyBackgroundColor() applies orange background color for code = 4', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 'orange');

    //Assert
    expect(div.style.backgroundColor).toBe('orange');
  });

  test('that applyBackgroundColor() applies yellow background color for code = 5', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 'yellow');

    //Assert
    expect(div.style.backgroundColor).toBe('yellow');
  });

  test('that applyBackgroundColor() applies purple background color for code = 6', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 'purple');

    //Assert
    expect(div.style.backgroundColor).toBe('purple');
  });

  test('that applyBackgroundColor() applies pink background color for code = 7', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 'pink');

    //Assert
    expect(div.style.backgroundColor).toBe('pink');
  });

  test('that applyBackgroundColor() applies white background color for code = 8', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 'white');

    //Assert
    expect(div.style.backgroundColor).toBe('white');
  });

  test('that applyBackgroundColor() applies black background color for code = 9', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 'black');

    //Assert
    expect(div.style.backgroundColor).toBe('black');
  });

  test('that applyBorder() applies red border color for code = 1', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBorder(div, ['1px', 'solid', 'red', '20px']);

    //Assert
    expect(div.style.borderColor).toBe('red');
    expect(div.style.borderWidth).toBe('1px');
    expect(div.style.borderStyle).toBe('solid');
    expect(div.style.borderRadius).toBe('20px');
  });

  test('that applyBorder() applies green border color for code = 2', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBorder(div, ['1px', 'solid', 'green', '20px']);

    //Assert
    expect(div.style.borderColor).toBe('green');
    expect(div.style.borderWidth).toBe('1px');
    expect(div.style.borderStyle).toBe('solid');
    expect(div.style.borderRadius).toBe('20px');
  });

  test('that applyBorder() applies blue border color for code = 3', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBorder(div, ['1px', 'solid', 'blue', '20px']);

    //Assert
    expect(div.style.borderColor).toBe('blue');
    expect(div.style.borderWidth).toBe('1px');
    expect(div.style.borderStyle).toBe('solid');
    expect(div.style.borderRadius).toBe('20px');
  });

  test('that applyBorder() applies orange border color for code = 4', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBorder(div, ['1px', 'solid', 'orange', '20px']);

    //Assert
    expect(div.style.borderColor).toBe('orange');
    expect(div.style.borderWidth).toBe('1px');
    expect(div.style.borderStyle).toBe('solid');
    expect(div.style.borderRadius).toBe('20px');
  });

  test('that applyBorder() applies yellow border color for code = 5', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBorder(div, ['1px', 'solid', 'yellow', '20px']);

    //Assert
    expect(div.style.borderColor).toBe('yellow');
    expect(div.style.borderWidth).toBe('1px');
    expect(div.style.borderStyle).toBe('solid');
    expect(div.style.borderRadius).toBe('20px');
  });

  test('that applyBorder() applies purple border color for code = 6', () => {
    //Arange
    const div = document.createElement('div');

    //Arangeborder
    actionService.applyBorder(div, ['1px', 'solid', 'purple', '20px']);

    //Assert
    expect(div.style.borderColor).toBe('purple');
    expect(div.style.borderWidth).toBe('1px');
    expect(div.style.borderStyle).toBe('solid');
    expect(div.style.borderRadius).toBe('20px');
  });

  test('that applyBorder() applies pink border color for code = 7', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBorder(div, ['1px', 'solid', 'pink', '20px']);

    //Assert
    expect(div.style.borderColor).toBe('pink');
    expect(div.style.borderWidth).toBe('1px');
    expect(div.style.borderStyle).toBe('solid');
    expect(div.style.borderRadius).toBe('20px');
  });

  test('that applyBorder() applies white border color for code = 8', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBorder(div, ['1px', 'solid', 'white', '20px']);

    //Assert
    expect(div.style.borderColor).toBe('white');
    expect(div.style.borderWidth).toBe('1px');
    expect(div.style.borderStyle).toBe('solid');
    expect(div.style.borderRadius).toBe('20px');
  });

  test('that applyBorder() applies black border color for code = 9', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBorder(div, ['1px', 'solid', 'black', '20px']);

    //Assert
    expect(div.style.borderColor).toBe('black');
    expect(div.style.borderWidth).toBe('1px');
    expect(div.style.borderStyle).toBe('solid');
    expect(div.style.borderRadius).toBe('20px');
  });

  test('that applyFont() applies white text color for code = 8', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyFont(div, ['white', '1rem', 'normal']);

    //Assert
    expect(div.style.color).toBe('white');
    expect(div.style.fontSize).toBe('1rem');
    expect(div.style.fontWeight).toBe('normal');
  });

  test('that applyFont() applies black text color for code = 9', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyFont(div, ['black', '1rem', 'normal']);

    //Assert
    expect(div.style.color).toBe('black');
    expect(div.style.fontSize).toBe('1rem');
    expect(div.style.fontWeight).toBe('normal');
  });

  test('that applyBackGroundImage() applies the background image', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundImage(div, 'url(/pic.jpg)');

    //Assert
    expect(div.style.backgroundImage).toBe('url(/pic.jpg)');
  });

  test('that applyMargin applies the correct values', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyMargin(div, ['1rem', '2px', 'auto', '-4em']);

    //Assert
    expect(div.style.marginTop).toBe('1rem');
    expect(div.style.marginRight).toBe('2px');
    expect(div.style.marginBottom).toBe('auto');
    expect(div.style.marginLeft).toBe('-4em');
  });

  test('that applyPadding applies the correct values', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyPadding(div, ['3rem', '-6px', '0px', '1px']);

    //Assert
    expect(div.style.paddingTop).toBe('3rem');
    expect(div.style.paddingRight).toBe('-6px');
    expect(div.style.paddingBottom).toBe('0px');
    expect(div.style.paddingLeft).toBe('1px');
  });

  test('that applyFlexbox applies the correct values', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyFlexbox(div, ['flex', 'row-reverse', 'center', 'center']);

    //Assert
    expect(div.style.display).toBe('flex');
    expect(div.style.flexDirection).toBe('row-reverse');
    expect(div.style.justifyContent).toBe('center');
    expect(div.style.alignItems).toBe('center');
  });

  test('that applyCommonStylesToBorderElement() calls applyPadding() with the correct params', () => {
    //Arrange
    const applyPaddingSpy = jest.spyOn(actionService, 'applyPadding');
    const div = document.createElement('div');

    //Act
    actionService.applyCommonStylesToBorderElement(div, 11);

    //Assert
    expect(applyPaddingSpy).toBeCalledWith(div, ['0.625rem', '0.625rem', '0.625rem', '0.625rem']);
  });

  test('that applyCommonStylesToBorderElement() calls applyBackGroundColor() with the correct params', () => {
    //Arrange
    const applyBackGroundColorSpy = jest.spyOn(actionService, 'applyBackGroundColor');
    const div = document.createElement('div');

    //Act
    actionService.applyCommonStylesToBorderElement(div, 11);

    //Assert
    expect(applyBackGroundColorSpy).toBeCalledWith(div, 'unset');
  });

  test('that applyCommonStylesToBorderElement() calls applyBorder() with the correct params', () => {
    //Arrange
    const applyBorderSpy = jest.spyOn(actionService, 'applyBorder');
    const div = document.createElement('div');

    //Act
    actionService.applyCommonStylesToBorderElement(div, 11);

    //Assert
    expect(applyBorderSpy).toBeCalledWith(div, ['0', 'unset', 'unset', '6.25rem']);
  });

  test('that if code === 11 applyCommonStylesToBorderElement() calls applyBackGroundImage() with the correct params', () => {
    //Arrange
    const applyBackGroundImageSpy = jest.spyOn(actionService, 'applyBackGroundImage');
    const div = document.createElement('div');

    //Act
    actionService.applyCommonStylesToBorderElement(div, 11);

    //Assert
    expect(applyBackGroundImageSpy).toBeCalledWith(
      div,
      'linear-gradient(to right, rgba(99, 82, 197, 0.1) 0%, rgba(99, 82, 197, 0.1))',
    );
  });

  test('that if code === 12 applyCommonStylesToBorderElement() calls applyBackGroundImage() with the correct params', () => {
    //Arrange
    const applyBackGroundImageSpy = jest.spyOn(actionService, 'applyBackGroundImage');
    const div = document.createElement('div');

    //Act
    actionService.applyCommonStylesToBorderElement(div, 12);

    //Assert
    expect(applyBackGroundImageSpy).toBeCalledWith(
      div,
      'linear-gradient(to right, rgba(245, 51, 115, 0.1) 0%, rgba(245, 51, 115, 0.1) 100%, rgba(245, 51, 115, 0.1) 100%)',
    );
  });

  test('that applyCommonStylesToBorderElement() returns the same element as it takes as parameter', () => {
    //Arrange
    const div = document.createElement('div');

    //Act
    const element = actionService.applyCommonStylesToBorderElement(div, 12);

    //Assert
    expect(element.tagName).toBe('DIV');
  });

  test('that createInnerButtonElement() calls applyBorder() with the correct params', () => {
    //Arrange
    const applyBorderSpy = jest.spyOn(actionService, 'applyBorder');
    const div = document.createElement('div');

    //Act
    actionService.createInnerButtonElement(div, 11);

    //Assert
    expect(applyBorderSpy).toBeCalledWith(div, ['0', 'unset', 'unset', '6.25rem']);
  });

  test('that createInnerButtonElement() calls applyFlexbox() with the correct params', () => {
    //Arrange
    const applyFlexboxSpy = jest.spyOn(actionService, 'applyFlexbox');
    const div = document.createElement('div');

    //Act
    actionService.createInnerButtonElement(div, 11);

    //Assert
    expect(applyFlexboxSpy).toBeCalledWith(div, ['flex', 'row-reverse', 'center', 'center']);
  });

  test('that createInnerButtonElement() calls applyMargin() with the correct params', () => {
    //Arrange
    const applyMarginSpy = jest.spyOn(actionService, 'applyMargin');
    const div = document.createElement('div');

    //Act
    actionService.createInnerButtonElement(div, 12);

    //Assert
    expect(applyMarginSpy).toBeCalledWith(div, ['0', '0', '0', '0']);
  });

  test('that createInnerButtonElement() calls applyFont() with the correct params', () => {
    //Arrange
    const applyFontSpy = jest.spyOn(actionService, 'applyFont');
    const div = document.createElement('div');

    //Act
    actionService.createInnerButtonElement(div, 12);

    //Assert
    expect(applyFontSpy).toBeCalledWith(div, ['white', '1rem', 'bold']);
  });

  test('that if code === 11 createInnerButtonElement() calls applyBackGroundImage() with the correct params', () => {
    //Arrange
    const applyBackGroundImageSpy = jest.spyOn(actionService, 'applyBackGroundImage');
    const div = document.createElement('div');

    //Act
    actionService.createInnerButtonElement(div, 11);

    //Assert
    expect(applyBackGroundImageSpy).toBeCalledWith(
      div,
      'linear-gradient(to right, #6352c5 0%, #6352c5 100%, #6352c5 100%)',
    );
  });

  test('that if code === 12 createInnerButtonElement() calls applyBackGroundImage() with the correct params', () => {
    //Arrange
    const applyBackGroundImageSpy = jest.spyOn(actionService, 'applyBackGroundImage');
    const div = document.createElement('div');

    //Act
    actionService.createInnerButtonElement(div, 12);

    //Assert
    expect(applyBackGroundImageSpy).toBeCalledWith(
      div,
      'linear-gradient(to right, #f53373 0%, #f53373 100%, #f53373 100%)',
    );
  });

  test('that if code === 11 createInnerButtonElement() appends the male svg element', () => {
    //Arrange
    const div = document.createElement('div');

    //Act
    const element = actionService.createInnerButtonElement(div, 11);

    //Assert
    expect(element.children[0]).toHaveClass('male');
    expect(element.children[0].tagName).toBe('svg');
  });

  test('that if code === 12 createInnerButtonElement() appends the male svg element', () => {
    //Arrange
    const div = document.createElement('div');

    //Act
    const element = actionService.createInnerButtonElement(div, 12);

    //Assert
    expect(element.children[0]).toHaveClass('female');
    expect(element.children[0].tagName).toBe('svg');
  });

  test('that createInnerButtonElement() returns the same element as it takes as parameter', () => {
    //Arrange
    const div = document.createElement('div');

    //Act
    const element = actionService.createInnerButtonElement(div, 12);

    //Assert
    expect(element.tagName).toBe('DIV');
  });

  test('that createOuterBorderElement() calls applyCommonStylesToBorderElement() is called correct number of times', () => {
    //Arrange
    const applyCommonStylesToBorderElementSpy = jest.spyOn(actionService, 'applyCommonStylesToBorderElement');
    const div = document.createElement('div');

    //Act
    actionService.createOuterBorderElement(11);

    //Assert
    expect(applyCommonStylesToBorderElementSpy).toBeCalledTimes(1);
  });

  test('that createOuterBorderElement() calls applyMargin() with the correct params', () => {
    //Arrange
    const code = 11;
    const applyMarginSpy = jest.spyOn(actionService, 'applyMargin');
    const div = document.createElement('div');
    let element = actionService.applyCommonStylesToBorderElement(div, code);

    //Act
    element = actionService.createOuterBorderElement(code);

    //Assert
    expect(applyMarginSpy).toBeCalledWith(element, ['0', '0', '10px', '0']);
  });

  test('that createOuterBorderElement() returns div', () => {
    //Act
    const element = actionService.createOuterBorderElement(11);

    //Assert
    expect(element.tagName).toBe('DIV');
  });

  test('that createInnerBorderElement() calls applyCommonStylesToBorderElement() is called correct number of times', () => {
    //Arrange
    const applyCommonStylesToBorderElementSpy = jest.spyOn(actionService, 'applyCommonStylesToBorderElement');
    const div = document.createElement('div');

    //Act
    actionService.createInnerBorderElement(12);

    //Assert
    expect(applyCommonStylesToBorderElementSpy).toBeCalledTimes(1);
  });

  test('that createInnerBorderElement() calls applyMargin() with the correct params', () => {
    //Arrange
    const code = 12;
    const applyMarginSpy = jest.spyOn(actionService, 'applyMargin');
    const div = document.createElement('div');
    let element = actionService.applyCommonStylesToBorderElement(div, code);

    //Act
    element = actionService.createInnerBorderElement(code);

    //Assert
    expect(applyMarginSpy).toBeCalledWith(element, ['0', '0', '0', '0']);
  });

  test('that createInnerBorderElement() returns div', () => {
    //Act
    const element = actionService.createInnerBorderElement(12);

    //Assert
    expect(element.tagName).toBe('DIV');
  });

  test('that createGenderButton() calls createOuterBorderElement() with the correct params', () => {
    //Arrange
    const code = 11;
    const createOuterBorderElementSpy = jest.spyOn(actionService, 'createOuterBorderElement');
    const div = document.createElement('div');

    //Act
    actionService.createGenderButton(div, code);

    //Assert
    expect(createOuterBorderElementSpy).toBeCalledWith(code);
  });

  test('that createGenderButton() calls createInnerBorderElement() with the correct params', () => {
    //Arrange
    const code = 12;
    const createInnerBorderElementSpy = jest.spyOn(actionService, 'createInnerBorderElement');
    const div = document.createElement('div');

    //Act
    actionService.createGenderButton(div, code);

    //Assert
    expect(createInnerBorderElementSpy).toBeCalledWith(code);
  });

  test('that createGenderButton() calls createInnerButtonElement() with the correct params', () => {
    //Arrange
    const code = 11;
    const createInnerButtonElementSpy = jest.spyOn(actionService, 'createInnerButtonElement');
    const div = document.createElement('div');

    //Act
    actionService.createGenderButton(div, code);

    //Assert
    expect(createInnerButtonElementSpy).toBeCalledWith(div, code);
  });

  test('that createGenderButton() returns div', () => {
    //Arrange
    const div = document.createElement('div');

    //Act
    const element = actionService.createGenderButton(div, 12);

    //Assert
    expect(element.tagName).toBe('DIV');
    expect(element.children[0].tagName).toBe('DIV');
    expect(element.children[0].children[0].tagName).toBe('DIV');
  });
});
