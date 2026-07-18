import type { ImageMetadata } from "astro";
import taipeiSkyline from "../assets/images/DSC_1587.jpg";

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
  image: ImageMetadata;
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
  extends Omit<PhotoRecord, "image"> {
  thumbnail: PhotoAsset;
  full: PhotoAsset;
}

export const photos: PhotoRecord[] = [
  {
    id: "taipei-skyline",
    title: "Taipei Skyline",
    category: "urban",
    image: taipeiSkyline,
    alt: "淡藍天空與粉色雲層下，河岸另一側的台北城市天際線。",
    location: "Taipei, Taiwan",
    description: "城市在河面與遠山之間展開，午後的光把喧囂留在很遠的地方。",
  },
];
