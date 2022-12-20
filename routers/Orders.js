const express = require("express");
const { Order } = require("../models/Order");
const { OrderItem } = require("../models/OrderItem");
const router = express.Router();

// get list of orders, include user name, sort by date(newest to oldest)
router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });
  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

// Get order by ID
router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name") // get user name only
    // .populate("orderItems");
    // .populate({ path: "orderItems", populate: "product" }); // populate product inside array of items
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

// Request product
router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );

  const orderItemsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(
    orderItemsResolved.map(async (orderItemsId) => {
      const orderItem = await OrderItem.findById(orderItemsId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
  console.log(totalPrice);

  let order = new Order({
    orderItems: orderItemsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.country,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });

  order = await order.save();

  if (!order) {
    res.status(404).send("Order could not be created");
  }
  res.send(order);
});

// Update status of order
router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!order) {
    res.status(404).send("Order could not be updated");
  }
  res.send(order);
});

// Delete order
//Deleting Order is not enough, we still have the related order items in the database. Rewrite the "Delete Request" code to make it able to delete also the order items after success of deleting the order
router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      // To delete OrderItems related to the order, first
      // 1. Look at the order
      console.log("order", order);
      //2. Loop through to Find OrderItem by ID and remove
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        res
          .status(200)
          .json({ success: true, message: "Order deleted successfully!" });
      } else {
        res.status(404).json({ success: false, message: "ID not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

// Total sales
router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
  ]);
  if (!totalSales) {
    res.status(400).json("Order sales can't be generated!");
  }
  res.send({ totalSales: totalSales.pop().totalSales });
});

// Total product sales
router.get("/get/count", async (req, res) => {
  const orderCount = await Order.countDocuments();
  if (!orderCount) {
    res.status(500).json({ success: false });
  }
  res.send({ count: orderCount });
});

// get user orders
router.get(`/get/userorders/:userId`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userId })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 });
  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});

module.exports = router;
