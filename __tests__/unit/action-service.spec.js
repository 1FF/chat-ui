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
    expect(applyBackGroundColorSpy).toBeCalledWith(div, answer.actions[0]);
  });

  test('that handleAction() calls applyBorderColor() with the correct params', () => {
    //Arrange
    const applyBorderColorSpy = jest.spyOn(actionService, 'applyBorderColor');

    //Act
    const div = document.createElement('div');
    const answer = { content: 'Yes', actions: ['3'] };

    actionService.handleAction(div, answer.actions);

    //Assert
    expect(applyBorderColorSpy).toBeCalledWith(div, answer.actions[0]);
  });

  test('that handleAction() calls applyTextColor() with the correct params (div, 1)', () => {
    //Arrange
    const applyTextColorSpy = jest.spyOn(actionService, 'applyTextColor');

    //Act
    const div = document.createElement('div');
    const answer = { content: 'Yes', actions: ['2'] };

    actionService.handleAction(div, answer.actions);

    //Assert
    expect(applyTextColorSpy).toBeCalledWith(div, 8);
  });

  test('that handleAction() calls applyTextColor() with the correct params (div, 2)', () => {
    //Arrange
    const applyTextColorSpy = jest.spyOn(actionService, 'applyTextColor');

    //Act
    const div = document.createElement('div');
    const answer = { content: 'Yes', actions: ['4'] };

    actionService.handleAction(div, answer.actions);

    //Assert
    expect(applyTextColorSpy).toBeCalledWith(div, 9);
  });

  test('that handleAction() calls applyBackgroundColor(), applyBorderColor(), applyTextColor() 3 times each', () => {
    //Arrange
    const applyBackGroundColorSpy = jest.spyOn(actionService, 'applyBackGroundColor');
    const applyBorderColorSpy = jest.spyOn(actionService, 'applyBorderColor');
    const applyTextColorSpy = jest.spyOn(actionService, 'applyTextColor');

    //Act
    const div = document.createElement('div');
    const answer = { content: 'Yes', actions: ['1', '2', '3'] };

    actionService.handleAction(div, answer.actions);

    //Assert
    expect(applyBackGroundColorSpy).toBeCalledTimes(3);
    expect(applyBorderColorSpy).toBeCalledTimes(3);
    expect(applyTextColorSpy).toBeCalledTimes(3);
  });

  test('that applyBackgroundColor() applies red background color for code = 1', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 1);

    //Assert
    expect(div.style.backgroundColor).toBe('red');
  });

  test('that applyBackgroundColor() applies green background color for code = 2', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 2);

    //Assert
    expect(div.style.backgroundColor).toBe('green');
  });

  test('that applyBackgroundColor() applies blue background colorfor code = 3', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 3);

    //Assert
    expect(div.style.backgroundColor).toBe('blue');
  });

  test('that applyBackgroundColor() applies orange background color for code = 4', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 4);

    //Assert
    expect(div.style.backgroundColor).toBe('orange');
  });

  test('that applyBackgroundColor() applies yellow background color for code = 5', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 5);

    //Assert
    expect(div.style.backgroundColor).toBe('yellow');
  });

  test('that applyBackgroundColor() applies purple background color for code = 6', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 6);

    //Assert
    expect(div.style.backgroundColor).toBe('purple');
  });

  test('that applyBackgroundColor() applies pink background color for code = 7', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 7);

    //Assert
    expect(div.style.backgroundColor).toBe('pink');
  });

  test('that applyBackgroundColor() applies white background color for code = 8', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 8);

    //Assert
    expect(div.style.backgroundColor).toBe('white');
  });

  test('that applyBackgroundColor() applies black background color for code = 9', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBackGroundColor(div, 9);

    //Assert
    expect(div.style.backgroundColor).toBe('black');
  });

  test('that applyBorderColor() applies red border color for code = 1', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBorderColor(div, 1);

    //Assert
    expect(div.style.borderColor).toBe('red');
  });

  test('that applyBorderColor() applies green border color for code = 2', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBorderColor(div, 2);

    //Assert
    expect(div.style.borderColor).toBe('green');
  });

  test('that applyBorderColor() applies blue border color for code = 3', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBorderColor(div, 3);

    //Assert
    expect(div.style.borderColor).toBe('blue');
  });

  test('that applyBorderColor() applies orange border color for code = 4', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBorderColor(div, 4);

    //Assert
    expect(div.style.borderColor).toBe('orange');
  });

  test('that applyBorderColor() applies yellow border color for code = 5', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBorderColor(div, 5);

    //Assert
    expect(div.style.borderColor).toBe('yellow');
  });

  test('that applyBorderColor() applies purple border color for code = 6', () => {
    //Arange
    const div = document.createElement('div');

    //Arangeborder
    actionService.applyBorderColor(div, 6);

    //Assert
    expect(div.style.borderColor).toBe('purple');
  });

  test('that applyBorderColor() applies pink border color for code = 7', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBorderColor(div, 7);

    //Assert
    expect(div.style.borderColor).toBe('pink');
  });

  test('that applyBorderColor() applies white border color for code = 8', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBorderColor(div, 8);

    //Assert
    expect(div.style.borderColor).toBe('white');
  });

  test('that applyBorderColor() applies black border color for code = 9', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyBorderColor(div, 9);

    //Assert
    expect(div.style.borderColor).toBe('black');
  });

  test('that applyTextColor() applies white text color for code = 8', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyTextColor(div, 8);

    //Assert
    expect(div.style.color).toBe('white');
  });

  test('that applyTextColor() applies black text color for code = 9', () => {
    //Arange
    const div = document.createElement('div');

    //Act
    actionService.applyTextColor(div, 9);

    //Assert
    expect(div.style.color).toBe('black');
  });
});
