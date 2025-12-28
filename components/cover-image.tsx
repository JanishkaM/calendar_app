"use client";
import Image from "next/image";
import { useState } from "react";

const coverImages = [
  "/calendar-cover-1.jpeg",
  "/calendar-cover-2.jpeg",
  "/calendar-cover-3.jpeg",
  "/calendar-cover-4.jpeg",
  "/calendar-cover-5.jpeg",
  "/calendar-cover-6.jpeg",
  "/calendar-cover-7.jpeg",
];

export default function CoverImage() {
  const selectImage = () => {
    const next = Math.floor(Math.random() * coverImages.length);
    return next;
  };

  const [selectedImage] = useState(() => selectImage());

  return (
    <Image
      src={coverImages[selectedImage]}
      alt="Calendar cover image"
      width={1365}
      height={768}
      className="sticky top-[-18vh] md:top-[-30vh] left-0 z-50 mx-auto w-full max-h-[50vh] rounded-none object-cover object-bottom"
    />
  );
}
