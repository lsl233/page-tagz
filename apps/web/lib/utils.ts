import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { hello } from "@packages/utils"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
