const router = require("express").Router();

const {
    createVideo,
    getVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
} = require("../controllers/videoController");

router.get("/", getVideos);
router.get("/:id", getVideoById);
router.post("/", createVideo);
router.put("/:id", updateVideo);
router.delete("/:id", deleteVideo);

module.exports = router;