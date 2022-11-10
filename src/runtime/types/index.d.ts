export interface CookieOptions {
  // (Optional) The Cookie name prefix.
  name?: string
  // (Optional) The cookie lifetime (expiration) in seconds.
  lifetime?: number
  // (Optional) The cookie domain this should run on.
  domain?: string
  // (Optional) The path
  path?: string
  // (Optional) SameSite configuration for the session cookie.
  sameSite?: string
}
