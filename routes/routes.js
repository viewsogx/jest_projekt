const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");

router.post("/", controller.createMember);
router.get("/:id", controller.getMember);
router.patch("/:id", controller.updateMember);
router.delete("/:id", controller.deleteMember);
module.exports = router;
