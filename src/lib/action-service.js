import { getAnswerConfig } from './helpers';
import ChatUi from './chat-ui';
import { getFemaleSvg, getMaleSvg } from './chat-widgets';

export const actionService = {
  dom: {
    buttonsWrapper: document.createElement('div'),
  },

  ACTION_CODE_REGEX: /#([0-9]+)#/g, //matches #2# or any integer number between the hashtag (#).
  CLEAR_ACTION_CODE_REGEX: /(#+\d+#+)|(#+\d+)|(\d+#+)|(#+)/gm, //matches #2#, #, ##, #3, 3#, ##3, 4##, ##999###.

  //extracts all action codes for each button, stores them into an array and returns them.
  getActionCodes(text, regex) {
    let match;
    let matches = [];

    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }

    return matches;
  },

  //clears all action codes, and action codes segments, from the buttons, that are not in the initial message.
  clearButtonCodes(text) {
    const clearedText = text.replace(this.CLEAR_ACTION_CODE_REGEX, '');
    return clearedText;
  },

  //applies actions for each button depending on the action codes it has.
  handleAction(element, actions, answersContainer) {
    for (let i = 0; i < actions.length; i++) {
      const code = +actions[i];

      switch (code) {
        case 1:
          this.applyBackGroundColor(element, 'red');
          this.applyBorder(element, ['1px', 'solid', 'red', '20px']);
          this.applyFont(element, ['white', '1rem', 'normal']);
          break;
        case 2:
          this.applyBackGroundColor(element, 'green');
          this.applyBorder(element, ['1px', 'solid', 'green', '20px']);
          this.applyFont(element, ['white', '1rem', 'normal']);
          break;
        case 3:
          this.applyBackGroundColor(element, 'blue');
          this.applyBorder(element, ['1px', 'solid', 'blue', '20px']);
          this.applyFont(element, ['white', '1rem', 'normal']);
          break;
        case 4:
          this.applyBackGroundColor(element, 'orange');
          this.applyBorder(element, ['1px', 'solid', 'orange', '20px']);
          this.applyFont(element, ['black', '1rem', 'normal']);
          break;
        case 5:
          this.applyBackGroundColor(element, 'yellow');
          this.applyBorder(element, ['1px', 'solid', 'yellow', '20px']);
          this.applyFont(element, ['black', '1rem', 'normal']);
          break;
        case 6:
          this.applyBackGroundColor(element, 'purple');
          this.applyBorder(element, ['1px', 'solid', 'purple', '20px']);
          this.applyFont(element, ['black', '1rem', 'normal']);
          break;
        case 7:
          this.applyBackGroundColor(element, 'pink');
          this.applyBorder(element, ['1px', 'solid', 'pink', '20px']);
          this.applyFont(element, ['black', '1rem', 'normal']);
          break;
        case 8:
          this.applyBackGroundColor(element, 'white');
          this.applyBorder(element, ['1px', 'solid', 'white', '20px']);
          this.applyFont(element, ['black', '1rem', 'normal']);
          break;
        case 9:
          this.applyBackGroundColor(element, 'black');
          this.applyBorder(element, ['1px', 'solid', 'black', '20px']);
          this.applyFont(element, ['white', '1rem', 'normal']);
          break;
        case 10:
          this.moveButtons(answersContainer, element, actions[i]);
          break;
        case 11:
          element = this.createGenderButton(element, code);
          break;
        case 12:
          element = this.createGenderButton(element, code);
          break;
      }
    }

    return element;
  },

  applyBackGroundColor(element, color) {
    element.style.backgroundColor = color;
  },

  applyFont(element, arr) {
    element.style.color = arr[0];
    element.style.fontSize = arr[1];
    element.style.fontWeight = arr[2];
  },

  applyBorder(element, arr) {
    element.style.borderWidth = arr[0];
    element.style.borderStyle = arr[1];
    element.style.borderColor = arr[2];
    element.style.borderRadius = arr[3];
  },

  moveButtons(answersContainer) {
    const answerConfig = getAnswerConfig(ChatUi.answersFromStream);
    const btnContainer = document.getElementById('container');
    this.dom.buttonsWrapper.classList.add('initial-buttons-container');
    this.dom.buttonsWrapper.appendChild(answersContainer);
    btnContainer.appendChild(this.dom.buttonsWrapper);

    if ([...answerConfig.list].length <= 2) {
      answersContainer.classList.add('btn-group');
    }
  },

  applyBackGroundImage(element, image) {
    element.style.backgroundImage = image;
  },

  applyMargin(element, arr) {
    element.style.marginTop = arr[0];
    element.style.marginRight = arr[1];
    element.style.marginBottom = arr[2];
    element.style.marginLeft = arr[3];
  },

  applyPadding(element, arr) {
    element.style.paddingTop = arr[0];
    element.style.paddingRight = arr[1];
    element.style.paddingBottom = arr[2];
    element.style.paddingLeft = arr[3];
  },

  applyFlexbox(element, arr) {
    element.style.display = arr[0];
    element.style.flexDirection = arr[1];
    element.style.justifyContent = arr[2];
    element.style.alignItems = arr[3];
  },

  //creates the whole gender button componentwith all the concentric borders
  createGenderButton(element, code) {
    const outerBorderElement = this.createOuterBorderElement(code);
    const innerBorderElement = this.createInnerBorderElement(code);
    const innerButtonElement = this.createInnerButtonElement(element, code);

    innerBorderElement.appendChild(innerButtonElement);
    outerBorderElement.appendChild(innerBorderElement);

    return outerBorderElement;
  },

  //applies all the common styles to the border elements
  applyCommonStylesToBorderElement(element, code) {
    this.applyPadding(element, ['0.625rem', '0.625rem', '0.625rem', '0.625rem']);
    this.applyBackGroundColor(element, 'unset');
    this.applyBorder(element, ['0', 'unset', 'unset', '6.25rem']);

    if (code === 11) {
      this.applyBackGroundImage(
        element,
        'linear-gradient(to right, rgba(99, 82, 197, 0.1) 0%, rgba(99, 82, 197, 0.1))',
      );
    } else {
      this.applyBackGroundImage(
        element,
        'linear-gradient(to right, rgba(245, 51, 115, 0.1) 0%, rgba(245, 51, 115, 0.1) 100%, rgba(245, 51, 115, 0.1) 100%)',
      );
    }

    return element;
  },

  //creates the outer border element for the gender button
  createOuterBorderElement(code) {
    const element = document.createElement('div');
    const outerBorderElement = this.applyCommonStylesToBorderElement(element, code);
    this.applyMargin(outerBorderElement, ['0', '0', '10px', '0']);
    return outerBorderElement;
  },

  //creates the inner border element for the gender button
  createInnerBorderElement(code) {
    const element = document.createElement('div');
    const outerBorderElement = this.applyCommonStylesToBorderElement(element, code);
    this.applyMargin(outerBorderElement, ['0', '0', '0', '0']);
    return outerBorderElement;
  },

  //creates the gender button itself and adds the gender svg to it.
  createInnerButtonElement(element, code) {
    this.applyBorder(element, ['0', 'unset', 'unset', '6.25rem']);
    this.applyFlexbox(element, ['flex', 'row-reverse', 'center', 'center']);
    this.applyMargin(element, ['0', '0', '0', '0']);
    this.applyFont(element, ['white', '1rem', 'bold']);

    if (code === 11) {
      element.innerHTML += getMaleSvg();
      this.applyBackGroundImage(element, 'linear-gradient(to right, #6352c5 0%, #6352c5 100%, #6352c5 100%)');
    } else {
      element.innerHTML += getFemaleSvg();
      this.applyBackGroundImage(element, 'linear-gradient(to right, #f53373 0%, #f53373 100%, #f53373 100%)');
    }

    return element;
  },
};
