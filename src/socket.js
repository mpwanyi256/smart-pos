import openSocket from 'socket.io-client';

let socket;

export default {
  init: (ServerIPAddress) => {
    socket = openSocket(`${ServerIPAddress}:3000/`, {
      extraHeaders: {
        'Access-Control-Allow-Origin': '*',
      },
    });

    return socket;
  },
  getSocket: () => {
    if (!socket) {
      throw new Error('Socket io not initialised');
    }
    return socket;
  },
};
