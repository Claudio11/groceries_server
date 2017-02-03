import mongoose from 'mongoose';

import Application from './application';

const portfolioSchema = new mongoose.Schema({
  'name': {
    'type': String,
    'required': true
  },

  'applications': [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
  }]
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

portfolioSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;
