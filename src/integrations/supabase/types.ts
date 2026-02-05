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
      blacklist: {
        Row: {
          blocked_at: string | null
          blocked_by: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          is_permanent: boolean | null
          mac_address: string | null
          phone_number: string | null
          reason: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_permanent?: boolean | null
          mac_address?: string | null
          phone_number?: string | null
          reason: string
        }
        Update: {
          blocked_at?: string | null
          blocked_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_permanent?: boolean | null
          mac_address?: string | null
          phone_number?: string | null
          reason?: string
        }
        Relationships: []
      }
      connected_users: {
        Row: {
          connected_at: string
          created_at: string
          device_name: string | null
          device_type: string | null
          expires_at: string
          id: string
          ip_address: string
          package_duration: string
          package_id: number
          package_price: number
          phone_number: string
          status: string
          voucher_code: string | null
        }
        Insert: {
          connected_at?: string
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          expires_at: string
          id?: string
          ip_address: string
          package_duration: string
          package_id: number
          package_price: number
          phone_number: string
          status?: string
          voucher_code?: string | null
        }
        Update: {
          connected_at?: string
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          expires_at?: string
          id?: string
          ip_address?: string
          package_duration?: string
          package_id?: number
          package_price?: number
          phone_number?: string
          status?: string
          voucher_code?: string | null
        }
        Relationships: []
      }
      hotspot_users: {
        Row: {
          bandwidth_limit_mbps: number | null
          blacklist_reason: string | null
          created_at: string | null
          data_limit_mb: number | null
          email: string | null
          id: string
          is_active: boolean | null
          is_blacklisted: boolean | null
          mac_address: string | null
          password_hash: string
          phone_number: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          bandwidth_limit_mbps?: number | null
          blacklist_reason?: string | null
          created_at?: string | null
          data_limit_mb?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_blacklisted?: boolean | null
          mac_address?: string | null
          password_hash: string
          phone_number?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          bandwidth_limit_mbps?: number | null
          blacklist_reason?: string | null
          created_at?: string | null
          data_limit_mb?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_blacklisted?: boolean | null
          mac_address?: string | null
          password_hash?: string
          phone_number?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string | null
          api_port: number | null
          api_username: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          router_ip: string | null
          router_type: string | null
          ssid: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          api_port?: number | null
          api_username?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          router_ip?: string | null
          router_type?: string | null
          ssid?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          api_port?: number | null
          api_username?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          router_ip?: string | null
          router_type?: string | null
          ssid?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      packages: {
        Row: {
          bandwidth_down_mbps: number | null
          bandwidth_up_mbps: number | null
          created_at: string | null
          currency: string | null
          data_limit_mb: number | null
          device_limit: number | null
          duration_display: string
          duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          price: number
          sort_order: number | null
        }
        Insert: {
          bandwidth_down_mbps?: number | null
          bandwidth_up_mbps?: number | null
          created_at?: string | null
          currency?: string | null
          data_limit_mb?: number | null
          device_limit?: number | null
          duration_display: string
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          sort_order?: number | null
        }
        Update: {
          bandwidth_down_mbps?: number | null
          bandwidth_up_mbps?: number | null
          created_at?: string | null
          currency?: string | null
          data_limit_mb?: number | null
          device_limit?: number | null
          duration_display?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          sort_order?: number | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          checkout_request_id: string | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          id: string
          location_id: string | null
          merchant_request_id: string | null
          mpesa_receipt: string | null
          package_duration: string | null
          package_id: number | null
          payment_method: string | null
          phone_number: string
          status: string | null
          transaction_id: string | null
          user_id: string | null
          voucher_id: string | null
        }
        Insert: {
          amount: number
          checkout_request_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          location_id?: string | null
          merchant_request_id?: string | null
          mpesa_receipt?: string | null
          package_duration?: string | null
          package_id?: number | null
          payment_method?: string | null
          phone_number: string
          status?: string | null
          transaction_id?: string | null
          user_id?: string | null
          voucher_id?: string | null
        }
        Update: {
          amount?: number
          checkout_request_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          location_id?: string | null
          merchant_request_id?: string | null
          mpesa_receipt?: string | null
          package_duration?: string | null
          package_id?: number | null
          payment_method?: string | null
          phone_number?: string
          status?: string | null
          transaction_id?: string | null
          user_id?: string | null
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "hotspot_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_otp: {
        Row: {
          attempts: number | null
          created_at: string | null
          expires_at: string
          id: string
          otp_code: string
          phone_number: string
          verified: boolean | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          expires_at: string
          id?: string
          otp_code: string
          phone_number: string
          verified?: boolean | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          expires_at?: string
          id?: string
          otp_code?: string
          phone_number?: string
          verified?: boolean | null
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
      user_sessions: {
        Row: {
          auth_method: string | null
          bandwidth_down_mbps: number | null
          bandwidth_up_mbps: number | null
          created_at: string | null
          data_limit_mb: number | null
          data_used_mb: number | null
          device_name: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          location_id: string | null
          mac_address: string
          session_end: string | null
          session_start: string | null
          status: string | null
          time_limit_seconds: number | null
          time_used_seconds: number | null
          user_id: string | null
          voucher_id: string | null
        }
        Insert: {
          auth_method?: string | null
          bandwidth_down_mbps?: number | null
          bandwidth_up_mbps?: number | null
          created_at?: string | null
          data_limit_mb?: number | null
          data_used_mb?: number | null
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          location_id?: string | null
          mac_address: string
          session_end?: string | null
          session_start?: string | null
          status?: string | null
          time_limit_seconds?: number | null
          time_used_seconds?: number | null
          user_id?: string | null
          voucher_id?: string | null
        }
        Update: {
          auth_method?: string | null
          bandwidth_down_mbps?: number | null
          bandwidth_up_mbps?: number | null
          created_at?: string | null
          data_limit_mb?: number | null
          data_used_mb?: number | null
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          location_id?: string | null
          mac_address?: string
          session_end?: string | null
          session_start?: string | null
          status?: string | null
          time_limit_seconds?: number | null
          time_used_seconds?: number | null
          user_id?: string | null
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "hotspot_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      voucher_devices: {
        Row: {
          device_name: string | null
          first_seen: string | null
          id: string
          is_active: boolean | null
          last_seen: string | null
          mac_address: string
          voucher_id: string
        }
        Insert: {
          device_name?: string | null
          first_seen?: string | null
          id?: string
          is_active?: boolean | null
          last_seen?: string | null
          mac_address: string
          voucher_id: string
        }
        Update: {
          device_name?: string | null
          first_seen?: string | null
          id?: string
          is_active?: boolean | null
          last_seen?: string | null
          mac_address?: string
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voucher_devices_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      vouchers: {
        Row: {
          bandwidth_down_mbps: number | null
          bandwidth_up_mbps: number | null
          claimed_at: string | null
          claimed_by: string | null
          code: string
          created_at: string
          data_limit_mb: number | null
          device_limit: number | null
          expires_at: string | null
          id: string
          is_reusable: boolean | null
          location_id: string | null
          max_uses: number | null
          package_duration: string
          package_id: number
          package_price: number
          qr_code: string | null
          status: Database["public"]["Enums"]["voucher_status"]
          use_count: number | null
        }
        Insert: {
          bandwidth_down_mbps?: number | null
          bandwidth_up_mbps?: number | null
          claimed_at?: string | null
          claimed_by?: string | null
          code: string
          created_at?: string
          data_limit_mb?: number | null
          device_limit?: number | null
          expires_at?: string | null
          id?: string
          is_reusable?: boolean | null
          location_id?: string | null
          max_uses?: number | null
          package_duration: string
          package_id: number
          package_price: number
          qr_code?: string | null
          status?: Database["public"]["Enums"]["voucher_status"]
          use_count?: number | null
        }
        Update: {
          bandwidth_down_mbps?: number | null
          bandwidth_up_mbps?: number | null
          claimed_at?: string | null
          claimed_by?: string | null
          code?: string
          created_at?: string
          data_limit_mb?: number | null
          device_limit?: number | null
          expires_at?: string | null
          id?: string
          is_reusable?: boolean | null
          location_id?: string | null
          max_uses?: number | null
          package_duration?: string
          package_id?: number
          package_price?: number
          qr_code?: string | null
          status?: Database["public"]["Enums"]["voucher_status"]
          use_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vouchers_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      whitelist: {
        Row: {
          created_at: string | null
          description: string | null
          domain: string | null
          id: string
          ip_address: string | null
          is_walled_garden: boolean | null
          mac_address: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          ip_address?: string | null
          is_walled_garden?: boolean | null
          mac_address?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          ip_address?: string | null
          is_walled_garden?: boolean | null
          mac_address?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_voucher_device_limit: {
        Args: { _mac_address: string; _voucher_id: string }
        Returns: boolean
      }
      expire_vouchers: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_blacklisted: {
        Args: {
          _ip_address?: string
          _mac_address?: string
          _phone_number?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      voucher_status: "available" | "claimed" | "expired"
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
      voucher_status: ["available", "claimed", "expired"],
    },
  },
} as const
