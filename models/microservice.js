import mongoose from 'mongoose';

import StreamEvent from './stream-event';

const microservicesSchema = new mongoose.Schema({
  'name': {
    'type': String,
    'required': true
  },
  'description': {
    'type': String
  },
  'repo': {
    'type': String
  },
  'date': {
    'type': String
  }
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
microservicesSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

microservicesSchema.post('save', function(doc, next) {
  let newStreamEvent = new StreamEvent({
                                        type: 4,
                                        name: 'New microservice created',
                                        date: new Date()
                                        });
  newStreamEvent.save(function (err) {
      next();
  });
});


const Microservice = mongoose.model('Microservice', microservicesSchema);

export default Microservice;
