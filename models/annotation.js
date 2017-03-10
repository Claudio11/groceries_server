import mongoose from 'mongoose';

const annotationSchema = new mongoose.Schema({
  'body': {
    'type': String,
    'required': true
  },

  'position': {
      type: Object
  },

  'author': {
    'type': mongoose.Schema.Types.ObjectId,
    'ref': 'User'
  },

  'createdDate': {
    'type': Date
  }
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

annotationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const Annotation = mongoose.model('Annotation', annotationSchema);

export default Annotation;
