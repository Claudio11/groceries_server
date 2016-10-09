import express from 'express';
const app = express();
import mongoose from 'mongoose';

let uri = '';
if (process.env.NODE_ENV === 'production') {
  uri = process.env.MONGOLAB_URI;
  console.log('===PRODUCTION===');
} else {
  uri = '127.0.0.1/express-boiler';
  console.log('===DEVELOPMENT===');
}

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
