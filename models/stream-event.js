import mongoose from 'mongoose';
import User from './user';

const streamEventSchema = new mongoose.Schema({
  'type': {
    'type': Number,
    'default': 0
  },
  'name': {
    'type': String,
    'required': true
  },
  'user': {
    'type': mongoose.Schema.Types.ObjectId,
    'ref': 'User'
  },
  'date':  {
    'type': Date
  },
  'thumbnail': {
    'type': String
  }
},
{ collection: 'stream-events' },
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
streamEventSchema.virtual('id').get(function () {
  return this._id.toHexString();
});


const StreamEvent = mongoose.model('StreamEvent', streamEventSchema);

export default StreamEvent;
