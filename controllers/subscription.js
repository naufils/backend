const Subscription = require("../models/subscription");

exports.createSubscription = (req,res) => {
    const subscription = new Subscription(req.body);
  subscription.save((err, subscription) => {
    if (err) {
      return res.status(400).json({
        error: `Couldn't save ${subscription} in the DB`,
      });
    }
    res.json({ subscription });
  });
}

exports.getSubscriptionById = (req,res, next, id) => {
    Subscription.findById(id).exec((err, subscription) => {
        if (err) {
          return res.status(400).json({
            error: "Such subscription is not found in the DB",
          });
        }
        req.subscription = subscription;
        next();
      });
}

exports.getSubscription = (req,res) => {
//
}

exports.getAllSubscription = (req,res) => {
//
}

exports.updateSubscription = (req,res) => {
//
}


exports.removeSubscription = (req,res) => {
//
}