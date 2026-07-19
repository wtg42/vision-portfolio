import type { ImageMetadata } from "astro";
import seasideBarAtDuskFull from "../assets/images/portfolio/seaside-bar-at-dusk/full.webp";
import seasideBarAtDuskThumbnail from "../assets/images/portfolio/seaside-bar-at-dusk/thumbnail.webp";
import taipeiSkylineFull from "../assets/images/portfolio/taipei-skyline/full.webp";
import taipeiSkylineThumbnail from "../assets/images/portfolio/taipei-skyline/thumbnail.webp";

export const PHOTO_CATEGORIES = ["landscape", "portraits", "urban"] as const;

export type PhotoCategory = (typeof PHOTO_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<PhotoCategory, string> = {
  landscape: "Landscape",
  portraits: "Portraits",
  urban: "Urban",
};

export interface PhotoRecord {
  id: string;
  title: string;
  category: PhotoCategory;
  thumbnail: ImageMetadata;
  full: ImageMetadata;
  alt: string;
  location?: string;
  year?: number;
  description?: string;
}

export interface PhotoAsset {
  src: string;
  width: number;
  height: number;
}

export interface PhotoViewModel
  extends Omit<PhotoRecord, "thumbnail" | "full"> {
  thumbnail: PhotoAsset;
  full: PhotoAsset;
}

export const photos: PhotoRecord[] = [
  {
    id: "taipei-skyline",
    title: "Taipei Skyline",
    category: "urban",
    thumbnail: taipeiSkylineThumbnail,
    full: taipeiSkylineFull,
    alt: "淡藍天空與粉色雲層下，河岸另一側的台北城市天際線。",
    location: "Taipei, Taiwan",
    description: "城市在河面與遠山之間展開，午後的光把喧囂留在很遠的地方。",
  },
  {
    id: "seaside-bar-at-dusk",
    title: "Seaside Bar at Dusk",
    category: "landscape",
    thumbnail: seasideBarAtDuskThumbnail,
    full: seasideBarAtDuskFull,
    alt: "深藍暮色下的海岸與亮著彩色燈光的木造海邊酒吧。",
    description: "暮色沿著海平面留下最後一道暖光，岸邊的燈火讓夜晚緩慢靠近。",
  },
];
