import mongoose, { Schema, model, models } from "mongoose";

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  thumbnailUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

delete mongoose.models.Project;
export const Project = model("Project", ProjectSchema);

const MediaSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["image", "video", "text-image"], required: true },
  url: { type: String },
  textContent: { type: String },
  imageAlignment: { type: String, enum: ["left", "right"], default: "left" },
  thumbnailUrl: { type: String },
  fileKey: { type: String }, // For deleting from Uploadthing
  projectId: { type: Schema.Types.ObjectId, ref: "Project" },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

delete mongoose.models.Media;
export const Media = model("Media", MediaSchema);
