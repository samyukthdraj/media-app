"use server";

import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { connectToDB } from "./db";
import { Media, Project } from "./models";
import { UTApi } from "uploadthing/server";
import { fetchYouTubeMetadata } from "../utils/youtube";

export async function createProjectAction(name: string, thumbnailUrl?: string) {
  try {
    await connectToDB();
    const newProject = new Project({ name, thumbnailUrl });
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
  _id?: string;
  title: string;
  type: "image" | "video" | "text-image";
  url?: string;
  projectId?: string;
  fileKey?: string;
  thumbnailUrl?: string;
  textContent?: string;
  imageAlignment?: "left" | "right";
}) {
  try {
    await connectToDB();

    let finalTitle = data.title;
    let finalThumbnail = data.thumbnailUrl;

    if (data.type === "video" && data.url) {
      const meta = await fetchYouTubeMetadata(data.url);
      if (meta) {
        finalTitle = meta.title;
        finalThumbnail = meta.thumbnailUrl;
      }
    }

    if (data._id) {
      // Update existing media
      await Media.findByIdAndUpdate(data._id, {
        title: finalTitle,
        url: data.url,
        thumbnailUrl: finalThumbnail,
        textContent: data.textContent,
        imageAlignment: data.imageAlignment || "left",
      });
    } else {
      // Create new media
      const lastMedia = await Media.findOne({ projectId: data.projectId }).sort({ order: -1 });
      const nextOrder = lastMedia ? (lastMedia.order || 0) + 1 : 0;

      const newMedia = new Media({
        title: finalTitle,
        type: data.type,
        url: data.url,
        projectId: data.projectId,
        thumbnailUrl: finalThumbnail,
        fileKey: data.fileKey,
        textContent: data.textContent,
        imageAlignment: data.imageAlignment || "left",
        order: nextOrder,
      });

      await newMedia.save();
    }

    // Refresh the landing page data cache
    revalidatePath("/");
    revalidatePath("/admin");

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
    const media = await Media.find().populate("projectId").sort({ order: 1, createdAt: -1 });
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

export async function getPublicGalleryAction() {
  noStore();
  try {
    await connectToDB();
    const projects = await Project.find().lean();
    const media = await Media.find().lean();
    
    // Sort projects by latest media item
    const projectsWithLatestMedia = projects.map(p => {
      const projectMedia = media.filter(m => m.projectId?.toString() === p._id.toString());
      const latestMedia = projectMedia.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0];
      return {
        ...p,
        latestMediaDate: latestMedia ? latestMedia.createdAt : p.createdAt
      };
    });

    const sortedProjects = projectsWithLatestMedia.sort((a, b) => new Date(b.latestMediaDate!).getTime() - new Date(a.latestMediaDate!).getTime());

    return { 
      success: true, 
      data: {
        projects: JSON.parse(JSON.stringify(sortedProjects)),
        media: JSON.parse(JSON.stringify(media.sort((a, b) => (a.order || 0) - (b.order || 0))))
      } 
    };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to fetch public gallery data." };
  }
}

export async function updateMediaOrderAction(updates: { id: string, order: number }[]) {
  try {
    await connectToDB();
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.id },
        update: { order: update.order },
      },
    }));
    await Media.bulkWrite(bulkOps);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to update order" };
  }
}

export async function updateProjectAction(id: string, updates: { name?: string, thumbnailUrl?: string }) {
  try {
    await connectToDB();
    await Project.findByIdAndUpdate(id, updates);
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to update project" };
  }
}
