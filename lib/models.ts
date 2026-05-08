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
  displaySize?: "half" | "full" | "quarter";
  caption?: string;
  thumbnailUrl?: string;
  fileKey?: string;
  projectId?: string | IProject; // Can be string ID or populated Project object
  isDesignProcess?: boolean;
  order?: number;
  createdAt?: string; // Using string because of JSON.parse(JSON.stringify())
}

export interface ISettings {
  _id: string;
  key: string;
  value: unknown;
}

export interface ISocialLink {
  platform: string;
  url: string;
  iconUrl?: string;
  displayStyle?: "both" | "name" | "icon";
}

export interface IHomePageSettings {
  name: string;
  bio: string;
  heroImageUrl: string;
  socialLinks: ISocialLink[];
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
  displaySize: { type: String, enum: ["half", "full", "quarter"], default: "half" },
  caption: { type: String },
  thumbnailUrl: { type: String },
  fileKey: { type: String }, // For deleting from Uploadthing
  projectId: { type: Schema.Types.ObjectId, ref: "Project" },
  isDesignProcess: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

delete mongoose.models.Media;
export const Media = model("Media", MediaSchema);

const SettingsSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
});

delete mongoose.models.Settings;
export const Settings = model("Settings", SettingsSchema);

