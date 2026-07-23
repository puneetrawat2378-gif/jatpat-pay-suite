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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_assignments: {
        Row: {
          assigned_at: string
          id: string
          merchant_id: string
          priority: string
          reviewer_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          merchant_id: string
          priority?: string
          reviewer_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          id?: string
          merchant_id?: string
          priority?: string
          reviewer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_assignments_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: true
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          merchant_id: string | null
          resource_id: string | null
          resource_type: string | null
          safe_metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          merchant_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          safe_metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          merchant_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          safe_metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          merchant_id: string
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          merchant_id: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          merchant_id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      document_requirements: {
        Row: {
          business_category: string | null
          business_type: string
          created_at: string
          document_category: string
          document_type: string
          id: string
          is_required: boolean
          notes: string | null
        }
        Insert: {
          business_category?: string | null
          business_type: string
          created_at?: string
          document_category: string
          document_type: string
          id?: string
          is_required?: boolean
          notes?: string | null
        }
        Update: {
          business_category?: string | null
          business_type?: string
          created_at?: string
          document_category?: string
          document_type?: string
          id?: string
          is_required?: boolean
          notes?: string | null
        }
        Relationships: []
      }
      information_request_messages: {
        Row: {
          author_id: string | null
          author_kind: string
          created_at: string
          id: string
          request_id: string
          safe_message: string
        }
        Insert: {
          author_id?: string | null
          author_kind: string
          created_at?: string
          id?: string
          request_id: string
          safe_message: string
        }
        Update: {
          author_id?: string | null
          author_kind?: string
          created_at?: string
          id?: string
          request_id?: string
          safe_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "information_request_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "information_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      information_requests: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          merchant_id: string
          opened_at: string
          opened_by: string | null
          resolved_at: string | null
          section: string
          status: Database["public"]["Enums"]["info_request_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          merchant_id: string
          opened_at?: string
          opened_by?: string | null
          resolved_at?: string | null
          section: string
          status?: Database["public"]["Enums"]["info_request_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          merchant_id?: string
          opened_at?: string
          opened_by?: string | null
          resolved_at?: string | null
          section?: string
          status?: Database["public"]["Enums"]["info_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "information_requests_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_review_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          merchant_id: string
          new_status: string | null
          previous_status: string | null
          safe_note: string | null
          section: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          merchant_id: string
          new_status?: string | null
          previous_status?: string | null
          safe_note?: string | null
          section?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          merchant_id?: string
          new_status?: string | null
          previous_status?: string | null
          safe_note?: string | null
          section?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_review_events_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_risk_cases: {
        Row: {
          assigned_to: string | null
          created_at: string
          decision: string | null
          decision_at: string | null
          id: string
          merchant_id: string
          reviewer_notes_private: string | null
          status: Database["public"]["Enums"]["risk_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          decision?: string | null
          decision_at?: string | null
          id?: string
          merchant_id: string
          reviewer_notes_private?: string | null
          status?: Database["public"]["Enums"]["risk_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          decision?: string | null
          decision_at?: string | null
          id?: string
          merchant_id?: string
          reviewer_notes_private?: string | null
          status?: Database["public"]["Enums"]["risk_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_risk_cases_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: true
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_risk_signals: {
        Row: {
          case_id: string
          created_at: string
          id: string
          signal_code: string
          signal_note: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          signal_code: string
          signal_note?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          signal_code?: string
          signal_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_risk_signals_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "internal_risk_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          kind: string
          line1: string
          line2: string | null
          merchant_id: string
          postal_code: string
          review_status: string
          state: string
          updated_at: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string
          id?: string
          kind: string
          line1: string
          line2?: string | null
          merchant_id: string
          postal_code: string
          review_status?: string
          state: string
          updated_at?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          kind?: string
          line1?: string
          line2?: string | null
          merchant_id?: string
          postal_code?: string
          review_status?: string
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_addresses_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_bank_accounts: {
        Row: {
          account_holder_name: string
          account_number_encrypted: string
          account_number_last4: string
          account_type: string
          bank_name: string
          created_at: string
          id: string
          ifsc_code: string
          internal_status: string
          merchant_id: string
          provider_verified: boolean
          provider_verified_at: string | null
          updated_at: string
        }
        Insert: {
          account_holder_name: string
          account_number_encrypted: string
          account_number_last4: string
          account_type: string
          bank_name: string
          created_at?: string
          id?: string
          ifsc_code: string
          internal_status?: string
          merchant_id: string
          provider_verified?: boolean
          provider_verified_at?: string | null
          updated_at?: string
        }
        Update: {
          account_holder_name?: string
          account_number_encrypted?: string
          account_number_last4?: string
          account_type?: string
          bank_name?: string
          created_at?: string
          id?: string
          ifsc_code?: string
          internal_status?: string
          merchant_id?: string
          provider_verified?: boolean
          provider_verified_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_bank_accounts_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: true
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_documents: {
        Row: {
          created_at: string
          document_category: string
          document_type: string
          file_size: number
          id: string
          merchant_id: string
          mime_type: string
          original_filename_safe: string
          review_status: Database["public"]["Enums"]["document_review_status"]
          reviewed_at: string | null
          reviewed_by: string | null
          safe_rejection_reason: string | null
          storage_path: string
          updated_at: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_category: string
          document_type: string
          file_size: number
          id?: string
          merchant_id: string
          mime_type: string
          original_filename_safe: string
          review_status?: Database["public"]["Enums"]["document_review_status"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          safe_rejection_reason?: string | null
          storage_path: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_category?: string
          document_type?: string
          file_size?: number
          id?: string
          merchant_id?: string
          mime_type?: string
          original_filename_safe?: string
          review_status?: Database["public"]["Enums"]["document_review_status"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          safe_rejection_reason?: string | null
          storage_path?: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_documents_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_enabled_currencies: {
        Row: {
          created_at: string
          currency: string
          id: string
          merchant_id: string
          status: Database["public"]["Enums"]["currency_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency: string
          id?: string
          merchant_id: string
          status?: Database["public"]["Enums"]["currency_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          merchant_id?: string
          status?: Database["public"]["Enums"]["currency_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_enabled_currencies_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_members: {
        Row: {
          created_at: string
          id: string
          merchant_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          merchant_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          merchant_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_members_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_onboarding: {
        Row: {
          address_snapshot: Json
          business_details: Json
          business_type: Json
          completion_percent: number
          created_at: string
          current_step: number
          declaration: Json
          id: string
          internal_decision_at: string | null
          internal_decision_note: string | null
          internal_status: Database["public"]["Enums"]["merchant_internal_status"]
          merchant_id: string
          payment_requirements: Json
          submitted_at: string | null
          under_review_at: string | null
          updated_at: string
          website_review: Json
        }
        Insert: {
          address_snapshot?: Json
          business_details?: Json
          business_type?: Json
          completion_percent?: number
          created_at?: string
          current_step?: number
          declaration?: Json
          id?: string
          internal_decision_at?: string | null
          internal_decision_note?: string | null
          internal_status?: Database["public"]["Enums"]["merchant_internal_status"]
          merchant_id: string
          payment_requirements?: Json
          submitted_at?: string | null
          under_review_at?: string | null
          updated_at?: string
          website_review?: Json
        }
        Update: {
          address_snapshot?: Json
          business_details?: Json
          business_type?: Json
          completion_percent?: number
          created_at?: string
          current_step?: number
          declaration?: Json
          id?: string
          internal_decision_at?: string | null
          internal_decision_note?: string | null
          internal_status?: Database["public"]["Enums"]["merchant_internal_status"]
          merchant_id?: string
          payment_requirements?: Json
          submitted_at?: string | null
          under_review_at?: string | null
          updated_at?: string
          website_review?: Json
        }
        Relationships: [
          {
            foreignKeyName: "merchant_onboarding_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: true
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_representatives: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          identity_verification_provider: string | null
          identity_verification_status: string
          merchant_id: string
          phone: string | null
          representative_type: string
          role_in_business: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          identity_verification_provider?: string | null
          identity_verification_status?: string
          merchant_id: string
          phone?: string | null
          representative_type: string
          role_in_business?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          identity_verification_provider?: string | null
          identity_verification_status?: string
          merchant_id?: string
          phone?: string | null
          representative_type?: string
          role_in_business?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_representatives_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_settings: {
        Row: {
          active_provider: string
          connection_status: Database["public"]["Enums"]["connection_status"]
          created_at: string
          international_status: Database["public"]["Enums"]["intl_status"]
          last_webhook_at: string | null
          merchant_id: string
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          updated_at: string
          webhook_configured: boolean
        }
        Insert: {
          active_provider?: string
          connection_status?: Database["public"]["Enums"]["connection_status"]
          created_at?: string
          international_status?: Database["public"]["Enums"]["intl_status"]
          last_webhook_at?: string | null
          merchant_id: string
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          updated_at?: string
          webhook_configured?: boolean
        }
        Update: {
          active_provider?: string
          connection_status?: Database["public"]["Enums"]["connection_status"]
          created_at?: string
          international_status?: Database["public"]["Enums"]["intl_status"]
          last_webhook_at?: string | null
          merchant_id?: string
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          updated_at?: string
          webhook_configured?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "merchant_settings_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: true
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          brand_logo_url: string | null
          business_country: string
          business_email: string | null
          business_name: string
          created_at: string
          id: string
          merchant_ref: string
          owner_user_id: string
          updated_at: string
        }
        Insert: {
          brand_logo_url?: string | null
          business_country?: string
          business_email?: string | null
          business_name: string
          created_at?: string
          id?: string
          merchant_ref?: string
          owner_user_id: string
          updated_at?: string
        }
        Update: {
          brand_logo_url?: string | null
          business_country?: string
          business_email?: string | null
          business_name?: string
          created_at?: string
          id?: string
          merchant_ref?: string
          owner_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_links: {
        Row: {
          amount_minor: number
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_test: boolean
          merchant_id: string
          slug: string
          status: Database["public"]["Enums"]["payment_link_status"]
          title: string
          updated_at: string
        }
        Insert: {
          amount_minor: number
          created_at?: string
          created_by?: string | null
          currency: string
          customer_id?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_test?: boolean
          merchant_id: string
          slug: string
          status?: Database["public"]["Enums"]["payment_link_status"]
          title: string
          updated_at?: string
        }
        Update: {
          amount_minor?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_test?: boolean
          merchant_id?: string
          slug?: string
          status?: Database["public"]["Enums"]["payment_link_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_links_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_links_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_minor: number
          created_at: string
          currency: string
          customer_id: string | null
          error_code: string | null
          error_description: string | null
          id: string
          internal_reference: string
          is_test: boolean
          merchant_id: string
          paid_at: string | null
          payment_link_id: string | null
          payment_method_type: string | null
          provider: string
          provider_order_id: string | null
          provider_payment_id: string | null
          provider_verified: boolean
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount_minor: number
          created_at?: string
          currency: string
          customer_id?: string | null
          error_code?: string | null
          error_description?: string | null
          id?: string
          internal_reference: string
          is_test?: boolean
          merchant_id: string
          paid_at?: string | null
          payment_link_id?: string | null
          payment_method_type?: string | null
          provider: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          provider_verified?: boolean
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount_minor?: number
          created_at?: string
          currency?: string
          customer_id?: string | null
          error_code?: string | null
          error_description?: string | null
          id?: string
          internal_reference?: string
          is_test?: boolean
          merchant_id?: string
          paid_at?: string | null
          payment_link_id?: string | null
          payment_method_type?: string | null
          provider?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          provider_verified?: boolean
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_link_id_fkey"
            columns: ["payment_link_id"]
            isOneToOne: false
            referencedRelation: "payment_links"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["platform_role"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auth_state: Database["public"]["Enums"]["auth_state"]
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          auth_state?: Database["public"]["Enums"]["auth_state"]
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          auth_state?: Database["public"]["Enums"]["auth_state"]
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      provider_accounts: {
        Row: {
          created_at: string
          id: string
          last_error_safe: string | null
          last_verified_at: string | null
          live_key_id_masked: string | null
          merchant_id: string
          provider: string
          status: Database["public"]["Enums"]["provider_status"]
          test_key_id_masked: string | null
          updated_at: string
          webhook_configured: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          last_error_safe?: string | null
          last_verified_at?: string | null
          live_key_id_masked?: string | null
          merchant_id: string
          provider?: string
          status?: Database["public"]["Enums"]["provider_status"]
          test_key_id_masked?: string | null
          updated_at?: string
          webhook_configured?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          last_error_safe?: string | null
          last_verified_at?: string | null
          live_key_id_masked?: string | null
          merchant_id?: string
          provider?: string
          status?: Database["public"]["Enums"]["provider_status"]
          test_key_id_masked?: string | null
          updated_at?: string
          webhook_configured?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "provider_accounts_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_capabilities: {
        Row: {
          capability: string
          id: string
          merchant_id: string
          status: Database["public"]["Enums"]["capability_status"]
          updated_at: string
        }
        Insert: {
          capability: string
          id?: string
          merchant_id: string
          status?: Database["public"]["Enums"]["capability_status"]
          updated_at?: string
        }
        Update: {
          capability?: string
          id?: string
          merchant_id?: string
          status?: Database["public"]["Enums"]["capability_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_capabilities_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount_minor: number
          created_at: string
          currency: string
          id: string
          merchant_id: string
          payment_id: string
          provider: string
          provider_refund_id: string | null
          reason: string | null
          requested_by: string | null
          status: Database["public"]["Enums"]["refund_status"]
          updated_at: string
        }
        Insert: {
          amount_minor: number
          created_at?: string
          currency: string
          id?: string
          merchant_id: string
          payment_id: string
          provider: string
          provider_refund_id?: string | null
          reason?: string | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["refund_status"]
          updated_at?: string
        }
        Update: {
          amount_minor?: number
          created_at?: string
          currency?: string
          id?: string
          merchant_id?: string
          payment_id?: string
          provider?: string
          provider_refund_id?: string | null
          reason?: string | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["refund_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          error_message_safe: string | null
          event_type: string
          id: string
          merchant_id: string | null
          payload_hash: string | null
          processed_at: string | null
          processing_status: Database["public"]["Enums"]["webhook_processing_status"]
          provider: string
          provider_event_id: string
          received_at: string
        }
        Insert: {
          error_message_safe?: string | null
          event_type: string
          id?: string
          merchant_id?: string | null
          payload_hash?: string | null
          processed_at?: string | null
          processing_status?: Database["public"]["Enums"]["webhook_processing_status"]
          provider: string
          provider_event_id: string
          received_at?: string
        }
        Update: {
          error_message_safe?: string | null
          event_type?: string
          id?: string
          merchant_id?: string | null
          payload_hash?: string | null
          processed_at?: string | null
          processing_status?: Database["public"]["Enums"]["webhook_processing_status"]
          provider?: string
          provider_event_id?: string
          received_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      merchant_bank_accounts_masked: {
        Row: {
          account_holder_name: string | null
          account_number_last4: string | null
          account_number_masked: string | null
          account_type: string | null
          bank_name: string | null
          created_at: string | null
          id: string | null
          ifsc_code: string | null
          internal_status: string | null
          merchant_id: string | null
          provider_verified: boolean | null
          provider_verified_at: string | null
          updated_at: string | null
        }
        Insert: {
          account_holder_name?: string | null
          account_number_last4?: string | null
          account_number_masked?: never
          account_type?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string | null
          ifsc_code?: string | null
          internal_status?: string | null
          merchant_id?: string | null
          provider_verified?: boolean | null
          provider_verified_at?: string | null
          updated_at?: string | null
        }
        Update: {
          account_holder_name?: string | null
          account_number_last4?: string | null
          account_number_masked?: never
          account_type?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string | null
          ifsc_code?: string | null
          internal_status?: string | null
          merchant_id?: string | null
          provider_verified?: boolean | null
          provider_verified_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_bank_accounts_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: true
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_merchant_ref: { Args: never; Returns: string }
      has_any_merchant_role: {
        Args: {
          _merchant: string
          _roles: Database["public"]["Enums"]["app_role"][]
          _user: string
        }
        Returns: boolean
      }
      has_merchant_role: {
        Args: {
          _merchant: string
          _role: Database["public"]["Enums"]["app_role"]
          _user: string
        }
        Returns: boolean
      }
      has_platform_role: {
        Args: {
          _role: Database["public"]["Enums"]["platform_role"]
          _user: string
        }
        Returns: boolean
      }
      is_merchant_member: {
        Args: { _merchant: string; _user: string }
        Returns: boolean
      }
      is_platform_admin: { Args: { _user: string }; Returns: boolean }
      is_risk_reviewer: { Args: { _user: string }; Returns: boolean }
      is_super_admin: { Args: { _user: string }; Returns: boolean }
      is_verification_reviewer: { Args: { _user: string }; Returns: boolean }
    }
    Enums: {
      app_role: "owner" | "admin" | "developer" | "finance" | "support"
      auth_state:
        | "email_unverified"
        | "active"
        | "restricted"
        | "suspended"
        | "disabled"
      capability_status:
        | "not_requested"
        | "requested"
        | "internal_review"
        | "provider_activation_required"
        | "provider_review"
        | "enabled"
        | "restricted"
        | "unavailable"
      connection_status: "disconnected" | "connected" | "error"
      currency_status:
        | "enabled"
        | "disabled"
        | "activation_required"
        | "unsupported"
      document_review_status:
        | "not_uploaded"
        | "uploaded"
        | "under_internal_review"
        | "action_required"
        | "internally_accepted"
        | "internally_rejected"
        | "provider_submission_required"
        | "provider_review_pending"
      info_request_status:
        | "open"
        | "merchant_responded"
        | "under_review"
        | "resolved"
        | "cancelled"
      intl_status:
        | "not_requested"
        | "activation_required"
        | "under_review"
        | "enabled"
        | "restricted"
        | "unavailable"
      merchant_internal_status:
        | "draft"
        | "onboarding"
        | "submitted"
        | "under_internal_review"
        | "action_required"
        | "internally_approved"
        | "internally_rejected"
        | "restricted"
        | "suspended"
      payment_link_status: "active" | "paid" | "expired" | "cancelled"
      payment_mode: "test" | "live"
      payment_status:
        | "created"
        | "pending"
        | "processing"
        | "requires_action"
        | "successful"
        | "failed"
        | "cancelled"
        | "partially_refunded"
        | "refunded"
      platform_role:
        | "support_agent"
        | "verification_reviewer"
        | "risk_reviewer"
        | "admin"
        | "super_admin"
      provider_status:
        | "not_connected"
        | "test_credentials_required"
        | "test_connected"
        | "configuration_error"
        | "provider_activation_required"
        | "provider_review"
        | "live_available"
        | "live_connected"
        | "restricted"
      refund_status: "created" | "processing" | "successful" | "failed"
      risk_status:
        | "not_reviewed"
        | "standard_review"
        | "enhanced_review"
        | "escalated"
        | "restricted"
        | "closed"
      webhook_processing_status:
        | "received"
        | "processing"
        | "processed"
        | "failed"
        | "ignored"
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
      app_role: ["owner", "admin", "developer", "finance", "support"],
      auth_state: [
        "email_unverified",
        "active",
        "restricted",
        "suspended",
        "disabled",
      ],
      capability_status: [
        "not_requested",
        "requested",
        "internal_review",
        "provider_activation_required",
        "provider_review",
        "enabled",
        "restricted",
        "unavailable",
      ],
      connection_status: ["disconnected", "connected", "error"],
      currency_status: [
        "enabled",
        "disabled",
        "activation_required",
        "unsupported",
      ],
      document_review_status: [
        "not_uploaded",
        "uploaded",
        "under_internal_review",
        "action_required",
        "internally_accepted",
        "internally_rejected",
        "provider_submission_required",
        "provider_review_pending",
      ],
      info_request_status: [
        "open",
        "merchant_responded",
        "under_review",
        "resolved",
        "cancelled",
      ],
      intl_status: [
        "not_requested",
        "activation_required",
        "under_review",
        "enabled",
        "restricted",
        "unavailable",
      ],
      merchant_internal_status: [
        "draft",
        "onboarding",
        "submitted",
        "under_internal_review",
        "action_required",
        "internally_approved",
        "internally_rejected",
        "restricted",
        "suspended",
      ],
      payment_link_status: ["active", "paid", "expired", "cancelled"],
      payment_mode: ["test", "live"],
      payment_status: [
        "created",
        "pending",
        "processing",
        "requires_action",
        "successful",
        "failed",
        "cancelled",
        "partially_refunded",
        "refunded",
      ],
      platform_role: [
        "support_agent",
        "verification_reviewer",
        "risk_reviewer",
        "admin",
        "super_admin",
      ],
      provider_status: [
        "not_connected",
        "test_credentials_required",
        "test_connected",
        "configuration_error",
        "provider_activation_required",
        "provider_review",
        "live_available",
        "live_connected",
        "restricted",
      ],
      refund_status: ["created", "processing", "successful", "failed"],
      risk_status: [
        "not_reviewed",
        "standard_review",
        "enhanced_review",
        "escalated",
        "restricted",
        "closed",
      ],
      webhook_processing_status: [
        "received",
        "processing",
        "processed",
        "failed",
        "ignored",
      ],
    },
  },
} as const
