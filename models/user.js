import mongoose from 'mongoose';

import StreamEvent from './stream-event';

const userSchema = new mongoose.Schema({
  'name': {
    'type': String,
    'required': true
  },

  'email': {
    'type': String,
    'unique': true,
    'required': true
  },

  'password': {
    'type': String,
    'required': true
  },

  'name': {
    'type': String,
    'required': false
  },

  'avatar': {
    'type': String,
    'required': false
  },

  'isAdmin': {
    'type': Boolean,
    'required': true
  },

  'role': {
    'type': String,
    'required': false  // TODO: True?
  }
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

userSchema.post('save', function(doc, next) {
  let newStreamEvent = new StreamEvent({
                                        type: 4,
                                        name: 'New user created',
                                        date: new Date()
                                        });
  newStreamEvent.save(function (err) {
      next();
  });
});

const User = mongoose.model('User', userSchema);

export default User;
