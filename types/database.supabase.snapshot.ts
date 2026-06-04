export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      acessos: {
        Row: {
          criado_em: string
          id: string
          produto: string
          stripe_checkout_session_id: string | null
          user_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          produto: string
          stripe_checkout_session_id?: string | null
          user_id: string
        }
        Update: {
          criado_em?: string
          id?: string
          produto?: string
          stripe_checkout_session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      concurso_matriculas: {
        Row: {
          concurso_id: string
          created_at: string
          expires_at: string | null
          id: string
          origem: Database["public"]["Enums"]["concurso_matricula_origem"]
          status: Database["public"]["Enums"]["concurso_matricula_status"]
          user_id: string
        }
        Insert: {
          concurso_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          origem?: Database["public"]["Enums"]["concurso_matricula_origem"]
          status?: Database["public"]["Enums"]["concurso_matricula_status"]
          user_id: string
        }
        Update: {
          concurso_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          origem?: Database["public"]["Enums"]["concurso_matricula_origem"]
          status?: Database["public"]["Enums"]["concurso_matricula_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "concurso_matriculas_concurso_id_fkey"
            columns: ["concurso_id"]
            isOneToOne: false
            referencedRelation: "concursos"
            referencedColumns: ["id"]
          },
        ]
      }
      concurso_modulos: {
        Row: {
          concurso_id: string
          created_at: string
          id: string
          modulo_id: string
          origem: Database["public"]["Enums"]["concurso_modulo_origem"]
        }
        Insert: {
          concurso_id: string
          created_at?: string
          id?: string
          modulo_id: string
          origem?: Database["public"]["Enums"]["concurso_modulo_origem"]
        }
        Update: {
          concurso_id?: string
          created_at?: string
          id?: string
          modulo_id?: string
          origem?: Database["public"]["Enums"]["concurso_modulo_origem"]
        }
        Relationships: [
          {
            foreignKeyName: "concurso_modulos_concurso_id_fkey"
            columns: ["concurso_id"]
            isOneToOne: false
            referencedRelation: "concursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concurso_modulos_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos_estudo"
            referencedColumns: ["id"]
          },
        ]
      }
      concurso_purchases: {
        Row: {
          amount: number
          concurso_id: string
          created_at: string
          currency: string
          gateway: string
          gateway_payment_id: string | null
          id: string
          paid_at: string | null
          status: Database["public"]["Enums"]["concurso_purchase_status"]
          user_id: string
        }
        Insert: {
          amount: number
          concurso_id: string
          created_at?: string
          currency?: string
          gateway?: string
          gateway_payment_id?: string | null
          id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["concurso_purchase_status"]
          user_id: string
        }
        Update: {
          amount?: number
          concurso_id?: string
          created_at?: string
          currency?: string
          gateway?: string
          gateway_payment_id?: string | null
          id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["concurso_purchase_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "concurso_purchases_concurso_id_fkey"
            columns: ["concurso_id"]
            isOneToOne: false
            referencedRelation: "concursos"
            referencedColumns: ["id"]
          },
        ]
      }
      concursos: {
        Row: {
          ano: number | null
          banca: string | null
          cargo: string | null
          cidade: string | null
          created_at: string
          data_prova: string | null
          descricao: string | null
          destaque: string | null
          id: string
          nome: string
          orgao: string | null
          price_cents: number | null
          slug: string
          status: Database["public"]["Enums"]["concurso_status"]
          tipo: Database["public"]["Enums"]["concurso_tipo"]
        }
        Insert: {
          ano?: number | null
          banca?: string | null
          cargo?: string | null
          cidade?: string | null
          created_at?: string
          data_prova?: string | null
          descricao?: string | null
          destaque?: string | null
          id?: string
          nome: string
          orgao?: string | null
          price_cents?: number | null
          slug: string
          status?: Database["public"]["Enums"]["concurso_status"]
          tipo?: Database["public"]["Enums"]["concurso_tipo"]
        }
        Update: {
          ano?: number | null
          banca?: string | null
          cargo?: string | null
          cidade?: string | null
          created_at?: string
          data_prova?: string | null
          descricao?: string | null
          destaque?: string | null
          id?: string
          nome?: string
          orgao?: string | null
          price_cents?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["concurso_status"]
          tipo?: Database["public"]["Enums"]["concurso_tipo"]
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          content: Json
          kind: Database["public"]["Enums"]["email_template_kind"]
          name: string
          preview_text: string
          slug: string
          subject: string
          updated_at: string
        }
        Insert: {
          content?: Json
          kind: Database["public"]["Enums"]["email_template_kind"]
          name: string
          preview_text?: string
          slug: string
          subject: string
          updated_at?: string
        }
        Update: {
          content?: Json
          kind?: Database["public"]["Enums"]["email_template_kind"]
          name?: string
          preview_text?: string
          slug?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      error_reports: {
        Row: {
          admin_notes: string | null
          category: string
          context_type: string
          created_at: string
          description: string
          id: string
          metadata: Json
          modulo_slug: string | null
          page_url: string | null
          priority: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          simulado_session_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          category: string
          context_type: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json
          modulo_slug?: string | null
          page_url?: string | null
          priority?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          simulado_session_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          category?: string
          context_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json
          modulo_slug?: string | null
          page_url?: string | null
          priority?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          simulado_session_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "error_reports_simulado_session_id_fkey"
            columns: ["simulado_session_id"]
            isOneToOne: false
            referencedRelation: "simulado_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_questoes: {
        Row: {
          acertou: boolean
          banca: string | null
          created_at: string
          estudo_reverso_concluido: boolean | null
          id: string
          modulo_slug: string
          subtopico: string | null
          topico: string | null
          user_id: string
        }
        Insert: {
          acertou: boolean
          banca?: string | null
          created_at?: string
          estudo_reverso_concluido?: boolean | null
          id?: string
          modulo_slug: string
          subtopico?: string | null
          topico?: string | null
          user_id: string
        }
        Update: {
          acertou?: boolean
          banca?: string | null
          created_at?: string
          estudo_reverso_concluido?: boolean | null
          id?: string
          modulo_slug?: string
          subtopico?: string | null
          topico?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invite_links: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          label: string | null
          link_expires_at: string
          max_uses: number
          pro_days: number
          revoked_at: string | null
          token: string
          use_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string | null
          link_expires_at: string
          max_uses?: number
          pro_days: number
          revoked_at?: string | null
          token: string
          use_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string | null
          link_expires_at?: string
          max_uses?: number
          pro_days?: number
          revoked_at?: string | null
          token?: string
          use_count?: number
        }
        Relationships: []
      }
      invite_redemptions: {
        Row: {
          id: string
          invite_link_id: string
          pro_expires_at: string
          redeemed_at: string
          user_id: string
        }
        Insert: {
          id?: string
          invite_link_id: string
          pro_expires_at: string
          redeemed_at?: string
          user_id: string
        }
        Update: {
          id?: string
          invite_link_id?: string
          pro_expires_at?: string
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_redemptions_invite_link_id_fkey"
            columns: ["invite_link_id"]
            isOneToOne: false
            referencedRelation: "invite_links"
            referencedColumns: ["id"]
          },
        ]
      }
      lp_pages: {
        Row: {
          config: Json
          created_at: string
          id: string
          internal_name: string
          path: string
          published_at: string | null
          seo: Json
          status: Database["public"]["Enums"]["lp_page_status"]
          template_id: string
          updated_at: string
          utm_campaign: string | null
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          internal_name: string
          path: string
          published_at?: string | null
          seo?: Json
          status?: Database["public"]["Enums"]["lp_page_status"]
          template_id: string
          updated_at?: string
          utm_campaign?: string | null
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          internal_name?: string
          path?: string
          published_at?: string | null
          seo?: Json
          status?: Database["public"]["Enums"]["lp_page_status"]
          template_id?: string
          updated_at?: string
          utm_campaign?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lp_pages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "lp_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      lp_templates: {
        Row: {
          created_at: string
          default_config: Json
          id: string
          nome: string
          slug: string
        }
        Insert: {
          created_at?: string
          default_config?: Json
          id?: string
          nome: string
          slug: string
        }
        Update: {
          created_at?: string
          default_config?: Json
          id?: string
          nome?: string
          slug?: string
        }
        Relationships: []
      }
      modulos_estudo: {
        Row: {
          assunto: string | null
          avant_codigo: number
          banca: string | null
          cidade_id: string | null
          content_hash: string | null
          conteudo_json: Json
          created_at: string | null
          id: string
          modulo_nome: string
          modulo_slug: string
          subtopico: string | null
          titulo_aula: string
        }
        Insert: {
          assunto?: string | null
          avant_codigo?: number
          banca?: string | null
          cidade_id?: string | null
          content_hash?: string | null
          conteudo_json: Json
          created_at?: string | null
          id?: string
          modulo_nome: string
          modulo_slug: string
          subtopico?: string | null
          titulo_aula: string
        }
        Update: {
          assunto?: string | null
          avant_codigo?: number
          banca?: string | null
          cidade_id?: string | null
          content_hash?: string | null
          conteudo_json?: Json
          created_at?: string | null
          id?: string
          modulo_nome?: string
          modulo_slug?: string
          subtopico?: string | null
          titulo_aula?: string
        }
        Relationships: []
      }
      simulado_analytics_daily: {
        Row: {
          acertos: number
          banca: string
          data_ref: string
          erros: number
          id: string
          modo: string
          subtopico: string
          tempo_total_ms: number
          topico: string
          total_questoes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          acertos?: number
          banca?: string
          data_ref: string
          erros?: number
          id?: string
          modo: string
          subtopico?: string
          tempo_total_ms?: number
          topico?: string
          total_questoes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          acertos?: number
          banca?: string
          data_ref?: string
          erros?: number
          id?: string
          modo?: string
          subtopico?: string
          tempo_total_ms?: number
          topico?: string
          total_questoes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      simulado_analytics_session_dims: {
        Row: {
          acertos: number
          banca: string
          data_ref: string
          erros: number
          id: string
          modo: string
          session_id: string
          subtopico: string
          tempo_total_ms: number
          topico: string
          total_questoes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          acertos?: number
          banca?: string
          data_ref: string
          erros?: number
          id?: string
          modo: string
          session_id: string
          subtopico?: string
          tempo_total_ms?: number
          topico?: string
          total_questoes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          acertos?: number
          banca?: string
          data_ref?: string
          erros?: number
          id?: string
          modo?: string
          session_id?: string
          subtopico?: string
          tempo_total_ms?: number
          topico?: string
          total_questoes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulado_analytics_session_dims_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "simulado_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      simulado_respostas: {
        Row: {
          acertou: boolean | null
          created_at: string
          id: string
          modulo_id: string
          modulo_slug: string
          opcao_correta_id: string | null
          opcao_id: string | null
          ordem: number
          respondida_em: string | null
          session_id: string
          tempo_ms: number | null
          user_id: string
        }
        Insert: {
          acertou?: boolean | null
          created_at?: string
          id?: string
          modulo_id: string
          modulo_slug: string
          opcao_correta_id?: string | null
          opcao_id?: string | null
          ordem: number
          respondida_em?: string | null
          session_id: string
          tempo_ms?: number | null
          user_id: string
        }
        Update: {
          acertou?: boolean | null
          created_at?: string
          id?: string
          modulo_id?: string
          modulo_slug?: string
          opcao_correta_id?: string | null
          opcao_id?: string | null
          ordem?: number
          respondida_em?: string | null
          session_id?: string
          tempo_ms?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulado_respostas_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos_estudo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulado_respostas_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "simulado_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      simulado_sessions: {
        Row: {
          acertos: number | null
          concluida_em: string | null
          created_at: string
          erros: number | null
          filtros: Json
          id: string
          modo: string
          percentual_acerto: number | null
          prova_iniciada_em: string | null
          ritmo_meta_segundos_por_questao: number | null
          status: string
          template_id: string | null
          tempo_medio_ms: number | null
          tempo_total_ms: number | null
          titulo: string
          total_questoes: number
          user_id: string
        }
        Insert: {
          acertos?: number | null
          concluida_em?: string | null
          created_at?: string
          erros?: number | null
          filtros?: Json
          id?: string
          modo?: string
          percentual_acerto?: number | null
          prova_iniciada_em?: string | null
          ritmo_meta_segundos_por_questao?: number | null
          status?: string
          template_id?: string | null
          tempo_medio_ms?: number | null
          tempo_total_ms?: number | null
          titulo?: string
          total_questoes: number
          user_id: string
        }
        Update: {
          acertos?: number | null
          concluida_em?: string | null
          created_at?: string
          erros?: number | null
          filtros?: Json
          id?: string
          modo?: string
          percentual_acerto?: number | null
          prova_iniciada_em?: string | null
          ritmo_meta_segundos_por_questao?: number | null
          status?: string
          template_id?: string | null
          tempo_medio_ms?: number | null
          tempo_total_ms?: number | null
          titulo?: string
          total_questoes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulado_sessions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "simulado_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      simulado_templates: {
        Row: {
          created_at: string
          filtros: Json
          id: string
          modo: string
          quantidade: number
          ritmo_meta_segundos_por_questao: number | null
          titulo: string
          ultimo_uso_em: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          filtros?: Json
          id?: string
          modo: string
          quantidade: number
          ritmo_meta_segundos_por_questao?: number | null
          titulo: string
          ultimo_uso_em?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          filtros?: Json
          id?: string
          modo?: string
          quantidade?: number
          ritmo_meta_segundos_por_questao?: number | null
          titulo?: string
          ultimo_uso_em?: string | null
          user_id?: string
        }
        Relationships: []
      }
      study_notebook_items: {
        Row: {
          added_at: string | null
          id: string
          modulo_slug: string
          notebook_id: string
          position: number
          titulo_aula: string | null
          topico: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          modulo_slug: string
          notebook_id: string
          position?: number
          titulo_aula?: string | null
          topico?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          modulo_slug?: string
          notebook_id?: string
          position?: number
          titulo_aula?: string | null
          topico?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_notebook_items_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "study_notebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      study_notebooks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_get_auth_user_id_by_email: {
        Args: { user_email: string }
        Returns: string
      }
      avant_catalog_stats: { Args: never; Returns: Json }
      avant_scale_health_metrics: { Args: never; Returns: Json }
      expire_concurso_matriculas: { Args: never; Returns: number }
      fulfill_concurso_purchase: {
        Args: { purchase_id: string }
        Returns: string
      }
      get_simulado_question_pool: {
        Args: {
          p_assunto?: string
          p_assuntos?: string[]
          p_banca?: string
          p_bancas?: string[]
          p_q?: string
          p_quantidade?: number
          p_user_id: string
        }
        Returns: {
          modulo_id: string
          modulo_slug: string
          ordem: number
        }[]
      }
      get_simulado_question_pool_count: {
        Args: {
          p_assunto?: string
          p_assuntos?: string[]
          p_banca?: string
          p_bancas?: string[]
          p_q?: string
          p_user_id: string
        }
        Returns: number
      }
      get_vitrine_facets: {
        Args: { p_banca?: string; p_bancas?: string[]; p_user_id: string }
        Returns: Json
      }
      get_vitrine_page: {
        Args: {
          p_assunto?: string
          p_assuntos?: string[]
          p_banca?: string
          p_bancas?: string[]
          p_page?: number
          p_q?: string
          p_user_id: string
        }
        Returns: Json
      }
      invalidate_cache_via_webhook: {
        Args: { event_type: string; table_name: string }
        Returns: undefined
      }
      refresh_simulado_session_analytics: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      simulado_run_retention: {
        Args: { p_reference?: string; p_retention_months?: number }
        Returns: {
          consolidated_sessions: number
          deleted_respostas: number
        }[]
      }
    }
    Enums: {
      concurso_matricula_origem:
        | "cadastro"
        | "admin"
        | "upgrade"
        | "purchase"
        | "stripe_pro"
        | "invite"
      concurso_matricula_status: "ativo" | "expirado"
      concurso_modulo_origem: "publicacao" | "manual" | "regra"
      concurso_purchase_status: "pending" | "paid" | "refunded"
      concurso_status: "rascunho" | "ativo" | "arquivado"
      concurso_tipo: "geral" | "edital"
      email_template_kind: "transactional" | "marketing"
      lp_page_status: "rascunho" | "ativo" | "arquivado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      concurso_matricula_origem: [
        "cadastro",
        "admin",
        "upgrade",
        "purchase",
        "stripe_pro",
        "invite",
      ],
      concurso_matricula_status: ["ativo", "expirado"],
      concurso_modulo_origem: ["publicacao", "manual", "regra"],
      concurso_purchase_status: ["pending", "paid", "refunded"],
      concurso_status: ["rascunho", "ativo", "arquivado"],
      concurso_tipo: ["geral", "edital"],
      email_template_kind: ["transactional", "marketing"],
      lp_page_status: ["rascunho", "ativo", "arquivado"],
    },
  },
} as const
