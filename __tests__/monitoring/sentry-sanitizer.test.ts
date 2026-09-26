import {
  isSensitiveKey,
  sanitizeString,
  sanitizeUrl,
  sanitizeHeaders,
  sanitizeObject,
  beforeSendSanitizer,
  beforeBreadcrumbSanitizer,
  REDACTED_VALUE,
} from '@/lib/monitoring/sentrySanitizer';

describe('Sentry Sanitizer & Privacy Filter', () => {
  describe('isSensitiveKey', () => {
    it('identifica corretamente chaves sensíveis (case-insensitive)', () => {
      expect(isSensitiveKey('Authorization')).toBe(true);
      expect(isSensitiveKey('authorization')).toBe(true);
      expect(isSensitiveKey('AUTHORIZATION')).toBe(true);
      expect(isSensitiveKey('Cookie')).toBe(true);
      expect(isSensitiveKey('set-cookie')).toBe(true);
      expect(isSensitiveKey('x-api-key')).toBe(true);
      expect(isSensitiveKey('apikey')).toBe(true);
      expect(isSensitiveKey('x-supabase-auth')).toBe(true);
      expect(isSensitiveKey('supabase_service_role_key')).toBe(true);
      expect(isSensitiveKey('stripe_secret_key')).toBe(true);
      expect(isSensitiveKey('upstash_redis_rest_token')).toBe(true);
      expect(isSensitiveKey('password')).toBe(true);
      expect(isSensitiveKey('session_token')).toBe(true);
    });

    it('não considera chaves seguras como sensíveis (evita falsos positivos)', () => {
      expect(isSensitiveKey('page')).toBe(false);
      expect(isSensitiveKey('slug')).toBe(false);
      expect(isSensitiveKey('modulo_slug')).toBe(false);
      expect(isSensitiveKey('banca')).toBe(false);
      expect(isSensitiveKey('titulo_aula')).toBe(false);
      expect(isSensitiveKey('status')).toBe(false);
      expect(isSensitiveKey('user_agent')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('mascara Bearer tokens', () => {
      const input = 'Request failed with header Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz';
      const output = sanitizeString(input);
      expect(output).toContain('Bearer [REDACTED]');
      expect(output).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    it('mascara JWTs soltos em strings', () => {
      const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const input = `Error resolving token ${jwt} during validation`;
      const output = sanitizeString(input);
      expect(output).toContain('[REDACTED_JWT]');
      expect(output).not.toContain(jwt);
    });

    it('mascara Stripe secrets', () => {
      const sampleStripeKey = ['sk', 'live', '51ABC1234567890123456789012345'].join('_');
      const input = `Stripe error with key ${sampleStripeKey}`;
      const output = sanitizeString(input);
      expect(output).toContain('[REDACTED_STRIPE_KEY]');
      expect(output).not.toContain(sampleStripeKey);
    });

    it('preserva strings inofensivas', () => {
      const input = 'Erro ao processar questão de cálculo de dosagem de medicamentos';
      expect(sanitizeString(input)).toBe(input);
    });
  });

  describe('sanitizeUrl', () => {
    it('redige parâmetros sensíveis em query strings relativas', () => {
      const url = '/api/registrar-tentativa?token=secret123&page=2&banca=ibfc';
      const sanitized = sanitizeUrl(url);
      expect(sanitized).toContain('token=%5BREDACTED%5D');
      expect(sanitized).toContain('page=2');
      expect(sanitized).toContain('banca=ibfc');
      expect(sanitized).not.toContain('secret123');
    });

    it('redige parâmetros sensíveis em URLs absolutas', () => {
      const url = 'https://avant.enf.br/auth/callback?code=super-secret-auth-code&state=active&tab=questions';
      const sanitized = sanitizeUrl(url);
      expect(sanitized).toContain('code=%5BREDACTED%5D');
      expect(sanitized).toContain('state=%5BREDACTED%5D');
      expect(sanitized).toContain('tab=questions');
      expect(sanitized).not.toContain('super-secret-auth-code');
    });

    it('preserva URLs sem parâmetros sensíveis', () => {
      const url = 'https://avant.enf.br/estudar/regras-de-tres-simples?page=1&limit=20';
      expect(sanitizeUrl(url)).toBe(url);
    });
  });

  describe('sanitizeHeaders', () => {
    it('redige headers sensíveis como Authorization e Cookie', () => {
      const headers = {
        'authorization': 'Bearer top-secret-token',
        'cookie': 'sb-access-token=xyz; session=abc',
        'x-api-key': 'key_12345',
        'content-type': 'application/json',
        'accept': '*/*',
      };

      const sanitized = sanitizeHeaders(headers);
      expect(sanitized).toBeDefined();
      expect(sanitized!['authorization']).toBe(REDACTED_VALUE);
      expect(sanitized!['cookie']).toBe(REDACTED_VALUE);
      expect(sanitized!['x-api-key']).toBe(REDACTED_VALUE);
      expect(sanitized!['content-type']).toBe('application/json');
      expect(sanitized!['accept']).toBe('*/*');
    });
  });

  describe('sanitizeObject', () => {
    it('higieniza objetos aninhados profundamente', () => {
      const payload = {
        user: {
          id: '12345',
          authToken: 'secret_token_value',
          profile: {
            passwordHash: 'hash_12345',
            name: 'Aluno Avant',
          },
        },
        meta: {
          stripeSecret: 'sk_test_12345678901234567890',
          query: '/api/test?token=abc',
        },
      };

      const sanitized = sanitizeObject(payload);
      expect(sanitized.user.id).toBe('12345');
      expect(sanitized.user.authToken).toBe(REDACTED_VALUE);
      expect(sanitized.user.profile.passwordHash).toBe(REDACTED_VALUE);
      expect(sanitized.user.profile.name).toBe('Aluno Avant');
      expect(sanitized.meta.stripeSecret).toBe(REDACTED_VALUE);
      expect(sanitized.meta.query).toContain('token=%5BREDACTED%5D');
    });

    it('protege contra referências circulares sem travar ou lançar erro', () => {
      const circularObj: any = { name: 'CircularTest' };
      circularObj.self = circularObj;

      expect(() => {
        const sanitized = sanitizeObject(circularObj);
        expect(sanitized.name).toBe('CircularTest');
        expect(sanitized.self).toBe('[CIRCULAR_OR_DEEP]');
      }).not.toThrow();
    });

    it('higieniza Error instances preservando stack e nome', () => {
      const err = new Error('Falha com Bearer secret-token-xyz');
      (err as any).secretContext = 'leaked-secret';

      const sanitized = sanitizeObject(err);
      expect(sanitized.name).toBe('Error');
      expect(sanitized.message).toContain('Bearer [REDACTED]');
      expect((sanitized as any).secretContext).toBe(REDACTED_VALUE);
    });
  });

  describe('beforeSendSanitizer', () => {
    it('sanitiza evento do Sentry completo', () => {
      const event: any = {
        request: {
          url: 'https://avant.enf.br/api/test?token=secret123',
          headers: {
            'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc',
            'cookie': 'sb-refresh-token=abc',
            'host': 'avant.enf.br',
          },
          cookies: 'session_id=secret',
          data: {
            password: 'my-super-secret-password',
            safeParam: 'safe-value',
          },
        },
        user: {
          id: 'user_uuid_123',
          email: 'aluno@avant.enf.br',
          ip_address: '189.120.45.67',
          username: 'aluno_avant',
        },
        extra: {
          serviceRoleKey: 'sbp_service_role_secret',
        },
        exception: {
          values: [
            {
              type: 'Error',
              value: 'Failed to authenticate Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token',
            },
          ],
        },
      };

      const result = beforeSendSanitizer(event);

      expect(result.request.url).toContain('token=%5BREDACTED%5D');
      expect(result.request.headers.authorization).toBe(REDACTED_VALUE);
      expect(result.request.headers.cookie).toBe(REDACTED_VALUE);
      expect(result.request.headers.host).toBe('avant.enf.br');
      expect(result.request.cookies).toBe(REDACTED_VALUE);
      expect(result.request.data.password).toBe(REDACTED_VALUE);
      expect(result.request.data.safeParam).toBe('safe-value');

      expect(result.user.email).toBe(REDACTED_VALUE);
      expect(result.user.ip_address).toBe(REDACTED_VALUE);
      expect(result.user.username).toBe(REDACTED_VALUE);
      expect(result.user.id).toBe('user_uuid_123');

      expect(result.extra.serviceRoleKey).toBe(REDACTED_VALUE);
      expect(result.exception.values[0].value).toContain('Bearer [REDACTED]');
    });

    it('não lança exceção se o evento for corrompido ou nulo', () => {
      expect(beforeSendSanitizer(null)).toBeNull();
      expect(() => beforeSendSanitizer({})).not.toThrow();
    });
  });

  describe('beforeBreadcrumbSanitizer', () => {
    it('sanitiza mensagens e URLs em breadcrumbs', () => {
      const breadcrumb: any = {
        category: 'fetch',
        message: 'Request to https://avant.enf.br/api?token=secret123 with Bearer token-xyz',
        data: {
          url: 'https://avant.enf.br/api/auth?access_token=secret_jwt',
          status_code: 200,
        },
      };

      const sanitized = beforeBreadcrumbSanitizer(breadcrumb);
      expect(sanitized.message).toContain('Bearer [REDACTED]');
      expect(sanitized.data.url).toContain('access_token=%5BREDACTED%5D');
      expect(sanitized.data.status_code).toBe(200);
    });
  });
});
