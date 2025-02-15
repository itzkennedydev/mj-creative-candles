import { NextResponse } from "next/server";

const INSTAGRAM_USERNAME = "stitchpleaseqc";
const RECENT_POST_IDS = [
  'C5Ry_ePLXGD',
  'C5PUdXbLXwD',
  'C5M1QJPL0Ey',
  'C5KVvQlLJEm',
  'C5H2QOBL_Aq',
  'C5FXDvlrXEt',
  'C5C3xtlLXwx',
  'C5AVPQPrXGv'
];

interface InstagramPost {
  id: string;
  permalink: string;
  mediaUrl: string;
}

export async function GET() {
  try {
    const posts: InstagramPost[] = [];

    // Fetch each post's oEmbed data
    for (const postId of RECENT_POST_IDS) {
      const embedUrl = `https://www.instagram.com/p/${postId}/embed`;
      const response = await fetch(embedUrl);
      
      if (!response.ok) {
        console.error(`Failed to fetch post ${postId}`);
        continue;
      }

      const html = await response.text();
      
      // Extract the image URL from the oEmbed response
      const imageUrlRegex = /property="og:image" content="([^"]+)"/;
      const imageUrlMatch = imageUrlRegex.exec(html);
      if (imageUrlMatch?.[1]) {
        posts.push({
          id: postId,
          permalink: `https://www.instagram.com/p/${postId}/`,
          mediaUrl: imageUrlMatch[1],
        });
      }
    }

    if (posts.length === 0) {
      throw new Error("No Instagram posts found");
    }

    return NextResponse.json({ images: posts });
  } catch (error) {
    console.error("Instagram Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Instagram images" },
      { status: 500 }
    );
  }
} 