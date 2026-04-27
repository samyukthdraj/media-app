export function getYouTubeID(url: string): string | null {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export async function fetchYouTubeMetadata(videoId: string) {
  try {
    // Try multiple oembed formats or just ensure the URL is clean
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    
    if (!res.ok) {
        // Fallback to high-res thumbnail URL directly if oembed fails
        return {
            title: "YouTube Video",
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        };
    }
    
    const data = await res.json();
    return {
      title: data.title || "YouTube Video",
      thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  } catch (err) {
    return {
        title: "YouTube Video",
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };
  }
}
