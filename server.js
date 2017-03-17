import express from 'express';
const app = express();
import mongoose from 'mongoose';
import routes from './routes';
import bodyParser from 'body-parser';
import annotationsHelper from './helpers/collaboration'

var server = require('http').createServer(app);
var io = require('socket.io')(server);
let connectedUsers = {};

io.on('connection', function (client) {

  //Join app version channel
  client.on('join-app-version-channel', function(room) {
    console.log('JOIN ROOM: ', room);
    //Join room channel and set the room for the mouse movement
    client.join(room);

    client.on('local-mouse-move', function (data) { // On client move, broadcast to channel.
      data.user = connectedUsers[client.id];
      client.broadcast.to(room).emit('remote-mouse-move', data);
    });

  });

  annotationsHelper.bindAnnotationsClientEvents(io, client);
  client.join('collaboration');

  //Leave app version channel
  client.on('leave-app-version-channel', function(room) {
    console.log('LEAVE ROOM: ', room);
    //Leave room channel
    client.leave(room);
  })

  client.emit('set-id', { clientId: client.id });

  client.on('user-data', function (data) { // Associates the provided user data to the socket client and stores it in the connected users map
    connectedUsers[client.id] = data;
  });

  client.on('disconnect', function (client) {
    delete connectedUsers[client.id];
  });
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
