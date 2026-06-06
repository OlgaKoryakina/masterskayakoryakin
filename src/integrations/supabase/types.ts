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
      custom_requests: {
        Row: {
          created_at: string
          details: Json
          id: string
          message: string | null
          messenger: string | null
          name: string
          phone: string
          reference_urls: string[]
          status: Database["public"]["Enums"]["request_status"]
        }
        Insert: {
          created_at?: string
          details?: Json
          id?: string
          message?: string | null
          messenger?: string | null
          name: string
          phone: string
          reference_urls?: string[]
          status?: Database["public"]["Enums"]["request_status"]
        }
        Update: {
          created_at?: string
          details?: Json
          id?: string
          message?: string | null
          messenger?: string | null
          name?: string
          phone?: string
          reference_urls?: string[]
          status?: Database["public"]["Enums"]["request_status"]
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          created_at: string
          id: string
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          character_tags: string[]
          created_at: string
          description: string | null
          id: string
          images: string[]
          is_featured: boolean
          params: Json
          price: number | null
          short_description: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at: string
          videos: string[]
        }
        Insert: {
          category: Database["public"]["Enums"]["product_category"]
          character_tags?: string[]
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          is_featured?: boolean
          params?: Json
          price?: number | null
          short_description?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at?: string
          videos?: string[]
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          character_tags?: string[]
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          is_featured?: boolean
          params?: Json
          price?: number | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          title?: string
          updated_at?: string
          videos?: string[]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      request_items: {
        Row: {
          id: string
          note: string | null
          product_id: string | null
          request_id: string
          snapshot: Json
        }
        Insert: {
          id?: string
          note?: string | null
          product_id?: string | null
          request_id: string
          snapshot?: Json
        }
        Update: {
          id?: string
          note?: string | null
          product_id?: string | null
          request_id?: string
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "request_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          created_at: string
          custom_notes: string | null
          id: string
          message: string | null
          messenger: string | null
          name: string
          phone: string
          status: Database["public"]["Enums"]["request_status"]
        }
        Insert: {
          created_at?: string
          custom_notes?: string | null
          id?: string
          message?: string | null
          messenger?: string | null
          name: string
          phone: string
          status?: Database["public"]["Enums"]["request_status"]
        }
        Update: {
          created_at?: string
          custom_notes?: string | null
          id?: string
          message?: string | null
          messenger?: string | null
          name?: string
          phone?: string
          status?: Database["public"]["Enums"]["request_status"]
        }
        Relationships: []
      }
      site_content: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_name: string
          city: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["testimonial_status"]
          text: string
          updated_at: string
        }
        Insert: {
          author_name: string
          city?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["testimonial_status"]
          text: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          city?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["testimonial_status"]
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "user"
      product_category: "belt" | "buckle"
      product_status: "in_stock" | "made_to_order"
      request_status:
        | "new"
        | "in_progress"
        | "closed"
        | "confirmed"
        | "in_production"
        | "ready"
        | "shipped"
        | "delivered"
        | "cancelled"
      testimonial_status: "pending" | "approved" | "rejected"
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
      product_category: ["belt", "buckle"],
      product_status: ["in_stock", "made_to_order"],
      request_status: [
        "new",
        "in_progress",
        "closed",
        "confirmed",
        "in_production",
        "ready",
        "shipped",
        "delivered",
        "cancelled",
      ],
      testimonial_status: ["pending", "approved", "rejected"],
    },
  },
} as const
