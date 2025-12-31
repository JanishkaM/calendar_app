"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const images = [
  "/backgrounds/calendar-cover-1.jpeg",
  "/backgrounds/calendar-cover-2.jpeg",
  "/backgrounds/calendar-cover-3.jpeg",
  "/backgrounds/calendar-cover-4.jpeg",
  "/backgrounds/calendar-cover-5.jpeg",
  "/backgrounds/calendar-cover-6.jpeg",
  "/backgrounds/calendar-cover-7.jpeg",
];

const getRandomImage = (imageArray: string[]) => {
  const randomIndex = Math.floor(Math.random() * imageArray.length);
  return imageArray[randomIndex];
};

export default function CoverImage() {
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);

  useEffect(() => {
    setCurrentImageSrc(getRandomImage(images));
  }, []);

  if (!currentImageSrc) {
    return (
      <div className="mx-auto w-full md:max-h-[25vh] rounded-none bg-muted" aria-hidden />
    );
  }
  return (
    <Image
      src={currentImageSrc}
      alt="Calendar cover image"
      width={1365}
      height={768}
      className="mx-auto w-full md:max-h-[25vh] rounded-none object-cover object-bottom"
      priority={true}
    />
  );
}
