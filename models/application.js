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
    //'required': true,
    //match: /[a-z]+/
    'enum': ['pending', 'approved', 'denied'],
    'default' : 'pending'
    // 'validate': [ (st) => {
    //     return st && st.length;
    //  }, '{PATH} not empty']
  },
  'thumbnail': {
    'type': String,
    'default' : '/assets/apps/angular.png'
  },
  'platforms': [{
    'type': mongoose.Schema.Types.ObjectId,
    'ref': 'Platform'
  }],
  'owner': {
    'type': mongoose.Schema.Types.ObjectId,
    'ref': 'User'
  },
  'collaborators': [{
    'type': mongoose.Schema.Types.ObjectId,
    'ref': 'User'
  }],
  'versions': [ {} ]
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
