const express = require("express");
const multer = require("multer");

const {
    getSliderImages,
    uploadSliderImage,
    deleteSliderImage,
} = require("../controllers/sliderImageController");

const router = express.Router();

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
        return callback(
            new Error("Sirf JPG, JPEG, PNG aur WEBP images allowed hain"),
            false
        );
    }

    callback(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 8 * 1024 * 1024,
    },
});

// Public route
router.get("/", getSliderImages);

router.post("/", upload.single("image"), uploadSliderImage);
router.delete("/:id", deleteSliderImage);

// Multer errors
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "Image ka maximum size 8MB ho sakta hai",
            });
        }

        return res.status(400).json({
            message: error.message,
        });
    }

    if (error) {
        return res.status(400).json({
            message: error.message,
        });
    }

    next();
});

module.exports = router;