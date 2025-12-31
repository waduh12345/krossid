import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kross.id",
    short_name: "Kross.id",
    description: "A Progressive Web App for Kross.id",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/kross-id.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/kross-id.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}