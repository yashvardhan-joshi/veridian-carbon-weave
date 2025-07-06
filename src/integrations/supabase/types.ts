export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      carbon_projects: {
        Row: {
          credits_issued: number
          credits_retired: number
          description: string | null
          developer: string
          last_synced: string | null
          location: string
          metadata: Json | null
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
          credits_issued?: number
          credits_retired?: number
          description?: string | null
          developer: string
          last_synced?: string | null
          location: string
          metadata?: Json | null
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
          credits_issued?: number
          credits_retired?: number
          description?: string | null
          developer?: string
          last_synced?: string | null
          location?: string
          metadata?: Json | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
