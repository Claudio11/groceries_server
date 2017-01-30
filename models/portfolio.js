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
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;
