const Model = require("../model/model");

module.exports.createMember = async (req, res) => {
  try {
    const member = await Model.create(req.body);
    return res.status(201).json(member);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.getMember = async (req, res) => {
  try {
    const member = await Model.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });
    return res.status(200).json(member);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports.updateMember = async (req, res) => {
  try {
    const member = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!member) return res.status(404).json({ message: "Member not found" });
    return res.status(200).json(member);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.deleteMember = async (req, res) => {
  try {
    const member = await Model.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });
    return res.status(200).json(member);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};