import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Make sure the cn function is properly exported
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Not:
// export const cn = (...inputs: ClassValue[]) => { ... }
// or any other variation

