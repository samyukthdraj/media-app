import mongoose, { Schema, model, models } from "mongoose";

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

delete mongoose.models.Project;
export const Project = model("Project", ProjectSchema);

const MediaSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], required: true },
  url: { type: String, required: true },
  thumbnailUrl: { type: String },
  fileKey: { type: String }, // For deleting from Uploadthing
  projectId: { type: Schema.Types.ObjectId, ref: "Project" },
  createdAt: { type: Date, default: Date.now },
});

delete mongoose.models.Media;
export const Media = model("Media", MediaSchema);
