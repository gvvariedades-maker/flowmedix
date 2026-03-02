/**
 * Script para validar variáveis de ambiente.
 * Carrega .env.local antes de validar (tsx não carrega automaticamente).
 */
import { loadEnvConfig } from '@next/env';
import { validateAllEnv } from '../lib/env';

// Carregar .env.local, .env.development.local, etc.
loadEnvConfig(process.cwd());

validateAllEnv();
console.log('✅ Variáveis de ambiente OK');
