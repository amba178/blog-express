const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    validate: [function(value) {return value.length<=120}, 'Title is too long (120 max)'],
    default: 'New Post'
  },
  text: String,
  published: {
    type: Boolean,
    default: false
  },
  slug: {
    type: String,
    set: function(value){return value.toLowerCase().replace(' ', '-')}
  }
});

//example of instance methodd

/* 
  bookSchema.method({
  buy: function(quantity, customer, callback){
    let bookToPurchase = this
    //create a purchase order and invoice customer
    return callback(resutls)
  refund: function(customer, callback){
    //process the refund
    return callback(results)
  }
  }
  })
*/

//static method(class method)
articleSchema.static({
  list: function(callback){
    this.find({}, null, {sort: {_id:-1}}, callback);
  }
})
module.exports = mongoose.model('Article', articleSchema);