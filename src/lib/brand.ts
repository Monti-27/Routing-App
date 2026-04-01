const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface BrandLogo {
  url: string;
  type: string;
  resolution: {
    width: number;
    height: number;
    aspect_ratio: number;
  };
}

export interface BrandData {
  logos: BrandLogo[];
  colors: Array<{ hex: string; usage: string }>;
  backdrops: Array<{ url: string; description: string }>;
  brandName: string;
}

export async function fetchBrandLogo(url: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${APP_BASE_URL}/api/brand?url=${encodeURIComponent(url)}`
    );
    const data = await response.json();
    if (data.success && data.data.logos && data.data.logos.length > 0) {
      const logos = data.data.logos as BrandLogo[];
      const pngLogos = logos.filter((l) => l.type === "png" || l.type === "apple-touch-icon");
      if (pngLogos.length > 0) {
        return pngLogos[0].url;
      }
      const faviconLogos = logos.filter((l) => l.type === "favicon");
      if (faviconLogos.length > 0) {
        return faviconLogos[0].url;
      }
      return logos[0].url;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch brand logo:", error);
    return null;
  }
}

export async function getBrandData(url: string): Promise<BrandData | null> {
  try {
    const response = await fetch(
      `${APP_BASE_URL}/api/brand?url=${encodeURIComponent(url)}`
    );
    const data = await response.json();
    if (data.success) {
      return data.data as BrandData;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch brand data:", error);
    return null;
  }
}
