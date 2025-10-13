import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { ReactElement } from "react";

type StarRatingProps = {
  rating: number; // rating out of 5
};

export default function StarRating({ rating }: StarRatingProps) {
  // 🔒 Clamp the rating between 0 and 5
  function clampRating(raw: number) {
    if (!Number.isFinite(raw)) return 0;
    return Math.max(0, Math.min(5, raw));
  }

  const safeRating = clampRating(rating);
  const fullStars = Math.floor(safeRating);
  const fractional = safeRating - fullStars;

  // 🧮 Handle small floating point errors like 4.499999
  const hasHalfStar = fractional >= 0.5 - 1e-9;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // 🌟 Create stars dynamically
  const stars: ReactElement[] = [];

  // full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} />);
  }

  // half star
  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" />);
  }

  // empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FaRegStar key={`empty-${i}`} />);
  }

  // ✅ Return JSX here
  return <div className="flex items-center text-yellow-500">{stars}</div>;
}
