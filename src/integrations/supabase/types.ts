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
          client_id: string | null
          completed_at: string | null
          created_at: string
          description: string
          due_date: string | null
          id: string
          minute_id: string | null
          notes: string | null
          objective_id: string | null
          priority: string
          responsible_id: string | null
          responsible_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category?: string
          client?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          minute_id?: string | null
          notes?: string | null
          objective_id?: string | null
          priority?: string
          responsible_id?: string | null
          responsible_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          client?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          minute_id?: string | null
          notes?: string | null
          objective_id?: string | null
          priority?: string
          responsible_id?: string | null
          responsible_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_minute_id_fkey"
            columns: ["minute_id"]
            isOneToOne: false
            referencedRelation: "minutes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "client_objectives"
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
      ads_proposal_performance: {
        Row: {
          clicks: number | null
          client_id: string
          conversions: number | null
          cpc: number | null
          cpm: number | null
          created_at: string
          ctr: number | null
          currency: string | null
          id: string
          impressions: number | null
          notes: string | null
          period_end: string | null
          period_start: string | null
          platform: string
          proposal_id: string | null
          raw_metrics: Json | null
          reach: number | null
          roas: number | null
          spend: number | null
        }
        Insert: {
          clicks?: number | null
          client_id: string
          conversions?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          ctr?: number | null
          currency?: string | null
          id?: string
          impressions?: number | null
          notes?: string | null
          period_end?: string | null
          period_start?: string | null
          platform: string
          proposal_id?: string | null
          raw_metrics?: Json | null
          reach?: number | null
          roas?: number | null
          spend?: number | null
        }
        Update: {
          clicks?: number | null
          client_id?: string
          conversions?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          ctr?: number | null
          currency?: string | null
          id?: string
          impressions?: number | null
          notes?: string | null
          period_end?: string | null
          period_start?: string | null
          platform?: string
          proposal_id?: string | null
          raw_metrics?: Json | null
          reach?: number | null
          roas?: number | null
          spend?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_proposal_performance_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_proposal_performance_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "ads_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      ads_proposals: {
        Row: {
          approved_at: string | null
          budget_currency: string | null
          budget_total: number | null
          business_objective: string | null
          campaign_objectives: string[] | null
          client_id: string
          created_at: string
          flight_end: string | null
          flight_start: string | null
          generated_at: string | null
          id: string
          internal_brief: Json | null
          platforms: string[]
          proposal_data: Json | null
          status: string
          target_audience_brief: string | null
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          budget_currency?: string | null
          budget_total?: number | null
          business_objective?: string | null
          campaign_objectives?: string[] | null
          client_id: string
          created_at?: string
          flight_end?: string | null
          flight_start?: string | null
          generated_at?: string | null
          id?: string
          internal_brief?: Json | null
          platforms?: string[]
          proposal_data?: Json | null
          status?: string
          target_audience_brief?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          budget_currency?: string | null
          budget_total?: number | null
          business_objective?: string | null
          campaign_objectives?: string[] | null
          client_id?: string
          created_at?: string
          flight_end?: string | null
          flight_start?: string | null
          generated_at?: string | null
          id?: string
          internal_brief?: Json | null
          platforms?: string[]
          proposal_data?: Json | null
          status?: string
          target_audience_brief?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
      client_access: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_access_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
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
      client_corpus: {
        Row: {
          client_id: string
          content: string | null
          created_at: string
          entry_type: string
          file_name: string | null
          file_url: string | null
          id: string
          source_reference: string | null
          source_url: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          content?: string | null
          created_at?: string
          entry_type: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          source_reference?: string | null
          source_url?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          content?: string | null
          created_at?: string
          entry_type?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          source_reference?: string | null
          source_url?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_corpus_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_objectives: {
        Row: {
          business_unit: string | null
          client_id: string | null
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
          client_id?: string | null
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
          client_id?: string | null
          client_name?: string
          created_at?: string
          id?: string
          main_activities?: string | null
          objective_text?: string
          priority?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_objectives_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_attachments: {
        Row: {
          created_at: string
          file_name: string
          id: string
          mime_type: string | null
          report_id: string
          size_bytes: number | null
          storage_path: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          mime_type?: string | null
          report_id: string
          size_bytes?: number | null
          storage_path: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          report_id?: string
          size_bytes?: number | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_attachments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "client_portal_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_benchmark_competitors: {
        Row: {
          active: boolean
          brand_color: string
          client_id: string
          created_at: string
          external_url: string | null
          handle: string | null
          id: string
          image_url: string | null
          is_client: boolean
          is_default: boolean
          name: string
          network: string
          platform: string
          profile_external_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          brand_color?: string
          client_id: string
          created_at?: string
          external_url?: string | null
          handle?: string | null
          id?: string
          image_url?: string | null
          is_client?: boolean
          is_default?: boolean
          name: string
          network?: string
          platform?: string
          profile_external_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          brand_color?: string
          client_id?: string
          created_at?: string
          external_url?: string | null
          handle?: string | null
          id?: string
          image_url?: string | null
          is_client?: boolean
          is_default?: boolean
          name?: string
          network?: string
          platform?: string
          profile_external_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_benchmark_competitors_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_benchmark_follower_daily: {
        Row: {
          client_id: string
          competitor_id: string
          created_at: string
          day: string
          delta: number
          id: string
          network: string
          period_id: string
        }
        Insert: {
          client_id: string
          competitor_id: string
          created_at?: string
          day: string
          delta?: number
          id?: string
          network: string
          period_id: string
        }
        Update: {
          client_id?: string
          competitor_id?: string
          created_at?: string
          day?: string
          delta?: number
          id?: string
          network?: string
          period_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_benchmark_follower_daily_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_benchmark_follower_daily_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "client_portal_benchmark_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_benchmark_follower_daily_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "client_portal_benchmark_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_benchmark_metrics: {
        Row: {
          client_id: string
          competitor_id: string
          created_at: string
          engagement_rate: number | null
          follower_growth_rate: number | null
          followers: number | null
          id: string
          interaction_per_impression: number | null
          network: string
          performance_index: number | null
          period_id: string
          posts_per_day: number | null
          raw: Json | null
          reach_per_day: number | null
        }
        Insert: {
          client_id: string
          competitor_id: string
          created_at?: string
          engagement_rate?: number | null
          follower_growth_rate?: number | null
          followers?: number | null
          id?: string
          interaction_per_impression?: number | null
          network: string
          performance_index?: number | null
          period_id: string
          posts_per_day?: number | null
          raw?: Json | null
          reach_per_day?: number | null
        }
        Update: {
          client_id?: string
          competitor_id?: string
          created_at?: string
          engagement_rate?: number | null
          follower_growth_rate?: number | null
          followers?: number | null
          id?: string
          interaction_per_impression?: number | null
          network?: string
          performance_index?: number | null
          period_id?: string
          posts_per_day?: number | null
          raw?: Json | null
          reach_per_day?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_benchmark_metrics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_benchmark_metrics_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "client_portal_benchmark_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_benchmark_metrics_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "client_portal_benchmark_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_benchmark_narratives: {
        Row: {
          client_id: string
          competitor_id: string | null
          generated_at: string
          id: string
          model: string | null
          narratives: Json
          network: string
          posts_sampled: number
          profile_name: string
          range_end: string
          range_start: string
        }
        Insert: {
          client_id: string
          competitor_id?: string | null
          generated_at?: string
          id?: string
          model?: string | null
          narratives?: Json
          network: string
          posts_sampled?: number
          profile_name: string
          range_end: string
          range_start: string
        }
        Update: {
          client_id?: string
          competitor_id?: string | null
          generated_at?: string
          id?: string
          model?: string | null
          narratives?: Json
          network?: string
          posts_sampled?: number
          profile_name?: string
          range_end?: string
          range_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_benchmark_narratives_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_benchmark_narratives_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "client_portal_benchmark_competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_benchmark_periods: {
        Row: {
          client_id: string
          created_at: string
          id: string
          notes: string | null
          period_end: string
          period_label: string
          period_start: string
          period_type: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          notes?: string | null
          period_end: string
          period_label: string
          period_start: string
          period_type?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          period_end?: string
          period_label?: string
          period_start?: string
          period_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_benchmark_periods_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_benchmark_posts: {
        Row: {
          client_id: string
          comments: number | null
          competitor_id: string | null
          created_at: string
          engagement_rate: number | null
          id: string
          image_link: string | null
          interaction_per_impression: number | null
          interactions: number | null
          likes: number | null
          link: string | null
          message: string | null
          message_external_id: string | null
          network: string
          period_id: string
          posted_at: string | null
          profile_name: string
          raw: Json | null
          reach: number | null
        }
        Insert: {
          client_id: string
          comments?: number | null
          competitor_id?: string | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          image_link?: string | null
          interaction_per_impression?: number | null
          interactions?: number | null
          likes?: number | null
          link?: string | null
          message?: string | null
          message_external_id?: string | null
          network: string
          period_id: string
          posted_at?: string | null
          profile_name: string
          raw?: Json | null
          reach?: number | null
        }
        Update: {
          client_id?: string
          comments?: number | null
          competitor_id?: string | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          image_link?: string | null
          interaction_per_impression?: number | null
          interactions?: number | null
          likes?: number | null
          link?: string | null
          message?: string | null
          message_external_id?: string | null
          network?: string
          period_id?: string
          posted_at?: string | null
          profile_name?: string
          raw?: Json | null
          reach?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_benchmark_posts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_benchmark_posts_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "client_portal_benchmark_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_benchmark_posts_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "client_portal_benchmark_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_benchmark_uploads: {
        Row: {
          client_id: string
          created_at: string
          file_name: string
          id: string
          period_id: string
          row_count: number
          upload_type: string
          uploaded_by: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          file_name: string
          id?: string
          period_id: string
          row_count?: number
          upload_type: string
          uploaded_by?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          file_name?: string
          id?: string
          period_id?: string
          row_count?: number
          upload_type?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_benchmark_uploads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_benchmark_uploads_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "client_portal_benchmark_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_credentials: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          portal_email: string | null
          portal_user_id: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          portal_email?: string | null
          portal_user_id?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          portal_email?: string | null
          portal_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_credentials_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_datasets: {
        Row: {
          client_id: string
          created_at: string
          file_name: string | null
          id: string
          mime_type: string | null
          notes: string | null
          parsed_data: Json
          period_end: string
          period_start: string
          platform: string | null
          size_bytes: number | null
          source: Database["public"]["Enums"]["portal_dataset_source"]
          storage_path: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          file_name?: string | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          parsed_data?: Json
          period_end: string
          period_start: string
          platform?: string | null
          size_bytes?: number | null
          source: Database["public"]["Enums"]["portal_dataset_source"]
          storage_path?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          file_name?: string | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          parsed_data?: Json
          period_end?: string
          period_start?: string
          platform?: string | null
          size_bytes?: number | null
          source?: Database["public"]["Enums"]["portal_dataset_source"]
          storage_path?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_datasets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_listening_analyses: {
        Row: {
          alerts: Json | null
          client_id: string
          created_at: string
          entries_count: number
          executive_summary: string | null
          generated_by: string | null
          id: string
          key_findings: Json | null
          recommendations_client: string | null
          recommendations_team: string | null
          sentiment_breakdown: Json | null
          top_mentions: Json | null
          top_topics: Json | null
          updated_at: string
          week_end: string
          week_start: string
        }
        Insert: {
          alerts?: Json | null
          client_id: string
          created_at?: string
          entries_count?: number
          executive_summary?: string | null
          generated_by?: string | null
          id?: string
          key_findings?: Json | null
          recommendations_client?: string | null
          recommendations_team?: string | null
          sentiment_breakdown?: Json | null
          top_mentions?: Json | null
          top_topics?: Json | null
          updated_at?: string
          week_end: string
          week_start: string
        }
        Update: {
          alerts?: Json | null
          client_id?: string
          created_at?: string
          entries_count?: number
          executive_summary?: string | null
          generated_by?: string | null
          id?: string
          key_findings?: Json | null
          recommendations_client?: string | null
          recommendations_team?: string | null
          sentiment_breakdown?: Json | null
          top_mentions?: Json | null
          top_topics?: Json | null
          updated_at?: string
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_listening_analyses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_listening_analysis_jobs: {
        Row: {
          client_id: string
          created_at: string
          error_message: string | null
          id: string
          period_end: string
          period_start: string
          result: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          period_end: string
          period_start: string
          result?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          period_end?: string
          period_start?: string
          result?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_listening_analysis_jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_listening_entries: {
        Row: {
          actors: string[] | null
          analyzed_at: string | null
          channels: Json | null
          client_id: string
          competitors: Json | null
          content_md: string
          created_at: string
          created_by: string | null
          entities: Json | null
          entry_date: string
          events: Json | null
          id: string
          key_quotes: Json | null
          media_mentions: Json
          mentions: Json | null
          raw_source_ref: string | null
          sentiment: string | null
          sentiment_counts: Json | null
          sentiment_score: number | null
          social_mentions: Json
          source: string
          summary: string | null
          topics: string[] | null
          total_mentions: number | null
          updated_at: string
          urgency: string | null
        }
        Insert: {
          actors?: string[] | null
          analyzed_at?: string | null
          channels?: Json | null
          client_id: string
          competitors?: Json | null
          content_md: string
          created_at?: string
          created_by?: string | null
          entities?: Json | null
          entry_date: string
          events?: Json | null
          id?: string
          key_quotes?: Json | null
          media_mentions?: Json
          mentions?: Json | null
          raw_source_ref?: string | null
          sentiment?: string | null
          sentiment_counts?: Json | null
          sentiment_score?: number | null
          social_mentions?: Json
          source?: string
          summary?: string | null
          topics?: string[] | null
          total_mentions?: number | null
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          actors?: string[] | null
          analyzed_at?: string | null
          channels?: Json | null
          client_id?: string
          competitors?: Json | null
          content_md?: string
          created_at?: string
          created_by?: string | null
          entities?: Json | null
          entry_date?: string
          events?: Json | null
          id?: string
          key_quotes?: Json | null
          media_mentions?: Json
          mentions?: Json | null
          raw_source_ref?: string | null
          sentiment?: string | null
          sentiment_counts?: Json | null
          sentiment_score?: number | null
          social_mentions?: Json
          source?: string
          summary?: string | null
          topics?: string[] | null
          total_mentions?: number | null
          updated_at?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_listening_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_reports: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          report_date: string
          summary_md: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          report_date: string
          summary_md?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          report_date?: string
          summary_md?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_strategy_reports: {
        Row: {
          client_id: string
          generated_at: string
          id: string
          model: string | null
          payload: Json
          range_end: string
          range_start: string
        }
        Insert: {
          client_id: string
          generated_at?: string
          id?: string
          model?: string | null
          payload?: Json
          range_end: string
          range_start: string
        }
        Update: {
          client_id?: string
          generated_at?: string
          id?: string
          model?: string | null
          payload?: Json
          range_end?: string
          range_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_strategy_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_weekly_recommendations: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          for_client_md: string | null
          for_team_md: string | null
          id: string
          priority: string
          updated_at: string
          week_start: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          for_client_md?: string | null
          for_team_md?: string | null
          id?: string
          priority?: string
          updated_at?: string
          week_start: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          for_client_md?: string | null
          for_team_md?: string | null
          id?: string
          priority?: string
          updated_at?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_weekly_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
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
      client_weekly_status: {
        Row: {
          client_id: string
          id: string
          proximo_hito: string | null
          riesgo_activo: string | null
          semaforo: string
          source: string
          updated_at: string
          updated_by: string | null
          week_start: string
        }
        Insert: {
          client_id: string
          id?: string
          proximo_hito?: string | null
          riesgo_activo?: string | null
          semaforo?: string
          source?: string
          updated_at?: string
          updated_by?: string | null
          week_start: string
        }
        Update: {
          client_id?: string
          id?: string
          proximo_hito?: string | null
          riesgo_activo?: string | null
          semaforo?: string
          source?: string
          updated_at?: string
          updated_by?: string | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_weekly_status_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          aliases: string[]
          client_type: string
          created_at: string
          id: string
          industry: string | null
          is_active: boolean
          is_probono: boolean
          logo_url: string | null
          name: string
          notes: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          aliases?: string[]
          client_type?: string
          created_at?: string
          id?: string
          industry?: string | null
          is_active?: boolean
          is_probono?: boolean
          logo_url?: string | null
          name: string
          notes?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          aliases?: string[]
          client_type?: string
          created_at?: string
          id?: string
          industry?: string | null
          is_active?: boolean
          is_probono?: boolean
          logo_url?: string | null
          name?: string
          notes?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
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
          client_id: string | null
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
          client_id?: string | null
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
          client_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "content_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          client_id: string | null
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
          client_id?: string | null
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
          client_id?: string | null
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
            foreignKeyName: "deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      fireflies_filter_rules: {
        Row: {
          client_name: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          match_field: string | null
          notes: string | null
          pattern: string
          rule_type: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          match_field?: string | null
          notes?: string | null
          pattern: string
          rule_type: string
        }
        Update: {
          client_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          match_field?: string | null
          notes?: string | null
          pattern?: string
          rule_type?: string
        }
        Relationships: []
      }
      fireflies_meetings: {
        Row: {
          assigned_client: string | null
          created_at: string
          duration_seconds: number | null
          exclusion_reason: string | null
          fireflies_id: string
          host_email: string | null
          id: string
          imported_minute_id: string | null
          matched_rule_id: string | null
          meeting_date: string | null
          organizer_email: string | null
          participants: string[] | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          suggested_client: string | null
          summary_overview: string | null
          summary_short: string | null
          title: string
          transcript_url: string | null
          updated_at: string
        }
        Insert: {
          assigned_client?: string | null
          created_at?: string
          duration_seconds?: number | null
          exclusion_reason?: string | null
          fireflies_id: string
          host_email?: string | null
          id?: string
          imported_minute_id?: string | null
          matched_rule_id?: string | null
          meeting_date?: string | null
          organizer_email?: string | null
          participants?: string[] | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          suggested_client?: string | null
          summary_overview?: string | null
          summary_short?: string | null
          title: string
          transcript_url?: string | null
          updated_at?: string
        }
        Update: {
          assigned_client?: string | null
          created_at?: string
          duration_seconds?: number | null
          exclusion_reason?: string | null
          fireflies_id?: string
          host_email?: string | null
          id?: string
          imported_minute_id?: string | null
          matched_rule_id?: string | null
          meeting_date?: string | null
          organizer_email?: string | null
          participants?: string[] | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          suggested_client?: string | null
          summary_overview?: string | null
          summary_short?: string | null
          title?: string
          transcript_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gto_access_log: {
        Row: {
          code_attempt: string | null
          created_at: string
          id: string
          ip: string | null
          reason: string | null
          success: boolean
        }
        Insert: {
          code_attempt?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          reason?: string | null
          success?: boolean
        }
        Update: {
          code_attempt?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          reason?: string | null
          success?: boolean
        }
        Relationships: []
      }
      gto_corpus_uploads: {
        Row: {
          created_at: string
          doc_tipo: string
          file_name: string
          file_size: number | null
          id: string
          mime_type: string | null
          participante_id: string
          sesion_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          doc_tipo: string
          file_name: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          participante_id: string
          sesion_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          doc_tipo?: string
          file_name?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          participante_id?: string
          sesion_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "gto_corpus_uploads_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "gto_participantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gto_corpus_uploads_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "gto_sesiones"
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
          computed_at: string | null
          computed_by: string | null
          coordinacion: number | null
          created_at: string
          created_by: string | null
          dependencia_id: string
          deteccion_temprana: number | null
          evidence: Json | null
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
          computed_at?: string | null
          computed_by?: string | null
          coordinacion?: number | null
          created_at?: string
          created_by?: string | null
          dependencia_id: string
          deteccion_temprana?: number | null
          evidence?: Json | null
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
          computed_at?: string | null
          computed_by?: string | null
          coordinacion?: number | null
          created_at?: string
          created_by?: string | null
          dependencia_id?: string
          deteccion_temprana?: number | null
          evidence?: Json | null
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
          client_id: string | null
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
          client_id?: string | null
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
          client_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "interactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      minutes: {
        Row: {
          created_at: string
          file_name: string | null
          fireflies_meeting_id: string | null
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
          fireflies_meeting_id?: string | null
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
          fireflies_meeting_id?: string | null
          id?: string
          meeting_date?: string
          parsed?: boolean
          raw_text?: string | null
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "minutes_fireflies_meeting_id_fkey"
            columns: ["fireflies_meeting_id"]
            isOneToOne: false
            referencedRelation: "fireflies_meetings"
            referencedColumns: ["id"]
          },
        ]
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
      webinar_coach_outputs: {
        Row: {
          audiencia: string | null
          causa_social: string
          created_at: string
          estilo: string | null
          evento: string
          id: string
          mensaje_clave: string | null
          output: Json
          registration_id: string | null
        }
        Insert: {
          audiencia?: string | null
          causa_social: string
          created_at?: string
          estilo?: string | null
          evento?: string
          id?: string
          mensaje_clave?: string | null
          output: Json
          registration_id?: string | null
        }
        Update: {
          audiencia?: string | null
          causa_social?: string
          created_at?: string
          estilo?: string | null
          evento?: string
          id?: string
          mensaje_clave?: string | null
          output?: Json
          registration_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webinar_coach_outputs_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "webinar_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      webinar_registrations: {
        Row: {
          created_at: string
          email: string
          evento: string
          fuente: string | null
          id: string
          metadata: Json | null
          nombre: string
          redes: string | null
        }
        Insert: {
          created_at?: string
          email: string
          evento?: string
          fuente?: string | null
          id?: string
          metadata?: Json | null
          nombre: string
          redes?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          evento?: string
          fuente?: string | null
          id?: string
          metadata?: Json | null
          nombre?: string
          redes?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      client_portal_weekly_recommendations_public: {
        Row: {
          client_id: string | null
          created_at: string | null
          for_client_md: string | null
          id: string | null
          priority: string | null
          updated_at: string | null
          week_start: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          for_client_md?: string | null
          id?: string | null
          priority?: string | null
          updated_at?: string | null
          week_start?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          for_client_md?: string | null
          id?: string | null
          priority?: string | null
          updated_at?: string | null
          week_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_weekly_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      fpk_to_num: { Args: { v: string }; Returns: number }
      get_brand_kit_by_token: {
        Args: { _id: string; _token: string }
        Returns: {
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
        }[]
        SetofOptions: {
          from: "*"
          to: "brand_kit_profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      gto_bootstrap_session: {
        Args: { _participante_id: string; _sesion_id: string }
        Returns: Json
      }
      gto_delete_corpus_upload: {
        Args: { _participante_id: string; _upload_id: string }
        Returns: {
          storage_path: string
        }[]
      }
      gto_insert_diagnostico: {
        Args: {
          _errores_detectados: Json
          _participante_id: string
          _participante_nombre: string
          _resumen_diagnostico: string
          _score_calidad: number
          _sesion_id: string
          _texto_original: string
          _titulo: string
        }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "gto_diagnostico_textos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      gto_list_corpus_uploads: {
        Args: { _participante_id: string }
        Returns: {
          created_at: string
          doc_tipo: string
          file_name: string
          file_size: number
          id: string
          mime_type: string
          participante_id: string
          sesion_id: string
          storage_path: string
        }[]
      }
      gto_list_diagnosticos: {
        Args: { _participante_id: string; _sesion_id: string }
        Returns: {
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
        }[]
        SetofOptions: {
          from: "*"
          to: "gto_diagnostico_textos"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      gto_update_participante_progress: {
        Args: {
          _participante_id: string
          _sesion_id: string
          _ultimo_paso?: number
        }
        Returns: undefined
      }
      gto_update_sesion: {
        Args: { _participante_id: string; _patch: Json; _sesion_id: string }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "gto_sesiones"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      gto_validate_access_code: { Args: { _code: string }; Returns: Json }
      has_client_access: {
        Args: { _client_id: string; _user_id: string }
        Returns: boolean
      }
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
      app_role: "admin" | "user" | "client_viewer"
      portal_dataset_source:
        | "fanpage_karma"
        | "meta_ads"
        | "x_ads"
        | "tiktok_ads"
        | "google_ads"
        | "screenshot"
        | "other"
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
      app_role: ["admin", "user", "client_viewer"],
      portal_dataset_source: [
        "fanpage_karma",
        "meta_ads",
        "x_ads",
        "tiktok_ads",
        "google_ads",
        "screenshot",
        "other",
      ],
    },
  },
} as const
