var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

var subscriberSchema = new mongoose.Schema({
    name: {
      type: String,
      maxlength: 150,
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
        type: Number
    },
    plan:{
        type: String,
        ref: "Subscription",
    }
  });

  module.exports = mongoose.model("Subscriber", subscriberSchema);
