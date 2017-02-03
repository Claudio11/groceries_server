import mongoose from 'mongoose';

const platformsSchema = new mongoose.Schema({
  'name': {
    'type': String,
    'required': true
  },
  'smallIconSelected': {
    'type': String,
    'required': true
  },
  'largeIconSelected': {
    'type': String,
    'required': true
  },
  'smallIconUnselected': {
    'type': String,
    'required': true
  },
  'largeIconUnselected': {
    'type': String,
    'required': true
  }
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
platformsSchema.virtual('id').get(function () {
  return this._id.toHexString();
});


const Platform = mongoose.model('Platform', platformsSchema);

export default Platform;
