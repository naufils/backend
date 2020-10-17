const express = require("express");
const router = express.Router();

const {
  getSubscriptionById,
  createSubscription,
  getSubscription,
  getAllSubscription,
  updateSubscription,
  removeSubscription,
} = require("../controllers/subscription");


//params

router.param("subscriptionId", getSubscriptionById);

//actual routes goes here
router.post(
  "/subscription/create/:userId",
  createSubscription
);

router.get("/subscription/:subscriptionId", getSubscription);
router.get("/subscriptions", getAllSubscription);

//update
router.put(
  "/subscription/:subscriptionId/:userId",
  
  updateSubscription
);

//delete
router.delete(
  "/subscription/:subscriptionId/:userId",
  
  removeSubscription
);

module.exports = router;