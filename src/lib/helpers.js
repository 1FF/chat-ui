const REGEX_URL = /\b((?:https?:\/\/|www\.)[^\s/$.?#][^\s{}\[\]()<>]*)\b/gi;

/**
 * Generates a random integer between the specified range (inclusive).
 *
 * @param {number} from - The starting value of the range.
 * @param {number} to - The ending value of the range.
 * @returns {number} The random integer generated.
 */
export function getRandomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

/**
 * Formats a date string according to the locale, including the date and time.
 *
 * @param {string} dateString - The date string to be formatted.
 * @returns {string} - The formatted date and time string.
 */
export function formatDateByLocale(dateString) {
  const date = new Date(dateString);

  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  const formattedDate = date.toLocaleDateString(undefined, options);

  return `${formattedDate}`.toUpperCase();
}

function hasQueryParams(url) {
  // Regular expression pattern to match query parameters
  const pattern = /[?&]([^=#]+)=([^&#]*)/g;

  // Check if the pattern matches any query parameters
  return pattern.test(url);
}

/**
 * Extracts a link from a given string.
 *
 * @param {string} string - The input string from which the link will be extracted.
 * @returns {string} The extracted link, or an empty string if no link is found.
 */
export function constructLink(string) {
  const userId = getUserId();
  let search = '';

  if (window.location.search) {
    search = new URLSearchParams(window.location.search);

    search.delete('utm_chat');
    search.append('cid', userId);
    search = '/?' + search;
  }

  const hasQuery = hasQueryParams(string);

  // Extract the link from the string
  const matches = string.match(REGEX_URL);
  const link = matches ? matches[0] : '';

  if (!link) {
    return false;
  }

  if (hasQuery) {
    return link;
  }

  return link + search;
}

export function replaceLinksWithAnchors(text) {
  // this pattern will exclude {https://test.test.test} any of those symbols {}[]()<> at the end of the link
  const pattern = /((?:https?:\/\/|www\.)[^\s/$.?#].[^\s{}\[\]()<>]*)/gi;

  const link = text.replace(pattern, match => {
    const urlWithParams = constructLink(match);
    return `<a class="underline" href="${urlWithParams}">${match}</a>`;
  });

  return link;
}

export const getUserId = () => {
  return localStorage.getItem('__cid');
};

export const initializeAddClassMethod = () => {
  if (!Element.prototype.hasOwnProperty('addClass')) {
    Element.prototype.addClass = function (className) {
      if (!this.classList.contains(className)) {
        this.classList.add(className);
      }
    };
  }
};

export const extractStringWithBrackets = (message) => {
  const regex = /\[(.*?)\]/; // Matches the string inside square brackets
  const match = regex.exec(message);

  if (match && match.length > 1) {
    const extractedString = match[1];
    const updatedMessage = message.replace(match[0], '');

    return {
      extractedString,
      updatedMessage
    };
  }

  // No brackets found, return original message
  return {
    extractedString: '',
    updatedMessage: message
  };
}

export const getAnswerConfig = (output) => {
  const optionsString = output.replace(/\[|\]/g, '')
  const choicesArray = optionsString.split('|');
  const config = { answersType: 'singleChoice', list: [] };
  choicesArray.forEach(option => {
    const optionConfig = { content: '' };
    optionConfig.content = option.trim();
    config.list.push(optionConfig)
  });
  return config;
}

/**
 * Retrieves the value of the 'utm_chat' parameter from the current URL.
 *
 * @returns {string|null} The value of the 'utm_chat' parameter, or null if it is not present.
 */
export const getTerm = () => {
  const url = window.location.search;
  const urlParams = new URLSearchParams(url);

  return urlParams.get('utm_chat');
};

/**
 * Replaces the string in curly brackets with a string wrapped in <strong> tags.
 *
 * @function replaceStringInCurlyBracketsWithStrong
 * @param {string} input - The input string to process.
 * @returns {string} The modified string with replaced content.
 */
export function replaceStringInCurlyBracketsWithStrong(input) {
  return input.replace(/\{([^}]+)\}/g, '<strong>$1</strong>');
}

/**
 * Checks if 24 hours have passed since the given date.
 *
 * @function isExpired
 * @param {string} date - The date to compare in ISO 8601 format (e.g., "2023-07-04T14:11:00.097Z").
 * @returns {boolean} Returns true if 24 hours have passed since the given date, or false otherwise.
 */
export function isExpired(date, maxHours = 24) {
  const currentDate = new Date();
  const givenDate = new Date(date);
  const elapsedMilliseconds = currentDate - givenDate;
  const elapsedHours = elapsedMilliseconds / (1000 * 60 * 60); // Convert milliseconds to hours

  return elapsedHours >= maxHours;
}