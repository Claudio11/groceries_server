import mongoose from 'mongoose';
import User from './user';

const streamEventSchema = new mongoose.Schema({
  'title': {
    'type': String,
    'required': true
  },
  'source': {
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
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
streamEventSchema.virtual('id').get(function () {
  return this._id.toHexString();
});


const StreamEvent = mongoose.model('StreamEvent', streamEventSchema);

export default StreamEvent;
