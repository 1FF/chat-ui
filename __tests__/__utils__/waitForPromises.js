import { setImmediate } from 'timers';

export const waitForPromises = () => new Promise(setImmediate);
