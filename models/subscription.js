var mongoose = require("mongoose");

var subscriptionSchema = new mongoose.Schema({
    name: {
      type: String,
      maxlength: 75,
    },
    price: {
      type: Number,
      default: 0,
    },
    duration: {
        type: Number
    },
  });
  
  module.exports = mongoose.model("Subscription", subscriptionSchema);
  