import mongoose from 'mongoose';

const itemsSchema = new mongoose.Schema({
  'description': {
    'type': String,
    'required': true
  }
});

const Item = mongoose.model('Item', itemsSchema);

export default Item;
