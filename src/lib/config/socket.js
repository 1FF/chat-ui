export const socketConfig = {
  transports: ['polling', 'websocket'],
  upgrade: true,
  pingInterval: 1000 * 60 * 5,
  pingTimeout: 1000 * 60 * 3,
  secure: true,
  reconnect: true,
  withCredentials: true,
};
