"use client";

import { useEffect, useState } from "react";
import { Media, MasonryGrid, Spinner, Row } from "@once-ui-system/core";
import { gallery as staticGallery } from "@/resources";

interface GalleryImage {
  id?: string | number;
  src: string;
  alt: string;
  orientation: "horizontal" | "vertical";
}

export default function GalleryView() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadImages() {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setImages(data);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to load gallery images from DB:", e);
      }
      
      // Fallback to static gallery images
      setImages(staticGallery.images as GalleryImage[]);
      setIsLoading(false);
    }
    
    loadImages();
  }, []);

  if (isLoading) {
    return (
      <Row fillWidth horizontal="center" padding="xl">
        <Spinner size="m" />
      </Row>
    );
  }

  return (
    <MasonryGrid columns={2} s={{ columns: 1 }}>
      {images.map((image, index) => (
        <Media
          enlarge
          priority={index < 10}
          sizes="(max-width: 560px) 100vw, 50vw"
          key={image.id || index}
          radius="m"
          aspectRatio={image.orientation === "horizontal" ? "16 / 9" : "3 / 4"}
          src={image.src}
          alt={image.alt}
        />
      ))}
    </MasonryGrid>
  );
}
