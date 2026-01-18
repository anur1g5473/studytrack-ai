import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Basic input sanitization to prevent XSS
// This is a basic example; for production, consider a more comprehensive library (e.g., DOMPurify)
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";
  
  // Remove potentially harmful markdown or special characters that could break the prompt structure
  let sanitized = input.replace(/\`\`\`/g, ""); // Remove triple backticks
  sanitized = sanitized.replace(/\`\`/g, "");   // Remove double backticks
  sanitized = sanitized.replace(/\`/g, "");     // Remove single backticks
  sanitized = sanitized.replace(/[<>&]/g, (match) => {
    if (match === ">") return "&gt;";
    if (match === "<") return "&lt;";
    if (match === "&") return "&amp;";
    return match; // Should not happen
  });
  return sanitized.trim();
}