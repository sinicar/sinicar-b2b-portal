/**
 * Read Cookie Utility
 * Pure browser cookie parsing without dependencies
 * 
 * ⚠️ COPY ONLY - Not wired to apiClient yet
 */

/**
 * Read a cookie value by name
 * @param name - Cookie name to read
 * @returns Cookie value or null if not found
 */
export function readCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    // SSR safety
    return null;
  }

  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  
  return null;
}
