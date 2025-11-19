import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CBT-Qubic",
    short_name: "CBT-Qubic",
    description: "A Progressive Web App for CBT Qubic",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon-qubic.jpg",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-qubic.jpg",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}