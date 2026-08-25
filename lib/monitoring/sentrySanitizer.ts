/**
 * Centralized Sentry Sanitizer & Privacy Filter
 * 
 * Works universally across Browser, Node.js and Edge runtimes.
 * Does NOT import Node-only packages (no 'crypto', 'fs', 'path').
 * 
 * Protects against leaking PII, Authorization headers, session cookies,
 * JWTs, Supabase service-role keys, Stripe secrets, and Upstash tokens.
 */

// Keys that must always have their values redacted (case-insensitive & camelCase/snake_case)
const SENSITIVE_KEY_PATTERNS: RegExp[] = [
  /^authorization$/i,
  /^proxy-authorization$/i,
  /^cookie$/i,
  /^set-cookie$/i,
  /.*x-api-key.*/i,
  /.*api_?key.*/i,
  /.*x-supabase-auth.*/i,
  /.*auth_?token.*/i,
  /.*access_?token.*/i,
  /.*refresh_?token.*/i,
  /.*token.*/i,
  /.*secret.*/i,
  /.*password.*/i,
  /.*passwd.*/i,
  /.*pwd.*/i,
  /.*service_?role.*/i,
  /.*private_?key.*/i,
  /.*credit_?card.*/i,
  /.*cvv.*/i,
  /.*session.*/i,
  /.*signature.*/i,
  /.*stripe.*/i,
  /.*upstash.*/i,
];

// Query parameter keys that should have their values masked in URLs
const SENSITIVE_QUERY_PARAMS = new Set([
  'token',
  'access_token',
  'refresh_token',
  'auth_token',
  'api_key',
  'apikey',
  'key',
  'secret',
  'signature',
  'code',
  'authorization',
  'session',
  'session_id',
  'jwt',
  'password',
  'auth',
  'state',
]);

// Regex for bearer tokens and JWT patterns in arbitrary strings
const BEARER_REGEX = /Bearer\s+([A-Za-z0-9\-._~+/]+=*)/gi;
const JWT_REGEX = /eyJ[A-Za-z0-9\-_=]+\.eyJ[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_.+/=]*/g;
const STRIPE_SECRET_REGEX = /(sk_live_|sk_test_|whsec_)[0-9a-zA-Z]{20,}/g;

export const REDACTED_VALUE = '[REDACTED]';

/**
 * Checks whether a given key name is considered sensitive.
 */
export function isSensitiveKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  for (const pattern of SENSITIVE_KEY_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }
  return false;
}

/**
 * Sanitizes arbitrary string content by masking embedded Bearer tokens,
 * JWTs, and known secret key prefixes.
 */
export function sanitizeString(value: string): string {
  if (!value || typeof value !== 'string') return value;

  let result = value;

  // Mask Bearer tokens
  result = result.replace(BEARER_REGEX, 'Bearer [REDACTED]');

  // Mask JWT tokens
  result = result.replace(JWT_REGEX, '[REDACTED_JWT]');

  // Mask Stripe secrets
  result = result.replace(STRIPE_SECRET_REGEX, '[REDACTED_STRIPE_KEY]');

  return result;
}

/**
 * Sanitizes a URL by replacing values of sensitive query parameters with [REDACTED].
 * Preserves safe parameters such as page, slug, banca, limit, etc.
 */
export function sanitizeUrl(urlStr: string): string {
  if (!urlStr || typeof urlStr !== 'string') return urlStr;

  try {
    // Handle both full URLs and relative paths
    const isRelative = !urlStr.includes('://') && !urlStr.startsWith('//');
    const base = 'http://localhost';
    const parsed = new URL(isRelative ? `${base}${urlStr.startsWith('/') ? '' : '/'}${urlStr}` : urlStr);

    let modified = false;
    parsed.searchParams.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_QUERY_PARAMS.has(lowerKey) || isSensitiveKey(key)) {
        parsed.searchParams.set(key, REDACTED_VALUE);
        modified = true;
      } else {
        // Also check if the parameter value itself is a JWT or Bearer
        const sanitizedVal = sanitizeString(val);
        if (sanitizedVal !== val) {
          parsed.searchParams.set(key, sanitizedVal);
          modified = true;
        }
      }
    });

    if (!modified) {
      return urlStr;
    }

    if (isRelative) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }

    return parsed.toString();
  } catch {
    // If URL parsing fails, fallback to regex string sanitization
    return sanitizeString(urlStr);
  }
}

/**
 * Deeply sanitizes objects, arrays, and nested structures.
 * Protects against circular references and limits recursion depth.
 */
