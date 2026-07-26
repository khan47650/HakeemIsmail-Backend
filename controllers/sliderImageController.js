const SliderImage = require("../models/SliderImage");
const cloudinary = require("../utils/cloudinary");

const uploadBufferToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "hakeem-ismail/slider-images",
                resource_type: "image",
                transformation: [
                    {
                        width: 1920,
                        height: 1080,
                        crop: "limit",
                        quality: "auto",
                        fetch_format: "auto",
                    },
                ],
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );

        uploadStream.end(fileBuffer);
    });
};

// Public: website slider images
exports.getSliderImages = async (req, res) => {
    try {
        const images = await SliderImage.find()
            .sort({ order: 1, createdAt: 1 })
            .lean();

        res.status(200).json(images);
    } catch (error) {
        console.error("Get slider images error:", error);

        res.status(500).json({
            message: "Slider images fetch nahi ho sakin",
        });
    }
};

// Admin: upload new slider image
exports.uploadSliderImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please image select karein",
            });
        }

        const currentImagesCount = await SliderImage.countDocuments();

        if (currentImagesCount >= 10) {
            return res.status(400).json({
                message: "Maximum 10 slider images upload ki ja sakti hain",
            });
        }

        const cloudinaryResult = await uploadBufferToCloudinary(req.file.buffer);

        const lastImage = await SliderImage.findOne()
            .sort({ order: -1 })
            .select("order");

        const newImage = await SliderImage.create({
            imageUrl: cloudinaryResult.secure_url,
            publicId: cloudinaryResult.public_id,
            originalName: req.file.originalname,
            order: lastImage ? lastImage.order + 1 : 0,
        });

        res.status(201).json({
            message: "Slider image successfully upload ho gayi",
            image: newImage,
        });
    } catch (error) {
        console.error("Upload slider image error:", error);

        res.status(500).json({
            message: "Slider image upload nahi ho saki",
        });
    }
};

// Admin: delete slider image
exports.deleteSliderImage = async (req, res) => {
    try {
        const image = await SliderImage.findById(req.params.id);

        if (!image) {
            return res.status(404).json({
                message: "Slider image nahi mili",
            });
        }

        if (image.publicId) {
            try {
                await cloudinary.uploader.destroy(image.publicId);
            } catch (cloudinaryError) {
                console.error("Cloudinary delete error:", cloudinaryError);
            }
        }

        await image.deleteOne();

        res.status(200).json({
            message: "Slider image successfully delete ho gayi",
        });
    } catch (error) {
        console.error("Delete slider image error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid slider image ID",
            });
        }

        res.status(500).json({
            message: "Slider image delete nahi ho saki",
        });
    }
};