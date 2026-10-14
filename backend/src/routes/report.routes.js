const express = require("express");

module.exports = (controller, validatePayload) => {
  const router = express.Router();
  router.post("/", validatePayload, controller.create);
  router.get("/", controller.list);
  router.get("/:id", controller.get);
  router.patch("/:id/approve", controller.approve);
  router.post("/:id/verify", controller.verify);
  return router;
};
