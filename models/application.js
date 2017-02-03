import mongoose from 'mongoose';

import Platform from './platform';
import User from './user';

const applicationSchema = new mongoose.Schema({
  'name': {
    'type': String,
    'required': true
  },
  'status': {
    'type': String,
    'required': true
  },
  'thumbnail': {
    'type': String,
    'required': false
  },
  'platforms': [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Platform'
  }],
  'owner': {
    'type': mongoose.Schema.Types.ObjectId,
    'ref': 'User'
  }
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

applicationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;
