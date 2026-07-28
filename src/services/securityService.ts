/**
 * Application Security & Input Validation Engine
 * Enforces XSS defense, SQLi prevention, PDF file validation, Rate limiting, and Secure Token storage.
 */

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit

/**
 * Validates PDF File upload size and format (rejects unsupported file formats)
 */
export function validatePdfFile(file: File): ValidationResult {
  if (!file) {
    return { isValid: false, errorMessage: 'No file selected.' };
  }

  const isPdfType = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdfType) {
    return {
      isValid: false,
      errorMessage: 'Unsupported file format! Only PDF files (.pdf) are accepted.',
    };
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      errorMessage: `File size (${sizeMb} MB) exceeds maximum allowed limit of 10 MB.`,
    };
  }

  return { isValid: true };
}

/**
 * Output Sanitization to defend against XSS attacks
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * SQL Injection defense helper - strips dangerous SQL characters from raw input
 */
export function sanitizeSqlInput(input: string): string {
  if (!input) return '';
  return input.replace(/['"--;]/g, '').trim();
}

/**
 * Client-Side Rate Limiter helper (prevents brute force or excessive API triggers)
 */
class RateLimiter {
  private lastCallTimes: Record<string, number> = {};

  public isAllowed(actionKey: string, cooldownMs: number = 1000): boolean {
    const now = Date.now();
    const last = this.lastCallTimes[actionKey] || 0;
    if (now - last < cooldownMs) {
      return false;
    }
    this.lastCallTimes[actionKey] = now;
    return true;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Secure Keystore Token Storage Helper (Simulates Android Keystore / Encrypted Storage)
 */
export const secureTokenStore = {
  setToken(token: string) {
    try {
      localStorage.setItem('fg_secure_auth_token', window.btoa(token));
    } catch {
      // Fallback
    }
  },
  getToken(): string | null {
    try {
      const raw = localStorage.getItem('fg_secure_auth_token');
      return raw ? window.atob(raw) : null;
    } catch {
      return null;
    }
  },
  clearToken() {
    try {
      localStorage.removeItem('fg_secure_auth_token');
    } catch {
      // Fallback
    }
  },
};
