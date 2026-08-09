/**
 * Rate Limiter in-memory basado en ventana deslizante (sliding window)
 * Útil para prevenir ataques de fuerza bruta en login, registros y mutaciones.
 */

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitTracker>();

// Limpieza periódica de tokens expirados cada 5 minutos
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, tracker] of rateLimitStore.entries()) {
      if (now > tracker.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  windowMs?: number; // Tamaño de la ventana en milisegundos (default: 1 minuto)
  maxRequests?: number; // Máximo de peticiones permitidas en la ventana (default: 10)
}

export function checkRateLimit(identifier: string, options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || 60 * 1000; // 1 minuto
  const maxRequests = options.maxRequests || 10;
  const now = Date.now();

  const currentTracker = rateLimitStore.get(identifier);

  if (!currentTracker || now > currentTracker.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: maxRequests - 1, resetInMs: windowMs };
  }

  if (currentTracker.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetInMs: currentTracker.resetTime - now,
    };
  }

  currentTracker.count += 1;
  rateLimitStore.set(identifier, currentTracker);

  return {
    success: true,
    remaining: maxRequests - currentTracker.count,
    resetInMs: currentTracker.resetTime - now,
  };
}
