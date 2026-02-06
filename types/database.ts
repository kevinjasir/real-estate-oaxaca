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
      agent_assignments: {
        Row: {
          agent_id: string
          assigned_at: string
          assigned_by: string | null
          id: string
          lot_id: string | null
          notes: string | null
          project_id: string | null
        }
        Insert: {
          agent_id: string
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          lot_id?: string | null
          notes?: string | null
          project_id?: string | null
        }
        Update: {
          agent_id?: string
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          lot_id?: string | null
          notes?: string | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_sales_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "agent_sales_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_assignments_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          lead_id: string
          lot_id: string | null
          project_id: string
          promoter_id: string
          status: Database["public"]["Enums"]["appointment_status_enum"] | null
          time: string
        }
        Insert: {
          created_at?: string | null
          date: string
          duration_minutes?: number | null
          id?: string
          lead_id: string
          lot_id?: string | null
          project_id: string
          promoter_id: string
          status?: Database["public"]["Enums"]["appointment_status_enum"] | null
          time: string
        }
        Update: {
          created_at?: string | null
          date?: string
          duration_minutes?: number | null
          id?: string
          lead_id?: string
          lot_id?: string | null
          project_id?: string
          promoter_id?: string
          status?: Database["public"]["Enums"]["appointment_status_enum"] | null
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_promoter_id_fkey"
            columns: ["promoter_id"]
            isOneToOne: false
            referencedRelation: "promoters"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          new_value: Json | null
          old_value: Json | null
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          performed_by?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          active: boolean | null
          id: string
          name: string
          state_id: string
        }
        Insert: {
          active?: boolean | null
          id?: string
          name: string
          state_id: string
        }
        Update: {
          active?: boolean | null
          id?: string
          name?: string
          state_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          active: boolean
          agent_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_system_commission: boolean
          lot_id: string | null
          name: string
          priority: number
          project_id: string | null
          scope: Database["public"]["Enums"]["commission_scope"]
          type: Database["public"]["Enums"]["commission_type"]
          updated_at: string
          valid_from: string | null
          valid_until: string | null
          value: number
        }
        Insert: {
          active?: boolean
          agent_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_system_commission?: boolean
          lot_id?: string | null
          name: string
          priority?: number
          project_id?: string | null
          scope?: Database["public"]["Enums"]["commission_scope"]
          type?: Database["public"]["Enums"]["commission_type"]
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          value: number
        }
        Update: {
          active?: boolean
          agent_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_system_commission?: boolean
          lot_id?: string | null
          name?: string
          priority?: number
          project_id?: string | null
          scope?: Database["public"]["Enums"]["commission_scope"]
          type?: Database["public"]["Enums"]["commission_type"]
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "commissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_sales_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "commissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "agent_sales_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "commissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      configurations: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          id: string
          scope: Database["public"]["Enums"]["config_scope_enum"]
          scope_id: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          id?: string
          scope: Database["public"]["Enums"]["config_scope_enum"]
          scope_id?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          id?: string
          scope?: Database["public"]["Enums"]["config_scope_enum"]
          scope_id?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: unknown
          message: string
          name: string
          phone: string | null
          read: boolean
          responded: boolean
          responded_at: string | null
          subject: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: unknown
          message: string
          name: string
          phone?: string | null
          read?: boolean
          responded?: boolean
          responded_at?: string | null
          subject?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown
          message?: string
          name?: string
          phone?: string | null
          read?: boolean
          responded?: boolean
          responded_at?: string | null
          subject?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      countries: {
        Row: {
          active: boolean | null
          id: string
          iso_code: string | null
          name: string
        }
        Insert: {
          active?: boolean | null
          id?: string
          iso_code?: string | null
          name: string
        }
        Update: {
          active?: boolean | null
          id?: string
          iso_code?: string | null
          name?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          active: boolean
          answer: string
          category: string | null
          created_at: string
          id: string
          order_index: number
          project_id: string | null
          question: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          order_index?: number
          project_id?: string | null
          question: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          order_index?: number
          project_id?: string | null
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faqs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_promoter_id: string | null
          assigned_to: string | null
          budget_max: number | null
          budget_min: number | null
          contacted_at: string | null
          converted_at: string | null
          created_at: string | null
          id: string
          interest_level:
            | Database["public"]["Enums"]["interest_level_enum"]
            | null
          internal_notes: string | null
          lot_id: string | null
          name: string | null
          phone: string
          project_id: string
          referrer_url: string | null
          source: Database["public"]["Enums"]["lead_source_enum"]
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          whatsapp: string | null
        }
        Insert: {
          assigned_promoter_id?: string | null
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          interest_level?:
            | Database["public"]["Enums"]["interest_level_enum"]
            | null
          internal_notes?: string | null
          lot_id?: string | null
          name?: string | null
          phone: string
          project_id: string
          referrer_url?: string | null
          source: Database["public"]["Enums"]["lead_source_enum"]
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp?: string | null
        }
        Update: {
          assigned_promoter_id?: string | null
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          interest_level?:
            | Database["public"]["Enums"]["interest_level_enum"]
            | null
          internal_notes?: string | null
          lot_id?: string | null
          name?: string | null
          phone?: string
          project_id?: string
          referrer_url?: string | null
          source?: Database["public"]["Enums"]["lead_source_enum"]
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_promoter_id_fkey"
            columns: ["assigned_promoter_id"]
            isOneToOne: false
            referencedRelation: "promoters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "agent_sales_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lots: {
        Row: {
          commission_override: number | null
          coordinates: Json | null
          created_at: string | null
          custom_label: string | null
          id: string
          lot_number: string
          price: number | null
          project_id: string
          size_m2: number | null
          status: Database["public"]["Enums"]["lot_status_enum"] | null
          updated_at: string | null
        }
        Insert: {
          commission_override?: number | null
          coordinates?: Json | null
          created_at?: string | null
          custom_label?: string | null
          id?: string
          lot_number: string
          price?: number | null
          project_id: string
          size_m2?: number | null
          status?: Database["public"]["Enums"]["lot_status_enum"] | null
          updated_at?: string | null
        }
        Update: {
          commission_override?: number | null
          coordinates?: Json | null
          created_at?: string | null
          custom_label?: string | null
          id?: string
          lot_number?: string
          price?: number | null
          project_id?: string
          size_m2?: number | null
          status?: Database["public"]["Enums"]["lot_status_enum"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          active: boolean | null
          created_at: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["media_entity_enum"]
          id: string
          type: Database["public"]["Enums"]["media_type_enum"]
          media_type: Database["public"]["Enums"]["media_type_enum"]
          order_index: number | null
          url: string
          source_url: string
          is_primary: boolean | null
          title: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["media_entity_enum"]
          id?: string
          type?: Database["public"]["Enums"]["media_type_enum"]
          media_type?: Database["public"]["Enums"]["media_type_enum"]
          order_index?: number | null
          url: string
          source_url?: string
          is_primary?: boolean | null
          title?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["media_entity_enum"]
          id?: string
          type?: Database["public"]["Enums"]["media_type_enum"]
          media_type?: Database["public"]["Enums"]["media_type_enum"]
          order_index?: number | null
          url?: string
          source_url?: string
          is_primary?: boolean | null
          title?: string | null
        }
        Relationships: []
      }
      project_promoters: {
        Row: {
          id: string
          project_id: string
          promoter_id: string
        }
        Insert: {
          id?: string
          project_id: string
          promoter_id: string
        }
        Update: {
          id?: string
          project_id?: string
          promoter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_promoters_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_promoters_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_promoters_promoter_id_fkey"
            columns: ["promoter_id"]
            isOneToOne: false
            referencedRelation: "promoters"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          address_text: string | null
          amenities: Json | null
          available_lots: number | null
          city: string | null
          city_id: string
          country_id: string
          created_at: string | null
          currency: string | null
          description: string | null
          featured: boolean | null
          features: Json | null
          google_maps_url: string | null
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          lot_numbering_format: string | null
          lot_size_from: number | null
          lot_size_to: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          postal_code: string | null
          price_from: number | null
          price_to: number | null
          published_at: string | null
          short_description: string | null
          slug: string
          state: string | null
          state_id: string
          status: Database["public"]["Enums"]["project_status_enum"] | null
          total_lots: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          address_text?: string | null
          amenities?: Json | null
          available_lots?: number | null
          city?: string | null
          city_id: string
          country_id: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          featured?: boolean | null
          features?: Json | null
          google_maps_url?: string | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          lot_numbering_format?: string | null
          lot_size_from?: number | null
          lot_size_to?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          postal_code?: string | null
          price_from?: number | null
          price_to?: number | null
          published_at?: string | null
          short_description?: string | null
          slug: string
          state?: string | null
          state_id: string
          status?: Database["public"]["Enums"]["project_status_enum"] | null
          total_lots?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          address_text?: string | null
          amenities?: Json | null
          available_lots?: number | null
          city?: string | null
          city_id?: string
          country_id?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          featured?: boolean | null
          features?: Json | null
          google_maps_url?: string | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          lot_numbering_format?: string | null
          lot_size_from?: number | null
          lot_size_to?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          postal_code?: string | null
          price_from?: number | null
          price_to?: number | null
          published_at?: string | null
          short_description?: string | null
          slug?: string
          state?: string | null
          state_id?: string
          status?: Database["public"]["Enums"]["project_status_enum"] | null
          total_lots?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      promoters: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["promoter_role_enum"] | null
          status: Database["public"]["Enums"]["promoter_status_enum"] | null
          working_hours: Json | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["promoter_role_enum"] | null
          status?: Database["public"]["Enums"]["promoter_status_enum"] | null
          working_hours?: Json | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["promoter_role_enum"] | null
          status?: Database["public"]["Enums"]["promoter_status_enum"] | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          agent_commission_amount: number
          agent_commission_percentage: number | null
          agent_id: string
          buyer_address: string | null
          buyer_curp: string | null
          buyer_email: string | null
          buyer_name: string
          buyer_phone: string | null
          buyer_rfc: string | null
          contract_number: string | null
          contract_signed_at: string | null
          created_at: string
          created_by: string | null
          currency: string
          deed_number: string | null
          deed_signed_at: string | null
          down_payment: number | null
          financing_months: number | null
          id: string
          internal_notes: string | null
          lead_id: string | null
          lot_id: string
          monthly_payment: number | null
          net_amount: number
          payment_status: Database["public"]["Enums"]["payment_status"]
          sale_date: string
          sale_price: number
          status: Database["public"]["Enums"]["sale_status"]
          system_commission_amount: number
          system_commission_percentage: number | null
          updated_at: string
        }
        Insert: {
          agent_commission_amount?: number
          agent_commission_percentage?: number | null
          agent_id: string
          buyer_address?: string | null
          buyer_curp?: string | null
          buyer_email?: string | null
          buyer_name: string
          buyer_phone?: string | null
          buyer_rfc?: string | null
          contract_number?: string | null
          contract_signed_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deed_number?: string | null
          deed_signed_at?: string | null
          down_payment?: number | null
          financing_months?: number | null
          id?: string
          internal_notes?: string | null
          lead_id?: string | null
          lot_id: string
          monthly_payment?: number | null
          net_amount?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          sale_date?: string
          sale_price: number
          status?: Database["public"]["Enums"]["sale_status"]
          system_commission_amount?: number
          system_commission_percentage?: number | null
          updated_at?: string
        }
        Update: {
          agent_commission_amount?: number
          agent_commission_percentage?: number | null
          agent_id?: string
          buyer_address?: string | null
          buyer_curp?: string | null
          buyer_email?: string | null
          buyer_name?: string
          buyer_phone?: string | null
          buyer_rfc?: string | null
          contract_number?: string | null
          contract_signed_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deed_number?: string | null
          deed_signed_at?: string | null
          down_payment?: number | null
          financing_months?: number | null
          id?: string
          internal_notes?: string | null
          lead_id?: string | null
          lot_id?: string
          monthly_payment?: number | null
          net_amount?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          sale_date?: string
          sale_price?: number
          status?: Database["public"]["Enums"]["sale_status"]
          system_commission_amount?: number
          system_commission_percentage?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_sales_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "sales_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "agent_sales_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "sales_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_visits: {
        Row: {
          cancelled: boolean
          cancelled_at: string | null
          completed: boolean
          confirmed: boolean
          confirmed_at: string | null
          created_at: string
          id: string
          internal_notes: string | null
          preferred_date: string
          preferred_time: string | null
          project_id: string
          visitor_email: string | null
          visitor_name: string
          visitor_notes: string | null
          visitor_phone: string
        }
        Insert: {
          cancelled?: boolean
          cancelled_at?: string | null
          completed?: boolean
          confirmed?: boolean
          confirmed_at?: string | null
          created_at?: string
          id?: string
          internal_notes?: string | null
          preferred_date: string
          preferred_time?: string | null
          project_id: string
          visitor_email?: string | null
          visitor_name: string
          visitor_notes?: string | null
          visitor_phone: string
        }
        Update: {
          cancelled?: boolean
          cancelled_at?: string | null
          completed?: boolean
          confirmed?: boolean
          confirmed_at?: string | null
          created_at?: string
          id?: string
          internal_notes?: string | null
          preferred_date?: string
          preferred_time?: string | null
          project_id?: string
          visitor_email?: string | null
          visitor_name?: string
          visitor_notes?: string | null
          visitor_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_visits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_visits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      states: {
        Row: {
          active: boolean | null
          country_id: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean | null
          country_id: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean | null
          country_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "states_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          active: boolean
          client_location: string | null
          client_name: string
          client_title: string | null
          content: string
          created_at: string
          featured: boolean
          id: string
          order_index: number
          project_id: string | null
          rating: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          client_location?: string | null
          client_name: string
          client_title?: string | null
          content: string
          created_at?: string
          featured?: boolean
          id?: string
          order_index?: number
          project_id?: string | null
          rating?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          client_location?: string | null
          client_name?: string
          client_title?: string | null
          content?: string
          created_at?: string
          featured?: boolean
          id?: string
          order_index?: number
          project_id?: string | null
          rating?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active: boolean
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      agent_sales_summary: {
        Row: {
          agent_email: string | null
          agent_id: string | null
          agent_name: string | null
          completed_sales: number | null
          total_commission: number | null
          total_revenue: number | null
          total_sales: number | null
        }
        Relationships: []
      }
      leads_extended: {
        Row: {
          assigned_promoter_id: string | null
          assigned_to: string | null
          assigned_to_name: string | null
          budget_max: number | null
          budget_min: number | null
          contacted_at: string | null
          converted_at: string | null
          created_at: string | null
          id: string | null
          interest_level:
            | Database["public"]["Enums"]["interest_level_enum"]
            | null
          internal_notes: string | null
          lot_id: string | null
          lot_number: string | null
          name: string | null
          phone: string | null
          project_id: string | null
          project_name: string | null
          project_slug: string | null
          referrer_url: string | null
          source: Database["public"]["Enums"]["lead_source_enum"] | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          whatsapp: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_promoter_id_fkey"
            columns: ["assigned_promoter_id"]
            isOneToOne: false
            referencedRelation: "promoters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "agent_sales_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_summary: {
        Row: {
          available_lots: number | null
          id: string | null
          location_name: string | null
          max_price: number | null
          min_price: number | null
          name: string | null
          reserved_lots: number | null
          slug: string | null
          sold_lots: number | null
          status: Database["public"]["Enums"]["project_status_enum"] | null
          total_lots: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_sale_commissions: {
        Args: { p_agent_id: string; p_lot_id: string; p_sale_price: number }
        Returns: {
          agent_commission: number
          agent_percentage: number
          net_amount: number
          system_commission: number
          system_percentage: number
        }[]
      }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      appointment_status_enum: "scheduled" | "confirmed" | "cancelled"
      commission_scope: "global" | "project" | "lot" | "agent"
      commission_type: "percentage" | "fixed"
      config_scope_enum: "global" | "project" | "lot"
      interest_level_enum: "low" | "medium" | "high"
      lead_source:
        | "website"
        | "whatsapp"
        | "phone"
        | "referral"
        | "social_media"
        | "walk_in"
        | "other"
      lead_source_enum: "web" | "whatsapp"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "negotiating"
        | "won"
        | "lost"
      lot_status: "available" | "reserved" | "sold" | "not_for_sale"
      lot_status_enum: "available" | "reserved" | "sold"
      media_entity_enum: "project" | "lot"
      media_type: "image" | "video" | "document" | "virtual_tour"
      media_type_enum: "image" | "video"
      payment_status: "pending" | "partial" | "completed"
      project_status_enum: "active" | "inactive"
      promoter_role_enum: "admin" | "promoter"
      promoter_status_enum: "active" | "suspended"
      sale_status: "pending" | "in_process" | "completed" | "cancelled"
      user_role: "super_admin" | "admin" | "agent"
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
      appointment_status_enum: ["scheduled", "confirmed", "cancelled"],
      commission_scope: ["global", "project", "lot", "agent"],
      commission_type: ["percentage", "fixed"],
      config_scope_enum: ["global", "project", "lot"],
      interest_level_enum: ["low", "medium", "high"],
      lead_source: [
        "website",
        "whatsapp",
        "phone",
        "referral",
        "social_media",
        "walk_in",
        "other",
      ],
      lead_source_enum: ["web", "whatsapp"],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "negotiating",
        "won",
        "lost",
      ],
      lot_status: ["available", "reserved", "sold", "not_for_sale"],
      lot_status_enum: ["available", "reserved", "sold"],
      media_entity_enum: ["project", "lot"],
      media_type: ["image", "video", "document", "virtual_tour"],
      media_type_enum: ["image", "video"],
      payment_status: ["pending", "partial", "completed"],
      project_status_enum: ["active", "inactive"],
      promoter_role_enum: ["admin", "promoter"],
      promoter_status_enum: ["active", "suspended"],
      sale_status: ["pending", "in_process", "completed", "cancelled"],
      user_role: ["super_admin", "admin", "agent"],
    },
  },
} as const
