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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          link_url: string | null
          message: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          link_url?: string | null
          message: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          link_url?: string | null
          message?: string
        }
        Relationships: []
      }
      episodes: {
        Row: {
          created_at: string
          description: string
          duration_minutes: number | null
          episode_number: number
          id: string
          is_published: boolean
          publish_at: string
          season_id: string
          series_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
          views: number
        }
        Insert: {
          created_at?: string
          description?: string
          duration_minutes?: number | null
          episode_number: number
          id?: string
          is_published?: boolean
          publish_at?: string
          season_id: string
          series_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
          views?: number
        }
        Update: {
          created_at?: string
          description?: string
          duration_minutes?: number | null
          episode_number?: number
          id?: string
          is_published?: boolean
          publish_at?: string
          season_id?: string
          series_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "episodes_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_content: {
        Row: {
          created_at: string
          id: string
          position: number
          series_id: string
          slot: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          series_id: string
          slot?: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          series_id?: string
          slot?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_content_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      genres: {
        Row: {
          created_at: string
          id: string
          name_ar: string
          name_en: string
          name_fr: string
          name_tr: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_ar: string
          name_en: string
          name_fr: string
          name_tr: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name_ar?: string
          name_en?: string
          name_fr?: string
          name_tr?: string
          slug?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          id: number
          og_image: string | null
          section_order: string[]
          seo_description: string
          seo_title: string
          site_description: string
          site_name: string
          social_links: Json
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          id?: number
          og_image?: string | null
          section_order?: string[]
          seo_description?: string
          seo_title?: string
          site_description?: string
          site_name?: string
          social_links?: Json
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          id?: number
          og_image?: string | null
          section_order?: string[]
          seo_description?: string
          seo_title?: string
          site_description?: string
          site_name?: string
          social_links?: Json
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          suspended: boolean
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          suspended?: boolean
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          suspended?: boolean
        }
        Relationships: []
      }
      seasons: {
        Row: {
          created_at: string
          id: string
          season_number: number
          series_id: string
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          season_number: number
          series_id: string
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          season_number?: number
          series_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seasons_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      series: {
        Row: {
          cast_members: Json
          cover_url: string | null
          created_at: string
          id: string
          is_latest: boolean
          is_original: boolean
          is_published: boolean
          is_trending: boolean
          keywords: string | null
          poster_url: string | null
          production: string | null
          production_status: Database["public"]["Enums"]["production_status"]
          release_date: string | null
          release_year: number | null
          slug: string
          synopsis: string
          title: string
          trailer_url: string | null
          updated_at: string
          views: number
        }
        Insert: {
          cast_members?: Json
          cover_url?: string | null
          created_at?: string
          id?: string
          is_latest?: boolean
          is_original?: boolean
          is_published?: boolean
          is_trending?: boolean
          keywords?: string | null
          poster_url?: string | null
          production?: string | null
          production_status?: Database["public"]["Enums"]["production_status"]
          release_date?: string | null
          release_year?: number | null
          slug: string
          synopsis?: string
          title: string
          trailer_url?: string | null
          updated_at?: string
          views?: number
        }
        Update: {
          cast_members?: Json
          cover_url?: string | null
          created_at?: string
          id?: string
          is_latest?: boolean
          is_original?: boolean
          is_published?: boolean
          is_trending?: boolean
          keywords?: string | null
          poster_url?: string | null
          production?: string | null
          production_status?: Database["public"]["Enums"]["production_status"]
          release_date?: string | null
          release_year?: number | null
          slug?: string
          synopsis?: string
          title?: string
          trailer_url?: string | null
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      series_genres: {
        Row: {
          genre_id: string
          series_id: string
        }
        Insert: {
          genre_id: string
          series_id: string
        }
        Update: {
          genre_id?: string
          series_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "series_genres_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
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
      view_events: {
        Row: {
          created_at: string
          episode_id: string
          id: number
          series_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          episode_id: string
          id?: never
          series_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          episode_id?: string
          id?: never
          series_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "view_events_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "view_events_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_history: {
        Row: {
          duration_seconds: number
          episode_id: string
          id: string
          progress_seconds: number
          series_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          duration_seconds?: number
          episode_id: string
          id?: string
          progress_seconds?: number
          series_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          duration_seconds?: number
          episode_id?: string
          id?: string
          progress_seconds?: number
          series_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_history_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_history_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          created_at: string
          series_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          series_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          series_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlists_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_daily_views: {
        Args: { _days?: number }
        Returns: {
          day: string
          views: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_suspended: { Args: { _user_id: string }; Returns: boolean }
      record_view: { Args: { _episode_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      production_status: "upcoming" | "ongoing" | "completed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
      production_status: ["upcoming", "ongoing", "completed"],
    },
  },
} as const
