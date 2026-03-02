/**
 * Rate Limiting para APIs
 * 
 * Implementação básica de rate limiting usando memória.
 * Para produção em escala, considere usar @upstash/ratelimit com Redis.
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

// Store em memória (resetado a cada restart do servidor)
// Em produção, use Redis ou serviço externo
const store: RateLimitStore = {};

// Limpar entradas expiradas periodicamente
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 60000); // Limpar a cada minuto

/**
 * Rate Limiter básico usando memória
 * 
 * @param identifier - Identificador único (IP, user ID, etc)
 * @param limit - Número máximo de requisições
 * @param windowMs - Janela de tempo em milissegundos
 * @returns true se dentro do limite, false se excedido
 */
export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 10000 // 10 segundos padrão
): boolean {
  const now = Date.now();
  const key = identifier;

  // Se não existe ou expirou, criar nova entrada
  if (!store[key] || store[key].resetAt < now) {
    store[key] = {
      count: 1,
      resetAt: now + windowMs,
    };
    return true;
  }

  // Incrementar contador
  store[key].count++;

  // Verificar se excedeu o limite
  if (store[key].count > limit) {
    return false;
  }

  return true;
}

/**
 * Rate Limiter para APIs Next.js
 * 
 * @param req - Request object
 * @param limit - Número máximo de requisições (padrão: 10)
 * @param windowMs - Janela de tempo em ms (padrão: 10s)
 * @returns true se permitido, false se rate limited
 */
export function apiRateLimit(
  req: Request,
  limit: number = 10,
  windowMs: number = 10000
): boolean {
  // Obter IP do cliente
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  
  return rateLimit(ip, limit, windowMs);
}

/**
 * Rate Limiter com retorno de informações detalhadas
 */
export function rateLimitWithInfo(
  identifier: string,
  limit: number = 10,
  windowMs: number = 10000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = identifier;

  if (!store[key] || store[key].resetAt < now) {
    store[key] = {
      count: 1,
      resetAt: now + windowMs,
    };
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: store[key].resetAt,
    };
  }

  store[key].count++;

  const remaining = Math.max(0, limit - store[key].count);
  const allowed = store[key].count <= limit;

  return {
    allowed,
    remaining,
    resetAt: store[key].resetAt,
  };
}
