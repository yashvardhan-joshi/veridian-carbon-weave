export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      carbon_projects: {
        Row: {
          blockchain_tx_hash: string | null
          credits_issued: number
          credits_retired: number
          description: string | null
          developer: string
          document_url: string | null
          last_synced: string | null
          location: string
          metadata: Json | null
          metadata_uri: string | null
          methodology: string
          name: string
          registration_date: string | null
          registry_id: string
          status: string
          type: string
          user_id: string
          verification_date: string | null
        }
        Insert: {
          blockchain_tx_hash?: string | null
          credits_issued?: number
          credits_retired?: number
          description?: string | null
          developer: string
          document_url?: string | null
          last_synced?: string | null
          location: string
          metadata?: Json | null
          metadata_uri?: string | null
          methodology: string
          name: string
          registration_date?: string | null
          registry_id: string
          status: string
          type: string
          user_id?: string
          verification_date?: string | null
        }
        Update: {
          blockchain_tx_hash?: string | null
          credits_issued?: number
          credits_retired?: number
          description?: string | null
          developer?: string
          document_url?: string | null
          last_synced?: string | null
          location?: string
          metadata?: Json | null
          metadata_uri?: string | null
          methodology?: string
          name?: string
          registration_date?: string | null
          registry_id?: string
          status?: string
          type?: string
          user_id?: string
          verification_date?: string | null
        }
        Relationships: []
      }
      carbon_transactions: {
        Row: {
          buyer: string | null
          id: string
          metadata: Json | null
          price_per_unit: number | null
          project_id: string | null
          quantity: number
          seller: string | null
          transaction_date: string | null
          transaction_type: string
          verification_status: string | null
        }
        Insert: {
          buyer?: string | null
          id?: string
          metadata?: Json | null
          price_per_unit?: number | null
          project_id?: string | null
          quantity: number
          seller?: string | null
          transaction_date?: string | null
          transaction_type: string
          verification_status?: string | null
        }
        Update: {
          buyer?: string | null
          id?: string
          metadata?: Json | null
          price_per_unit?: number | null
          project_id?: string | null
          quantity?: number
          seller?: string | null
          transaction_date?: string | null
          transaction_type?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carbon_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "carbon_projects"
            referencedColumns: ["user_id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          blockchain_tx_hash: string | null
          buyer_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          metadata: Json | null
          price_per_credit: number
          project_id: string
          quantity: number
          seller_id: string | null
          status: string
          total_amount: number | null
          transaction_type: string
        }
        Insert: {
          blockchain_tx_hash?: string | null
          buyer_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          price_per_credit: number
          project_id: string
          quantity: number
          seller_id?: string | null
          status?: string
          total_amount?: number | null
          transaction_type: string
        }
        Update: {
          blockchain_tx_hash?: string | null
          buyer_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          price_per_credit?: number
          project_id?: string
          quantity?: number
          seller_id?: string | null
          status?: string
          total_amount?: number | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "credit_transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      registry_sync_logs: {
        Row: {
          end_time: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          records_processed: number | null
          start_time: string | null
          status: string
          sync_type: string
        }
        Insert: {
          end_time?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          records_processed?: number | null
          start_time?: string | null
          status: string
          sync_type: string
        }
        Update: {
          end_time?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          records_processed?: number | null
          start_time?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          created_at: string | null
          encrypted_private_key: string
          id: string
          updated_at: string | null
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          encrypted_private_key: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          encrypted_private_key?: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
