import express from 'express';
const app = express();
import mongoose from 'mongoose';
import routes from './routes';
import bodyParser from 'body-parser';
import annotationsHelper from './helpers/collaboration'
import AppVersionRoom from './helpers/appVersion'


var server = require('http').createServer(app);
var io = require('socket.io')(server);
let connectedUsers = {};

/**
 * Checks if a given annotation is already locked or annotId
 * @param {string} annotId id of the annotation
 */
let generateCollaborationUsersArray = () => {
  let returnArray = [];
  for (var i in connectedUsers) {
    if (connectedUsers.hasOwnProperty(i)) {
      returnArray.push(connectedUsers[i]);
    }
  }
  return returnArray;
}

io.on('connection', function (client) {
  client.join('collaboration');
  client.emit('connected-users', { users: generateCollaborationUsersArray() });
  client.emit('set-id', { clientId: client.id });

  //Join app version room
  client.on('join-app-version-channel', function(room) {
    AppVersionRoom.leaveCurrentRoom(client);
    AppVersionRoom.joinRoom(client, room);
  });

  //Leave app version room
  client.on('leave-app-version-channel', function() {
    AppVersionRoom.leaveCurrentRoom(client);
  })

  // On client move, broadcast to the current app version room.
  client.on('local-mouse-move', function (data) { 
    data.user = connectedUsers[client.id];
    client.broadcast.to(AppVersionRoom.getCurrentRoom(client)).emit('remote-mouse-move', data);
  });

  client.on('disconnect', function (data) {
    let userData = connectedUsers[client.id];
    io.in('collaboration').emit('user-disconnected', userData.socketId ? userData : client.id);
    delete connectedUsers[client.id];
  });

  client.on('user-data', function (data) { // Associates the provided user data to the socket client and stores it in the connected users map
    data.socketId = client.id;
    connectedUsers[client.id] = data;
    client.broadcast.to('collaboration').emit('user-connected', connectedUsers[client.id]);
  });

  annotationsHelper.bindAnnotationsClientEvents(io, client);
});


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use('/uploads', express.static('uploads'))

let uri = '';
if (process.env.NODE_ENV === 'production') {
  uri = process.env.MONGOLAB_URI;
  console.log('===PRODUCTION===');
} else {
  uri = 'mongodb://database/express-boiler';
  console.log('===DEVELOPMENT===');
}

mongoose.Promise = global.Promise;
mongoose.connect(uri, {}, (err) => {
  if (err) {
    console.log('Connection Error: ', err);
  } else {
    console.log('Successfully Connected');
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', routes);

let port = process.env.PORT || 4000;
app.listen(port, '0.0.0.0', () => {
  console.log('Server started at port number: ', port);
});

server.listen(5000, () => {
  console.log('started on port 5000');

});
