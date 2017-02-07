import mongoose from 'mongoose';

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

  'firstName': {
    'type': String,
    'required': false
  },

  'lastName': {
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
  }

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

const User = mongoose.model('User', userSchema);

export default User;
