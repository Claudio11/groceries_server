import express from 'express';
const app = express();
import mongoose from 'mongoose';

app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

let uri = '';
if (process.env.NODE_ENV === 'production') {
  uri = process.env.MONGOLAB_URI;
  console.log('===PRODUCTION===');
} else {
  uri = 'localhost:27017/express-boiler';
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

import routes from './routes';

app.use('/api', routes);

let port = process.env.PORT || 4000;
app.listen(port, ()=> {
  console.log('Server started at port number: ', port);
});
