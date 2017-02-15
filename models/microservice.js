import mongoose from 'mongoose';

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
  }
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
microservicesSchema.virtual('id').get(function () {
  return this._id.toHexString();
});


const Microservice = mongoose.model('Microservice', microservicesSchema);

export default Microservice;
