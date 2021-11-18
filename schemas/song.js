import mongoose from "mongoose";

export const songSchema = new mongoose.Schema({
    _id: String,
    albumId: String,
    albumOrder: Number,
    titleNat: String,
    titleRom: String,
    artists: [String],
    length: Number,
    isInstrumental: Boolean,
    isRadioDrama: Boolean
})
