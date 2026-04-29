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
      ad_campaigns: {
        Row: {
          budget: number | null
          campaign_id_external: string | null
          campaign_name: string
          created_at: string
          end_date: string | null
          id: string
          import_batch: string | null
          objective: string | null
          platform: string
          profile_id: string
          start_date: string | null
          status: string | null
        }
        Insert: {
          budget?: number | null
          campaign_id_external?: string | null
          campaign_name: string
          created_at?: string
          end_date?: string | null
          id?: string
          import_batch?: string | null
          objective?: string | null
          platform: string
          profile_id: string
          start_date?: string | null
          status?: string | null
        }
        Update: {
          budget?: number | null
          campaign_id_external?: string | null
          campaign_name?: string
          created_at?: string
          end_date?: string | null
          id?: string
          import_batch?: string | null
          objective?: string | null
          platform?: string
          profile_id?: string
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaigns_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "content_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_performance: {
        Row: {
          ad_name: string | null
          ad_set_name: string | null
          campaign_id: string
          clicks: number | null
          conversion_value: number | null
          conversions: number | null
          cpc: number | null
          cpm: number | null
          created_at: string
          ctr: number | null
          frequency: number | null
          id: string
          impressions: number | null
          raw_data: Json | null
          reach: number | null
          report_date: string | null
          roas: number | null
          spend: number | null
        }
        Insert: {
          ad_name?: string | null
          ad_set_name?: string | null
          campaign_id: string
          clicks?: number | null
          conversion_value?: number | null
          conversions?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          ctr?: number | null
          frequency?: number | null
          id?: string
          impressions?: number | null
          raw_data?: Json | null
          reach?: number | null
          report_date?: string | null
          roas?: number | null
          spend?: number | null
        }
        Update: {
          ad_name?: string | null
          ad_set_name?: string | null
          campaign_id?: string
          clicks?: number | null
          conversion_value?: number | null
          conversions?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          ctr?: number | null
          frequency?: number | null
          id?: string
          impressions?: number | null
          raw_data?: Json | null
          reach?: number | null
          report_date?: string | null
          roas?: number | null
          spend?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_performance_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
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
          content_pillars: Json | null
          content_restrictions: string | null
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
          key_dates: string | null
          kit_type: string
          main_channel: string | null
          market_position: string | null
          post_published: boolean
          post_text: string | null
          post_type: string | null
          preferred_formats: Json | null
          profession: string
          profile_token: string | null
          publication_frequency: string | null
          reference_accounts: string | null
          self_perception: string | null
          social_handle: string
          target_audience: string | null
          updated_at: string
          user_id: string | null
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
          content_pillars?: Json | null
          content_restrictions?: string | null
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
          key_dates?: string | null
          kit_type?: string
          main_channel?: string | null
          market_position?: string | null
          post_published?: boolean
          post_text?: string | null
          post_type?: string | null
          preferred_formats?: Json | null
          profession: string
          profile_token?: string | null
          publication_frequency?: string | null
          reference_accounts?: string | null
          self_perception?: string | null
          social_handle: string
          target_audience?: string | null
          updated_at?: string
          user_id?: string | null
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
          content_pillars?: Json | null
          content_restrictions?: string | null
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
          key_dates?: string | null
          kit_type?: string
          main_channel?: string | null
          market_position?: string | null
          post_published?: boolean
          post_text?: string | null
          post_type?: string | null
          preferred_formats?: Json | null
          profession?: string
          profile_token?: string | null
          publication_frequency?: string | null
          reference_accounts?: string | null
          self_perception?: string | null
          social_handle?: string
          target_audience?: string | null
          updated_at?: string
          user_id?: string | null
          value_proposition?: string | null
          years_in_business?: string | null
        }
        Relationships: []
      }
      client_contacts: {
        Row: {
          client_name: string
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          nicknames: string[] | null
          notes: string | null
          role_title: string | null
        }
        Insert: {
          client_name: string
          created_at?: string
          full_name: string
          id?: string
          is_active?: boolean
          nicknames?: string[] | null
          notes?: string | null
          role_title?: string | null
        }
        Update: {
          client_name?: string
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          nicknames?: string[] | null
          notes?: string | null
          role_title?: string | null
        }
        Relationships: []
      }
      client_objectives: {
        Row: {
          business_unit: string | null
          client_name: string
          created_at: string
          id: string
          main_activities: string | null
          objective_text: string
          priority: number
          updated_at: string
          year: number
        }
        Insert: {
          business_unit?: string | null
          client_name: string
          created_at?: string
          id?: string
          main_activities?: string | null
          objective_text: string
          priority?: number
          updated_at?: string
          year?: number
        }
        Update: {
          business_unit?: string | null
          client_name?: string
          created_at?: string
          id?: string
          main_activities?: string | null
          objective_text?: string
          priority?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      client_reports: {
        Row: {
          created_at: string
          file_url: string | null
          generated_by: string | null
          id: string
          period_end: string
          period_start: string
          profile_id: string
          recommendations: string | null
          report_type: string
          summary: string | null
          title: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          generated_by?: string | null
          id?: string
          period_end: string
          period_start: string
          profile_id: string
          recommendations?: string | null
          report_type?: string
          summary?: string | null
          title: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          generated_by?: string | null
          id?: string
          period_end?: string
          period_start?: string
          profile_id?: string
          recommendations?: string | null
          report_type?: string
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "content_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_trend_keywords: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          keyword: string
          profile_id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          keyword: string
          profile_id: string
          source?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          keyword?: string
          profile_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_trend_keywords_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "content_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_trend_results: {
        Row: {
          created_at: string
          cycle_id: string | null
          id: string
          keyword: string
          profile_id: string
          raw_data: Json | null
          relevance_score: number | null
          searched_at: string
          source_type: string | null
          summary: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          cycle_id?: string | null
          id?: string
          keyword: string
          profile_id: string
          raw_data?: Json | null
          relevance_score?: number | null
          searched_at?: string
          source_type?: string | null
          summary?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          cycle_id?: string | null
          id?: string
          keyword?: string
          profile_id?: string
          raw_data?: Json | null
          relevance_score?: number | null
          searched_at?: string
          source_type?: string | null
          summary?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_trend_results_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "content_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_trend_results_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "content_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_weekly_milestones: {
        Row: {
          activity_text: string
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          month: number
          objective_id: string
          week_number: number
        }
        Insert: {
          activity_text: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          month: number
          objective_id: string
          week_number: number
        }
        Update: {
          activity_text?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          month?: number
          objective_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_weekly_milestones_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "client_objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      content_analytics: {
        Row: {
          clicks: number | null
          comments: number | null
          created_at: string
          engagement: number | null
          engagement_rate: number | null
          id: string
          import_batch: string | null
          impressions: number | null
          network: string | null
          piece_id: string | null
          post_text: string | null
          post_type: string | null
          profile_id: string
          published_date: string | null
          raw_data: Json | null
          reach: number | null
          reactions: number | null
          shares: number | null
          video_views: number | null
        }
        Insert: {
          clicks?: number | null
          comments?: number | null
          created_at?: string
          engagement?: number | null
          engagement_rate?: number | null
          id?: string
          import_batch?: string | null
          impressions?: number | null
          network?: string | null
          piece_id?: string | null
          post_text?: string | null
          post_type?: string | null
          profile_id: string
          published_date?: string | null
          raw_data?: Json | null
          reach?: number | null
          reactions?: number | null
          shares?: number | null
          video_views?: number | null
        }
        Update: {
          clicks?: number | null
          comments?: number | null
          created_at?: string
          engagement?: number | null
          engagement_rate?: number | null
          id?: string
          import_batch?: string | null
          impressions?: number | null
          network?: string | null
          piece_id?: string | null
          post_text?: string | null
          post_type?: string | null
          profile_id?: string
          published_date?: string | null
          raw_data?: Json | null
          reach?: number | null
          reactions?: number | null
          shares?: number | null
          video_views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_analytics_piece_id_fkey"
            columns: ["piece_id"]
            isOneToOne: false
            referencedRelation: "content_pieces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "content_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_cycles: {
        Row: {
          ads_budget: number | null
          ai_recommendations: string | null
          briefing_data: Json | null
          created_at: string
          cycle_type: string
          end_date: string
          id: string
          profile_id: string
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          ads_budget?: number | null
          ai_recommendations?: string | null
          briefing_data?: Json | null
          created_at?: string
          cycle_type?: string
          end_date: string
          id?: string
          profile_id: string
          start_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          ads_budget?: number | null
          ai_recommendations?: string | null
          briefing_data?: Json | null
          created_at?: string
          cycle_type?: string
          end_date?: string
          id?: string
          profile_id?: string
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_cycles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "content_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_inputs: {
        Row: {
          content: string | null
          created_at: string
          cycle_id: string
          file_name: string | null
          file_url: string | null
          id: string
          input_type: string
          sort_order: number | null
          tags: string[] | null
          title: string | null
          url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          cycle_id: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          input_type?: string
          sort_order?: number | null
          tags?: string[] | null
          title?: string | null
          url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          cycle_id?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          input_type?: string
          sort_order?: number | null
          tags?: string[] | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_inputs_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "content_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_learnings: {
        Row: {
          category: string
          confidence: number | null
          created_at: string
          cycle_id: string | null
          id: string
          insight: string
          is_active: boolean | null
          profile_id: string
          source: string | null
        }
        Insert: {
          category?: string
          confidence?: number | null
          created_at?: string
          cycle_id?: string | null
          id?: string
          insight: string
          is_active?: boolean | null
          profile_id: string
          source?: string | null
        }
        Update: {
          category?: string
          confidence?: number | null
          created_at?: string
          cycle_id?: string | null
          id?: string
          insight?: string
          is_active?: boolean | null
          profile_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_learnings_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "content_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_learnings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "content_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_pieces: {
        Row: {
          created_at: string
          cta: string | null
          cycle_id: string
          design_prompt: string | null
          draft_copy: string | null
          final_copy: string | null
          format: string
          hashtags: string[] | null
          id: string
          network: string
          objective: string | null
          pillar: string | null
          scheduled_date: string | null
          sort_order: number | null
          status: string
          tone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta?: string | null
          cycle_id: string
          design_prompt?: string | null
          draft_copy?: string | null
          final_copy?: string | null
          format: string
          hashtags?: string[] | null
          id?: string
          network: string
          objective?: string | null
          pillar?: string | null
          scheduled_date?: string | null
          sort_order?: number | null
          status?: string
          tone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta?: string | null
          cycle_id?: string
          design_prompt?: string | null
          draft_copy?: string | null
          final_copy?: string | null
          format?: string
          hashtags?: string[] | null
          id?: string
          network?: string
          objective?: string | null
          pillar?: string | null
          scheduled_date?: string | null
          sort_order?: number | null
          status?: string
          tone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_pieces_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "content_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_profiles: {
        Row: {
          avatar_url: string | null
          brand_essence: string | null
          brand_tone: string | null
          brandbook_file_name: string | null
          brandbook_url: string | null
          client_name: string
          client_type: string | null
          content_pillars: string[] | null
          created_at: string
          hashtag_groups: Json | null
          id: string
          industry: string | null
          notes: string | null
          posting_frequency: string | null
          preferred_networks: string[] | null
          reference_accounts: string | null
          restrictions: string | null
          target_audience: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          brand_essence?: string | null
          brand_tone?: string | null
          brandbook_file_name?: string | null
          brandbook_url?: string | null
          client_name: string
          client_type?: string | null
          content_pillars?: string[] | null
          created_at?: string
          hashtag_groups?: Json | null
          id?: string
          industry?: string | null
          notes?: string | null
          posting_frequency?: string | null
          preferred_networks?: string[] | null
          reference_accounts?: string | null
          restrictions?: string | null
          target_audience?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          brand_essence?: string | null
          brand_tone?: string | null
          brandbook_file_name?: string | null
          brandbook_url?: string | null
          client_name?: string
          client_type?: string | null
          content_pillars?: string[] | null
          created_at?: string
          hashtag_groups?: Json | null
          id?: string
          industry?: string | null
          notes?: string | null
          posting_frequency?: string | null
          preferred_networks?: string[] | null
          reference_accounts?: string | null
          restrictions?: string | null
          target_audience?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          client_name: string
          closed_date: string | null
          contact_name: string | null
          created_at: string
          description: string | null
          estimated_start_date: string | null
          estimated_value: number | null
          id: string
          name: string
          notes: string | null
          responsible_id: string | null
          responsible_name: string | null
          source: string | null
          stage: string
          updated_at: string
        }
        Insert: {
          client_name: string
          closed_date?: string | null
          contact_name?: string | null
          created_at?: string
          description?: string | null
          estimated_start_date?: string | null
          estimated_value?: number | null
          id?: string
          name: string
          notes?: string | null
          responsible_id?: string | null
          responsible_name?: string | null
          source?: string | null
          stage?: string
          updated_at?: string
        }
        Update: {
          client_name?: string
          closed_date?: string | null
          contact_name?: string | null
          created_at?: string
          description?: string | null
          estimated_start_date?: string | null
          estimated_value?: number | null
          id?: string
          name?: string
          notes?: string | null
          responsible_id?: string | null
          responsible_name?: string | null
          source?: string | null
          stage?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      gto_deliverables: {
        Row: {
          consultant_name: string | null
          created_at: string
          created_by: string | null
          deliverable_type: string
          delivered_at: string | null
          dependencia_id: string | null
          file_name: string | null
          file_url: string | null
          generated_content: Json | null
          id: string
          notes: string | null
          period_month: number
          period_year: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          consultant_name?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_type: string
          delivered_at?: string | null
          dependencia_id?: string | null
          file_name?: string | null
          file_url?: string | null
          generated_content?: Json | null
          id?: string
          notes?: string | null
          period_month: number
          period_year: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          consultant_name?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_type?: string
          delivered_at?: string | null
          dependencia_id?: string | null
          file_name?: string | null
          file_url?: string | null
          generated_content?: Json | null
          id?: string
          notes?: string | null
          period_month?: number
          period_year?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gto_dependencias: {
        Row: {
          access_code: string
          contacto_email: string | null
          contacto_enlace: string | null
          contacto_telefono: string | null
          created_at: string
          id: string
          nombre: string
          siglas: string
          sort_order: number
        }
        Insert: {
          access_code: string
          contacto_email?: string | null
          contacto_enlace?: string | null
          contacto_telefono?: string | null
          created_at?: string
          id?: string
          nombre: string
          siglas: string
          sort_order?: number
        }
        Update: {
          access_code?: string
          contacto_email?: string | null
          contacto_enlace?: string | null
          contacto_telefono?: string | null
          created_at?: string
          id?: string
          nombre?: string
          siglas?: string
          sort_order?: number
        }
        Relationships: []
      }
      gto_diagnostico_textos: {
        Row: {
          analizado_at: string | null
          created_at: string
          errores_detectados: Json | null
          id: string
          participante_id: string | null
          participante_nombre: string | null
          resumen_diagnostico: string | null
          score_calidad: number | null
          sesion_id: string
          texto_original: string
          titulo: string | null
        }
        Insert: {
          analizado_at?: string | null
          created_at?: string
          errores_detectados?: Json | null
          id?: string
          participante_id?: string | null
          participante_nombre?: string | null
          resumen_diagnostico?: string | null
          score_calidad?: number | null
          sesion_id: string
          texto_original: string
          titulo?: string | null
        }
        Update: {
          analizado_at?: string | null
          created_at?: string
          errores_detectados?: Json | null
          id?: string
          participante_id?: string | null
          participante_nombre?: string | null
          resumen_diagnostico?: string | null
          score_calidad?: number | null
          sesion_id?: string
          texto_original?: string
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gto_diagnostico_textos_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "gto_participantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gto_diagnostico_textos_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "gto_sesiones"
            referencedColumns: ["id"]
          },
        ]
      }
      gto_mcn_scores: {
        Row: {
          analisis_riesgos: number | null
          areas_mejora: string | null
          computed_by: string | null
          coordinacion: number | null
          created_at: string
          created_by: string | null
          dependencia_id: string
          deteccion_temprana: number | null
          fortalezas: string | null
          id: string
          observaciones: Json | null
          period_month: number
          period_year: number
          tiempo_respuesta: number | null
          trazabilidad: number | null
          updated_at: string
        }
        Insert: {
          analisis_riesgos?: number | null
          areas_mejora?: string | null
          computed_by?: string | null
          coordinacion?: number | null
          created_at?: string
          created_by?: string | null
          dependencia_id: string
          deteccion_temprana?: number | null
          fortalezas?: string | null
          id?: string
          observaciones?: Json | null
          period_month: number
          period_year: number
          tiempo_respuesta?: number | null
          trazabilidad?: number | null
          updated_at?: string
        }
        Update: {
          analisis_riesgos?: number | null
          areas_mejora?: string | null
          computed_by?: string | null
          coordinacion?: number | null
          created_at?: string
          created_by?: string | null
          dependencia_id?: string
          deteccion_temprana?: number | null
          fortalezas?: string | null
          id?: string
          observaciones?: Json | null
          period_month?: number
          period_year?: number
          tiempo_respuesta?: number | null
          trazabilidad?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      gto_participantes: {
        Row: {
          cargo: string | null
          created_at: string
          email: string | null
          id: string
          nombre: string
          prompt_enviado: boolean
          sesion_id: string
          ultima_actividad: string
          ultimo_paso: number
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nombre: string
          prompt_enviado?: boolean
          sesion_id: string
          ultima_actividad?: string
          ultimo_paso?: number
        }
        Update: {
          cargo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nombre?: string
          prompt_enviado?: boolean
          sesion_id?: string
          ultima_actividad?: string
          ultimo_paso?: number
        }
        Relationships: [
          {
            foreignKeyName: "gto_participantes_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "gto_sesiones"
            referencedColumns: ["id"]
          },
        ]
      }
      gto_sesiones: {
        Row: {
          brief_audiencias: Json | null
          brief_mensajes_clave: Json | null
          brief_mision: string | null
          brief_terminos_preferidos: Json | null
          brief_terminos_prohibidos: Json | null
          brief_tipo_texto: string | null
          brief_tono: string | null
          completed_at: string | null
          compromiso_corpus_subido: boolean
          compromiso_prompt_probado: boolean
          compromiso_resultado_compartido: boolean
          corpus_documentos: Json | null
          corpus_notas: string | null
          created_at: string
          dependencia_id: string
          estado: string
          herramienta_ia: string | null
          id: string
          notas_kimedia: string | null
          paso_actual: number
          prompt_generado_at: string | null
          prompt_sistema: string | null
          titular_cargo: string | null
          titular_nombre: string | null
          updated_at: string
        }
        Insert: {
          brief_audiencias?: Json | null
          brief_mensajes_clave?: Json | null
          brief_mision?: string | null
          brief_terminos_preferidos?: Json | null
          brief_terminos_prohibidos?: Json | null
          brief_tipo_texto?: string | null
          brief_tono?: string | null
          completed_at?: string | null
          compromiso_corpus_subido?: boolean
          compromiso_prompt_probado?: boolean
          compromiso_resultado_compartido?: boolean
          corpus_documentos?: Json | null
          corpus_notas?: string | null
          created_at?: string
          dependencia_id: string
          estado?: string
          herramienta_ia?: string | null
          id?: string
          notas_kimedia?: string | null
          paso_actual?: number
          prompt_generado_at?: string | null
          prompt_sistema?: string | null
          titular_cargo?: string | null
          titular_nombre?: string | null
          updated_at?: string
        }
        Update: {
          brief_audiencias?: Json | null
          brief_mensajes_clave?: Json | null
          brief_mision?: string | null
          brief_terminos_preferidos?: Json | null
          brief_terminos_prohibidos?: Json | null
          brief_tipo_texto?: string | null
          brief_tono?: string | null
          completed_at?: string | null
          compromiso_corpus_subido?: boolean
          compromiso_prompt_probado?: boolean
          compromiso_resultado_compartido?: boolean
          corpus_documentos?: Json | null
          corpus_notas?: string | null
          created_at?: string
          dependencia_id?: string
          estado?: string
          herramienta_ia?: string | null
          id?: string
          notas_kimedia?: string | null
          paso_actual?: number
          prompt_generado_at?: string | null
          prompt_sistema?: string | null
          titular_cargo?: string | null
          titular_nombre?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gto_sesiones_dependencia_id_fkey"
            columns: ["dependencia_id"]
            isOneToOne: true
            referencedRelation: "gto_dependencias"
            referencedColumns: ["id"]
          },
        ]
      }
      gto_training_sessions: {
        Row: {
          ai_extracted: Json | null
          ai_extracted_at: string | null
          attendee_count: number | null
          attendees: Json | null
          created_at: string
          created_by: string | null
          dependencia_id: string
          duration_minutes: number | null
          facilitator: string | null
          fireflies_meeting_id: string | null
          fireflies_url: string | null
          id: string
          modality: string | null
          notes: string | null
          objective: string | null
          result_description: string | null
          result_type: string | null
          sesion_id: string | null
          session_date: string
          session_type: string
          topic: string | null
          transcript_summary: string | null
          transcript_text: string | null
          updated_at: string
        }
        Insert: {
          ai_extracted?: Json | null
          ai_extracted_at?: string | null
          attendee_count?: number | null
          attendees?: Json | null
          created_at?: string
          created_by?: string | null
          dependencia_id: string
          duration_minutes?: number | null
          facilitator?: string | null
          fireflies_meeting_id?: string | null
          fireflies_url?: string | null
          id?: string
          modality?: string | null
          notes?: string | null
          objective?: string | null
          result_description?: string | null
          result_type?: string | null
          sesion_id?: string | null
          session_date?: string
          session_type?: string
          topic?: string | null
          transcript_summary?: string | null
          transcript_text?: string | null
          updated_at?: string
        }
        Update: {
          ai_extracted?: Json | null
          ai_extracted_at?: string | null
          attendee_count?: number | null
          attendees?: Json | null
          created_at?: string
          created_by?: string | null
          dependencia_id?: string
          duration_minutes?: number | null
          facilitator?: string | null
          fireflies_meeting_id?: string | null
          fireflies_url?: string | null
          id?: string
          modality?: string | null
          notes?: string | null
          objective?: string | null
          result_description?: string | null
          result_type?: string | null
          sesion_id?: string | null
          session_date?: string
          session_type?: string
          topic?: string | null
          transcript_summary?: string | null
          transcript_text?: string | null
          updated_at?: string
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
      interactions: {
        Row: {
          client_name: string
          contact_name: string
          created_at: string
          follow_up_date: string | null
          follow_up_done: boolean
          id: string
          interaction_type: string
          logged_by: string | null
          notes: string | null
          outcome: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          client_name: string
          contact_name: string
          created_at?: string
          follow_up_date?: string | null
          follow_up_done?: boolean
          id?: string
          interaction_type?: string
          logged_by?: string | null
          notes?: string | null
          outcome?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          client_name?: string
          contact_name?: string
          created_at?: string
          follow_up_date?: string | null
          follow_up_done?: boolean
          id?: string
          interaction_type?: string
          logged_by?: string | null
          notes?: string | null
          outcome?: string | null
          subject?: string
          updated_at?: string
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
