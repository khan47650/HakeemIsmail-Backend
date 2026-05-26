const router = require("express").Router();

const {
    createVideo,
    getVideos,
    updateVideo,
    deleteVideo,
} = require("../controllers/videoController");

router.get("/", getVideos);
router.post("/", createVideo);
router.put("/:id", updateVideo);
router.delete("/:id", deleteVideo);

module.exports = router;