interface CoverImageProps {
  month: number; // 0-11 for Jan-Dec
}
import Image from "next/image";

const images = [
  "/backgrounds/calendar-cover-1.jpg",
  "/backgrounds/calendar-cover-2.jpg",
  "/backgrounds/calendar-cover-3.jpg",
  "/backgrounds/calendar-cover-4.jpg",
  "/backgrounds/calendar-cover-5.jpg",
  "/backgrounds/calendar-cover-6.jpg",
  "/backgrounds/calendar-cover-7.jpg",
  "/backgrounds/calendar-cover-8.jpg",
  "/backgrounds/calendar-cover-9.jpg",
  "/backgrounds/calendar-cover-10.jpg",
  "/backgrounds/calendar-cover-11.jpg",
  "/backgrounds/calendar-cover-12.jpg",
];

export default function CoverImage({month}: CoverImageProps) {

  return (
    <Image
      src={images[month]}
      alt="Calendar cover image"
      width={1365}
      height={768}
      className="mx-auto w-full md:max-h-[25vh] rounded-none object-cover object-bottom"
      priority={true}
    />
  );
}