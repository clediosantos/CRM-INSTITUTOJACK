import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let counter = 0;
export function generateUniqueId(prefix: string = 'msg'): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

