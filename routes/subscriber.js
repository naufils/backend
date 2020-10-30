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
    },
    plan_purchased:{
        type: Boolean,
        default: false
    },
    videos_watched:{
        type:Number,
        default:0
    }
  });

  module.exports = mongoose.model("Subscriber", subscriberSchema);
