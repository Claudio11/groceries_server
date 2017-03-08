import mongoose from 'mongoose';

import Application from './application';
import StreamEvent from './stream-event';

const portfolioSchema = new mongoose.Schema({
  'name': {
    'type': String,
    'required': true
  },

  'applications': [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
  }],

  'owner': {
    'type': mongoose.Schema.Types.ObjectId,
    'ref': 'User'
  },
  
  'thumbnail': {
    'type': String
  }
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

portfolioSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// portfolioSchema.post('findOne', function(error, doc, next) {
//   console.dir(error);
//   if (error) {
//       if (error.kind === 'ObjectId') {
//           next({data: {message: 'Record does not have a correct object id'}});
//       } else {
//           next(error);
//       }
//   }
//   else {
//       next(doc);
//   }
// });

portfolioSchema.post('save', function(doc, next) {
  let newStreamEvent = new StreamEvent({
                                        type: 4,
                                        name: 'New portfolio created',
                                        date: new Date()
                                        });
  newStreamEvent.save(function (err) {
      next();
  });
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;
