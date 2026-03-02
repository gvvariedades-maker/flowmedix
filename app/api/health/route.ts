import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

/**
 * Health Check Endpoint
 * 
 * Retorna status da aplicação e conectividade com serviços externos.
 * Usado para monitoramento e verificação de saúde da aplicação.
 * 
 * GET /api/health
 */
export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, string | number> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'unknown',
    environment: process.env.NODE_ENV || 'unknown',
  };

  // Verificar conectividade com banco de dados
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      checks.database = 'error';
      checks.databaseError = 'Missing Supabase credentials';
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Query simples para verificar conectividade
      const { error } = await supabase
        .from('modulos_estudo')
        .select('id')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 = nenhum resultado encontrado (ok para health check)
        checks.database = 'error';
        checks.databaseError = error.message;
        logger.warn('Health check: Database connectivity issue', { error: error.message });
      } else {
        checks.database = 'ok';
      }
    }
  } catch (error: any) {
    checks.database = 'error';
    checks.databaseError = error.message || 'Unknown error';
    logger.error('Health check: Database check failed', error);
  }

  // Calcular tempo de resposta
  const responseTime = Date.now() - startTime;
  checks.responseTime = responseTime;

  // Determinar status geral
  const healthy = checks.database === 'ok';
  const status = healthy ? 200 : 503;

  // Log do health check (apenas em caso de erro)
  if (!healthy) {
    logger.warn('Health check failed', checks);
  }

  return NextResponse.json(checks, { status });
}
