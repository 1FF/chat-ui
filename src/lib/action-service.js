import { actionConstants } from './constants/action-constants';

export const actionService = {
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
  handleAction(element, actions) {
    for (let i = 0; i < actions.length; i++) {
      switch (+actions[i]) {
        case 1:
          this.applyBackGroundColor(element, actions[i]);
          this.applyBorderColor(element, actions[i]);
          this.applyTextColor(element, 8);
          break;
        case 2:
          this.applyBackGroundColor(element, actions[i]);
          this.applyBorderColor(element, actions[i]);
          this.applyTextColor(element, 8);
          break;
        case 3:
          this.applyBackGroundColor(element, actions[i]);
          this.applyBorderColor(element, actions[i]);
          this.applyTextColor(element, 8);
          break;
        case 4:
          this.applyBackGroundColor(element, actions[i]);
          this.applyBorderColor(element, actions[i]);
          this.applyTextColor(element, 9);
          break;
        case 5:
          this.applyBackGroundColor(element, actions[i]);
          this.applyBorderColor(element, actions[i]);
          this.applyTextColor(element, 9);
          break;
        case 6:
          this.applyBackGroundColor(element, actions[i]);
          this.applyBorderColor(element, actions[i]);
          this.applyTextColor(element, 9);
          break;
        case 7:
          this.applyBackGroundColor(element, actions[i]);
          this.applyBorderColor(element, actions[i]);
          this.applyTextColor(element, 9);
          break;
        case 8:
          this.applyBackGroundColor(element, actions[i]);
          this.applyBorderColor(element, actions[i]);
          this.applyTextColor(element, 9);
          break;
        case 9:
          this.applyBackGroundColor(element, actions[i]);
          this.applyBorderColor(element, actions[i]);
          this.applyTextColor(element, 8);
          break;
        default:
          break;
      }
    }
  },

  //applies background color to a button.
  applyBackGroundColor(element, code) {
    element.style.backgroundColor = actionConstants.colors[code];
  },

  //applies text color to a button.
  applyTextColor(element, code) {
    element.style.color = actionConstants.colors[code];
  },

  //applies border color to a button.
  applyBorderColor(element, code) {
    element.style.borderColor = actionConstants.colors[code];
  },
};
