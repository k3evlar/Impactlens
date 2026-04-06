import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getUserTier = (credits: number): string => {
  if (credits >= 10) return "🌳 Champion";
  if (credits >= 5) return "🌿 Contributor";
  return "🌱 Beginner";
};
