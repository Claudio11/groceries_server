import express from 'express';
const app = express();
import mongoose from 'mongoose';
import routes from './routes';
import bodyParser from 'body-parser';

var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function(client){
  console.log(client.id)

  client.join('collaboration');
  client.emit('set-id', { clientId: client.id });

  client.on('local-mouse-move', function (data) { // On client move, broadcast to channel.
    client.broadcast.to('collaboration').emit('remote-mouse-move', data);
  });

  client.on('disconnect', function(client){
    client.broadcast.to('collaboration').emit('client-disconnected', {clientId: client.id});
  });
});


app.use( (req, res, next) => {
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
mongoose.connect(uri, {}, (err)=> {
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
