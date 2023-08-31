import { io } from 'socket.io-client';
import { events } from '../config/events';
import { socketConfig } from '../config/socket';
import { getTerm, getUserId } from '../helpers';
import { roles } from '../config/roles';

const connectSocket = (serverUrl, actions) => {
  console.log(serverUrl, actions);
  const socket = io.connect(serverUrl, socketConfig);
  socket.on(events.connect, () => {
    socket.emit(events.chatHistory, { user_id: getUserId()});
    actions.onConnect();
  });
  socket.on(events.chatHistory, actions.onHistory);
  socket.on(events.disconnect, () => console.log('Disconnected from socket'));
  socket.on(events.streamStart, actions.onStreamStart);
  socket.on(events.streamData, actions.onStreamData);
  socket.on(events.streamEnd, actions.onStreamEnd);
  // socket.on(events.streamError, actions.onStreamError);

  return socket;
};

export default connectSocket;