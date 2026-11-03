const Model = require("../model/model");

module.exports.createMember = async (req, res) => {
  try {
    const newMember = await Model.create(req.body);
    res.status(201).json(newMember);
  } catch (e) {
    console.error(e);
    res.status(500);
  }
};
