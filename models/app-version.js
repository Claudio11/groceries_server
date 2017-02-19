import mongoose from 'mongoose';

const appVersionSchema = new mongoose.Schema({
  'name': {
    'type': String,
    'required': true
  },
  'manifest': {
    'type': Object
  }
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
appVersionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});


const AppVersion = mongoose.model('AppVersion', appVersionSchema);

export default AppVersion;