export function sanitizeObject<T = any>(
  obj: T,
  seen: WeakSet<object> = new WeakSet(),
  depth = 0,
  maxDepth = 8,
): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Primitive types
  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  // Prevent infinite recursion on circular objects or extreme depth
  if (depth > maxDepth || seen.has(obj)) {
    return '[CIRCULAR_OR_DEEP]' as unknown as T;
  }

  seen.add(obj);

  // Handle Array
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, seen, depth + 1, maxDepth)) as unknown as T;
  }

  // Handle Error instances
  if (obj instanceof Error) {
    const errorCopy: Record<string, any> = {
      name: obj.name,
      message: sanitizeString(obj.message),
      stack: obj.stack ? sanitizeString(obj.stack) : undefined,
    };
    for (const key of Object.keys(obj)) {
      const val = (obj as any)[key];
      if (isSensitiveKey(key)) {
        errorCopy[key] = REDACTED_VALUE;
      } else {
        errorCopy[key] = sanitizeObject(val, seen, depth + 1, maxDepth);
      }
    }
    return errorCopy as unknown as T;
  }

  // Handle plain objects / records
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key)) {
      result[key] = REDACTED_VALUE;
    } else if (typeof value === 'string') {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('url') ||
        lowerKey.includes('href') ||
        lowerKey.includes('path') ||
        lowerKey.includes('query') ||
        (value.startsWith('/') && value.includes('?')) ||
        value.startsWith('http://') ||
        value.startsWith('https://')
      ) {
        result[key] = sanitizeUrl(value);
      } else {
        result[key] = sanitizeString(value);
      }
    } else {
      result[key] = sanitizeObject(value, seen, depth + 1, maxDepth);
    }
  }

  return result as unknown as T;
}

/**
 * Sanitizes headers by redacting sensitive header keys.
 */
export function sanitizeHeaders(
  headers: Record<string, any> | undefined | null,
): Record<string, any> | undefined {
  if (!headers || typeof headers !== 'object') return undefined;

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (isSensitiveKey(key)) {
      sanitized[key] = REDACTED_VALUE;
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else {
      sanitized[key] = sanitizeObject(value);
    }
  }
  return sanitized;
}

/**
 * Sentry beforeSend hook.
 * Sanitizes the event before it is transmitted to Sentry.
 * Never throws an unhandled exception.
 */
export function beforeSendSanitizer(event: any, hint?: any): any {
  if (!event) return null;

  try {
    // 1. Sanitize request data if present
    if (event.request) {
      if (event.request.url) {
        event.request.url = sanitizeUrl(event.request.url);
      }
      if (event.request.headers) {
        event.request.headers = sanitizeHeaders(event.request.headers);
      }
      if (event.request.cookies) {
        event.request.cookies = REDACTED_VALUE;
      }
      if (event.request.query_string) {
        event.request.query_string = sanitizeUrl(`?${event.request.query_string}`).replace(/^\?/, '');
      }
      if (event.request.data) {
        event.request.data = sanitizeObject(event.request.data);
      }
    }

    // 2. Sanitize user info (keep ID if safe, redact email/ip/username)
    if (event.user) {
      if (event.user.email) {
        event.user.email = REDACTED_VALUE;
      }
      if (event.user.ip_address) {
        event.user.ip_address = REDACTED_VALUE;
      }
      if (event.user.username) {
        event.user.username = REDACTED_VALUE;
      }
      if (event.user.id && typeof event.user.id === 'string' && event.user.id.includes('@')) {
        event.user.id = REDACTED_VALUE;
      }
    }

    // 3. Sanitize extra & contexts
    if (event.extra) {
      event.extra = sanitizeObject(event.extra);
    }
    if (event.contexts) {
      event.contexts = sanitizeObject(event.contexts);
    }
    if (event.tags) {
      event.tags = sanitizeObject(event.tags);
    }

    // 4. Sanitize breadcrumbs within the event
    if (event.breadcrumbs && Array.isArray(event.breadcrumbs)) {
      event.breadcrumbs = event.breadcrumbs.map((bc: any) => beforeBreadcrumbSanitizer(bc, hint));
    }

    // 5. Sanitize exception messages
    if (event.exception?.values && Array.isArray(event.exception.values)) {
      for (const exc of event.exception.values) {
        if (exc.value) {
          exc.value = sanitizeString(exc.value);
        }
      }
    }

    return event;
  } catch (err) {
    // If an error occurs inside the sanitizer, return event with critical properties stripped
    // to avoid blocking the app or leaking unscrubbed raw data.
    if (event.request) {
      delete event.request.headers;
      delete event.request.cookies;
      delete event.request.data;
    }
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  }
}

/**
 * Sentry beforeBreadcrumb hook.
 * Sanitizes breadcrumb data and message.
 */
export function beforeBreadcrumbSanitizer(breadcrumb: any, hint?: any): any {
  if (!breadcrumb) return null;

  try {
    if (breadcrumb.message && typeof breadcrumb.message === 'string') {
      breadcrumb.message = sanitizeString(breadcrumb.message);
    }

    if (breadcrumb.data && typeof breadcrumb.data === 'object') {
      if (breadcrumb.data.url && typeof breadcrumb.data.url === 'string') {
        breadcrumb.data.url = sanitizeUrl(breadcrumb.data.url);
      }
      breadcrumb.data = sanitizeObject(breadcrumb.data);
    }

    return breadcrumb;
  } catch {
    return breadcrumb;
  }
}
