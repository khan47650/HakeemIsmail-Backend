const mongoose = require("mongoose");

const sliderImageSchema = new mongoose.Schema(
    {
        imageUrl: {
            type: String,
            required: true,
            trim: true,
        },
        publicId: {
            type: String,
            required: true,
            trim: true,
        },
        originalName: {
            type: String,
            default: "",
            trim: true,
        },
        order: {
            type: Number,
            default: 0,
        },

        isMobile: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("SliderImage", sliderImageSchema);