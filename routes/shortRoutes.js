const router = require("express").Router();

const {
  createShort,
  getShorts,
  updateShort,
  deleteShort,
} = require("../controllers/shortController");

router.get("/", getShorts);
router.post("/", createShort);
router.put("/:id", updateShort);
router.delete("/:id", deleteShort);

module.exports = router;