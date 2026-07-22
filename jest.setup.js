// Jest setup file
require('@testing-library/jest-dom');

// Mínimo para lib/env.ts (obrigatórias no schema) quando .env.local não carrega no CI unitário
const jestEnvDefaults = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-anon-key',
  NEXT_PUBLIC_APP_URL: 'https://avant.test',
  RESEND_API_KEY: 're_test_jest_placeholder',
  RESEND_FROM_EMAIL: 'Avant <noreply@test.local>',
  SUPABASE_WEBHOOK_SECRET: 'jest_supabase_webhook_secret_32',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-service-role-key',
};
for (const [key, value] of Object.entries(jestEnvDefaults)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

// @types/node marks NODE_ENV readonly; tests override it for prod/dev branches.
Object.defineProperty(process.env, 'NODE_ENV', {
  value: process.env.NODE_ENV ?? 'test',
  writable: true,
  configurable: true,
});

// Polyfill TextEncoder/TextDecoder para testes que importam next/cache
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
