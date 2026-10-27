const express = require("express");

module.exports = (controller, validatePayload) => {
  const router = express.Router();
  router.post("/", validatePayload, controller.create);
  router.get("/", controller.list);
  router.delete("/duplicates/:duplicateId", controller.deleteDuplicate);
  router.get("/:id", controller.get);
  router.delete("/:id", controller.delete);
  router.patch("/:id/approve", controller.approve);
  router.post("/:id/verify", controller.verify);
  return router;
};
