-- Migration: Limpar questões e histórico para pivot Técnico de Enfermagem
-- Execute este script no SQL Editor do Supabase
-- Data: 2026-03-02
-- Objetivo: Apagar todas as questões atuais para inserir novas de Técnico de Enfermagem

-- ============================================================================
-- ATENÇÃO: Esta operação é IRREVERSÍVEL
-- ============================================================================

-- 1. Apagar todo o histórico de tentativas (recomeçar do zero)
DELETE FROM historico_questoes;

-- 2. Apagar todas as questões
DELETE FROM modulos_estudo;

-- 3. Verificação (deve retornar 0 em ambas)
-- SELECT COUNT(*) AS questoes_restantes FROM modulos_estudo;
-- SELECT COUNT(*) AS historico_restante FROM historico_questoes;
