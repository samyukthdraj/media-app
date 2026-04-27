import { connectToDB } from "@/lib/db";
import { Media } from "@/lib/models";
import { MediaGallery } from "@/components/MediaGallery";

export default async function Home() {
  await connectToDB();
  const galleryItems = await Media.find().populate("projectId").sort({ createdAt: -1 });

  return (
    <main className="container mx-auto py-12 px-4 lg:px-8">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-500">
          Media Gallery
        </h1>
        <p className="text-lg text-muted-foreground">
          Explore our collection of high-quality photos and videos.
        </p>
      </div>

      <MediaGallery items={JSON.parse(JSON.stringify(galleryItems))} />
    </main>
  );
}
