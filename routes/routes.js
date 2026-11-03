const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");

router.post("/", controller.createMember);

router.get("/:id", (req, res) => {
  res.send("GET api");
});

router.delete("/:id", (req, res) => {
  res.send("DELETE api");
});
router.patch("/:id", (req, res) => {
  res.send("PATCH api");
});

module.exports = router;
