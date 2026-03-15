"use client";

import { motion } from "framer-motion";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { ReactElement, memo } from "react";

type StarRatingProps = {
  rating: number;
};

function StarRatingBase({ rating }: StarRatingProps) {
  const clamp = (val: number) => Math.max(0, Math.min(5, val || 0));
  const r = clamp(rating);
  const full = Math.floor(r);
  const half = r - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  const stars: ReactElement[] = [];
  for (let i = 0; i < full; i++) stars.push(<FaStar key={`f-${i}`} />);
  if (half) stars.push(<FaStarHalfAlt key="half" />);
  for (let i = 0; i < empty; i++) stars.push(<FaRegStar key={`e-${i}`} />);

  return (
    <motion.div
      className="flex items-center text-yellow-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      {stars}
    </motion.div>
  );
}

export default memo(StarRatingBase);
