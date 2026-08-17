import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address (e.g., user@domain.com).' };
  }
  return { isValid: true };
}

export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 6 || password.length > 10) {
    return { isValid: false, error: 'Password length must be between 6 and 10 characters.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least 1 uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least 1 lowercase letter (a-z).' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least 1 special character (e.g. !@#$%^&*).' };
  }
  const digitMatches = password.match(/\d/g);
  if (!digitMatches || digitMatches.length < 2) {
    return { isValid: false, error: 'Password must contain at least 2 numbers (0-9).' };
  }
  return { isValid: true };
}

