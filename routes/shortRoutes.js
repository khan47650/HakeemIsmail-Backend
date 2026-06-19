const router = require("express").Router();

const {
  createShort,
  getShorts,
  getShortById,
  updateShort,
  deleteShort,
} = require("../controllers/shortController");

router.get("/", getShorts);
router.get("/:id", getShortById);
router.post("/", createShort);
router.put("/:id", updateShort);
router.delete("/:id", deleteShort);

module.exports = router;