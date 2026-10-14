const express = require("express");
const { sanitizeRequest } = require("../middlewares/sanitize.middleware");
const controller = require("../controllers/ai.controller");

const router = express.Router();
router.use(sanitizeRequest);
router.post("/validate", controller.validate);
router.post("/plan", controller.plan);
router.post("/verify", controller.verify);

module.exports = router;
