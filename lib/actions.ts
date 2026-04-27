"use server";

import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { connectToDB } from "./db";
import { Media, Project } from "./models";
import { UTApi } from "uploadthing/server";
import { fetchYouTubeMetadata } from "../utils/youtube";

export async function createProjectAction(name: string) {
  try {
    await connectToDB();
    const newProject = new Project({ name });
    await newProject.save();
    revalidatePath("/admin");
    return { success: true, data: JSON.parse(JSON.stringify(newProject)) };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to create project" };
  }
}

export async function getProjectsAction() {
  try {
    await connectToDB();
    const projects = await Project.find().sort({ createdAt: -1 });
    return { success: true, data: JSON.parse(JSON.stringify(projects)) };
  } catch {
    return { success: false, error: "Failed to fetch projects" };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    await connectToDB();
    
    // Also delete all media associated with this project from DB
    // (Note: Physical file deletion from UploadThing should also be handled ideally, 
    // but for now we delete DB records to maintain hierarchy integrity)
    await Media.deleteMany({ projectId: id });
    await Project.findByIdAndDelete(id);
    
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete project" };
  }
}

export async function renameProjectAction(id: string, newName: string) {
  try {
    await connectToDB();
    await Project.findByIdAndUpdate(id, { name: newName });
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to rename project" };
  }
}

export async function saveMediaAction(data: {
  title: string;
  type: "image" | "video";
  url: string;
  projectId?: string;
  fileKey?: string;
  thumbnailUrl?: string;
}) {
  try {
    await connectToDB();

    let finalTitle = data.title;
    let finalThumbnail = data.thumbnailUrl;

    if (data.type === "video") {
      const meta = await fetchYouTubeMetadata(data.url);
      if (meta) {
        finalTitle = meta.title;
        finalThumbnail = meta.thumbnailUrl;
      }
    }

    const newMedia = new Media({
      title: finalTitle,
      type: data.type,
      url: data.url,
      projectId: data.projectId,
      thumbnailUrl: finalThumbnail,
      fileKey: data.fileKey,
    });

    await newMedia.save();

    // Refresh the landing page data cache
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to save to database" };
  }
}

export async function getAdminMediaAction() {
  noStore();
  try {
    await connectToDB();
    const media = await Media.find().populate("projectId").sort({ createdAt: -1 });
    return { success: true, data: JSON.parse(JSON.stringify(media)) };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch media." };
  }
}

export async function deleteMediaAction(id: string) {
  try {
    await connectToDB();
    const media = await Media.findById(id);
    if (!media) {
      return { success: false, error: "Media not found" };
    }

    if (media.type === "image" && media.fileKey) {
      const utapi = new UTApi();
      await utapi.deleteFiles(media.fileKey);
    }

    const deleted = await Media.findByIdAndDelete(id);
    console.log("Deletion result:", deleted ? "Success" : "Failed (Not found)");

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to delete from database" };
  }
}
