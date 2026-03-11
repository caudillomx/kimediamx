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
  public: {
    Tables: {
      access_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          current_uses: number
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
        }
        Relationships: []
      }
      access_logs: {
        Row: {
          code_entered: string
          created_at: string
          id: string
          ip_hint: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          code_entered: string
          created_at?: string
          id?: string
          ip_hint?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          code_entered?: string
          created_at?: string
          id?: string
          ip_hint?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      action_items: {
        Row: {
          category: string
          client: string | null
          completed_at: string | null
          created_at: string
          description: string
          due_date: string | null
          id: string
          minute_id: string | null
          notes: string | null
          priority: string
          responsible_id: string | null
          responsible_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category?: string
          client?: string | null
          completed_at?: string | null
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          minute_id?: string | null
          notes?: string | null
          priority?: string
          responsible_id?: string | null
          responsible_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          client?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          minute_id?: string | null
          notes?: string | null
          priority?: string
          responsible_id?: string | null
          responsible_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_minute_id_fkey"
            columns: ["minute_id"]
            isOneToOne: false
            referencedRelation: "minutes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      brand_kit_profiles: {
        Row: {
          approx_followers: string | null
          bio_text: string | null
          brand_tone: string | null
          company_name: string | null
          company_size: string | null
          competitors: string | null
          consent_email: boolean
          consent_whatsapp: boolean
          content_grid: Json | null
          created_at: string
          diagnostic_level: string | null
          diagnostic_score: number | null
          differentiator: string | null
          email: string
          full_name: string
          goal_90_days: string | null
          has_website: boolean | null
          id: string
          industry: string | null
          kit_type: string
          main_channel: string | null
          market_position: string | null
          post_published: boolean
          post_text: string | null
          post_type: string | null
          profession: string
          profile_token: string | null
          publication_frequency: string | null
          self_perception: string | null
          social_handle: string
          target_audience: string | null
          updated_at: string
          value_proposition: string | null
          years_in_business: string | null
        }
        Insert: {
          approx_followers?: string | null
          bio_text?: string | null
          brand_tone?: string | null
          company_name?: string | null
          company_size?: string | null
          competitors?: string | null
          consent_email?: boolean
          consent_whatsapp?: boolean
          content_grid?: Json | null
          created_at?: string
          diagnostic_level?: string | null
          diagnostic_score?: number | null
          differentiator?: string | null
          email: string
          full_name: string
          goal_90_days?: string | null
          has_website?: boolean | null
          id?: string
          industry?: string | null
          kit_type?: string
          main_channel?: string | null
          market_position?: string | null
          post_published?: boolean
          post_text?: string | null
          post_type?: string | null
          profession: string
          profile_token?: string | null
          publication_frequency?: string | null
          self_perception?: string | null
          social_handle: string
          target_audience?: string | null
          updated_at?: string
          value_proposition?: string | null
          years_in_business?: string | null
        }
        Update: {
          approx_followers?: string | null
          bio_text?: string | null
          brand_tone?: string | null
          company_name?: string | null
          company_size?: string | null
          competitors?: string | null
          consent_email?: boolean
          consent_whatsapp?: boolean
          content_grid?: Json | null
          created_at?: string
          diagnostic_level?: string | null
          diagnostic_score?: number | null
          differentiator?: string | null
          email?: string
          full_name?: string
          goal_90_days?: string | null
          has_website?: boolean | null
          id?: string
          industry?: string | null
          kit_type?: string
          main_channel?: string | null
          market_position?: string | null
          post_published?: boolean
          post_text?: string | null
          post_type?: string | null
          profession?: string
          profile_token?: string | null
          publication_frequency?: string | null
          self_perception?: string | null
          social_handle?: string
          target_audience?: string | null
          updated_at?: string
          value_proposition?: string | null
          years_in_business?: string | null
        }
        Relationships: []
      }
      guide_registrations: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          guide_type: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          guide_type: string
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          guide_type?: string
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      minutes: {
        Row: {
          created_at: string
          file_name: string | null
          id: string
          meeting_date: string
          parsed: boolean
          raw_text: string | null
          title: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          id?: string
          meeting_date?: string
          parsed?: boolean
          raw_text?: string | null
          title: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string | null
          id?: string
          meeting_date?: string
          parsed?: boolean
          raw_text?: string | null
          title?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      participants: {
        Row: {
          access_code_used: string
          approx_followers: string | null
          bio_hybrid: string | null
          bio_institutional: string | null
          bio_text: string | null
          cause: string | null
          cause_custom: string | null
          comm_budget: string | null
          consent_email: boolean
          consent_whatsapp: boolean
          conviction: string | null
          created_at: string
          diagnostic_level: string | null
          diagnostic_score: number | null
          full_name: string
          goal_90_days: string | null
          has_comm_team: boolean | null
          id: string
          institutional_card: string | null
          institutional_post_published: boolean
          institutional_post_text: string | null
          institutional_post_type: string | null
          institutional_role: string | null
          kit_downloaded: boolean
          main_channel: string | null
          org_causes: string[] | null
          organization: string | null
          political_message: string | null
          post_published: boolean
          post_text: string | null
          post_type: string | null
          profile_token: string | null
          publication_frequency: string | null
          quarterly_topics: string[] | null
          responsibility_level: string | null
          role_title: string
          route_activated: boolean
          self_perception: string | null
          sensitive_topics: string[] | null
          show_on_map: boolean
          social_handle: string
          spokesperson_guide: Json | null
          spokesperson_phrase: string | null
          spokesperson_tone: string | null
          state: string
          strategic_audience: string | null
          target_population: string[] | null
          territory: string | null
          updated_at: string
        }
        Insert: {
          access_code_used: string
          approx_followers?: string | null
          bio_hybrid?: string | null
          bio_institutional?: string | null
          bio_text?: string | null
          cause?: string | null
          cause_custom?: string | null
          comm_budget?: string | null
          consent_email?: boolean
          consent_whatsapp?: boolean
          conviction?: string | null
          created_at?: string
          diagnostic_level?: string | null
          diagnostic_score?: number | null
          full_name: string
          goal_90_days?: string | null
          has_comm_team?: boolean | null
          id?: string
          institutional_card?: string | null
          institutional_post_published?: boolean
          institutional_post_text?: string | null
          institutional_post_type?: string | null
          institutional_role?: string | null
          kit_downloaded?: boolean
          main_channel?: string | null
          org_causes?: string[] | null
          organization?: string | null
          political_message?: string | null
          post_published?: boolean
          post_text?: string | null
          post_type?: string | null
          profile_token?: string | null
          publication_frequency?: string | null
          quarterly_topics?: string[] | null
          responsibility_level?: string | null
          role_title: string
          route_activated?: boolean
          self_perception?: string | null
          sensitive_topics?: string[] | null
          show_on_map?: boolean
          social_handle: string
          spokesperson_guide?: Json | null
          spokesperson_phrase?: string | null
          spokesperson_tone?: string | null
          state: string
          strategic_audience?: string | null
          target_population?: string[] | null
          territory?: string | null
          updated_at?: string
        }
        Update: {
          access_code_used?: string
          approx_followers?: string | null
          bio_hybrid?: string | null
          bio_institutional?: string | null
          bio_text?: string | null
          cause?: string | null
          cause_custom?: string | null
          comm_budget?: string | null
          consent_email?: boolean
          consent_whatsapp?: boolean
          conviction?: string | null
          created_at?: string
          diagnostic_level?: string | null
          diagnostic_score?: number | null
          full_name?: string
          goal_90_days?: string | null
          has_comm_team?: boolean | null
          id?: string
          institutional_card?: string | null
          institutional_post_published?: boolean
          institutional_post_text?: string | null
          institutional_post_type?: string | null
          institutional_role?: string | null
          kit_downloaded?: boolean
          main_channel?: string | null
          org_causes?: string[] | null
          organization?: string | null
          political_message?: string | null
          post_published?: boolean
          post_text?: string | null
          post_type?: string | null
          profile_token?: string | null
          publication_frequency?: string | null
          quarterly_topics?: string[] | null
          responsibility_level?: string | null
          role_title?: string
          route_activated?: boolean
          self_perception?: string | null
          sensitive_topics?: string[] | null
          show_on_map?: boolean
          social_handle?: string
          spokesperson_guide?: Json | null
          spokesperson_phrase?: string | null
          spokesperson_tone?: string | null
          state?: string
          strategic_audience?: string | null
          target_population?: string[] | null
          territory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          team_member_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          team_member_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          team_member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_submissions: {
        Row: {
          answers: Json
          company_name: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          quiz_type: string
          result_level: string
          result_sent: boolean
          total_score: number
        }
        Insert: {
          answers?: Json
          company_name?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          quiz_type: string
          result_level: string
          result_sent?: boolean
          total_score?: number
        }
        Update: {
          answers?: Json
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          quiz_type?: string
          result_level?: string
          result_sent?: boolean
          total_score?: number
        }
        Relationships: []
      }
      route_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          participant_id: string
          post_text: string | null
          week_number: number
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          participant_id: string
          post_text?: string | null
          week_number: number
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          participant_id?: string
          post_text?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "route_progress_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          avatar_color: string | null
          category: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          role_title: string
        }
        Insert: {
          avatar_color?: string | null
          category?: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          role_title: string
        }
        Update: {
          avatar_color?: string | null
          category?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          role_title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_code_usage: { Args: { code_text: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
