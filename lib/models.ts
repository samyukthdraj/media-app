import mongoose, { Schema, model } from "mongoose";

export interface IProject {
  _id: string;
  name: string;
  thumbnailUrl?: string;
  createdAt?: string; // Using string because of JSON.parse(JSON.stringify())
}

export interface IMedia {
  _id: string;
  title: string;
  type: "image" | "video" | "text-image";
  url?: string;
  textContent?: string;
  imageAlignment?: "left" | "right";
  thumbnailUrl?: string;
  fileKey?: string;
  projectId?: string | IProject; // Can be string ID or populated Project object
  order?: number;
  createdAt?: string; // Using string because of JSON.parse(JSON.stringify())
}

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

