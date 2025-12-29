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
      budget_projects: {
        Row: {
          allocated_amount: number
          created_at: string
          description: string | null
          district: string | null
          donor: string | null
          end_year: number | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          region: string
          sector: string
          source_type: string
          spent_amount: number
          start_year: number | null
          status: string
          updated_at: string
        }
        Insert: {
          allocated_amount?: number
          created_at?: string
          description?: string | null
          district?: string | null
          donor?: string | null
          end_year?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          region: string
          sector: string
          source_type: string
          spent_amount?: number
          start_year?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          allocated_amount?: number
          created_at?: string
          description?: string | null
          district?: string | null
          donor?: string | null
          end_year?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          region?: string
          sector?: string
          source_type?: string
          spent_amount?: number
          start_year?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback_images: {
        Row: {
          created_at: string | null
          feedback_id: string
          id: string
          image_url: string
        }
        Insert: {
          created_at?: string | null
          feedback_id: string
          id?: string
          image_url: string
        }
        Update: {
          created_at?: string | null
          feedback_id?: string
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_images_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedbacks"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_status_history: {
        Row: {
          changed_by: string | null
          comment: string | null
          created_at: string | null
          feedback_id: string
          id: string
          status: Database["public"]["Enums"]["feedback_status"]
        }
        Insert: {
          changed_by?: string | null
          comment?: string | null
          created_at?: string | null
          feedback_id: string
          id?: string
          status: Database["public"]["Enums"]["feedback_status"]
        }
        Update: {
          changed_by?: string | null
          comment?: string | null
          created_at?: string | null
          feedback_id?: string
          id?: string
          status?: Database["public"]["Enums"]["feedback_status"]
        }
        Relationships: [
          {
            foreignKeyName: "feedback_status_history_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedbacks"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          admin_comment: string | null
          author_name: string | null
          author_phone: string | null
          created_at: string | null
          description: string
          id: string
          is_anonymous: boolean | null
          issue_type: Database["public"]["Enums"]["issue_type"]
          object_id: string
          status: Database["public"]["Enums"]["feedback_status"] | null
          updated_at: string | null
          user_id: string | null
          votes: number | null
        }
        Insert: {
          admin_comment?: string | null
          author_name?: string | null
          author_phone?: string | null
          created_at?: string | null
          description: string
          id?: string
          is_anonymous?: boolean | null
          issue_type: Database["public"]["Enums"]["issue_type"]
          object_id: string
          status?: Database["public"]["Enums"]["feedback_status"] | null
          updated_at?: string | null
          user_id?: string | null
          votes?: number | null
        }
        Update: {
          admin_comment?: string | null
          author_name?: string | null
          author_phone?: string | null
          created_at?: string | null
          description?: string
          id?: string
          is_anonymous?: boolean | null
          issue_type?: Database["public"]["Enums"]["issue_type"]
          object_id?: string
          status?: Database["public"]["Enums"]["feedback_status"] | null
          updated_at?: string | null
          user_id?: string | null
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "infrastructure_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      game_scores: {
        Row: {
          game_type: string
          id: string
          level: number
          played_at: string
          score: number
          user_id: string | null
        }
        Insert: {
          game_type: string
          id?: string
          level?: number
          played_at?: string
          score?: number
          user_id?: string | null
        }
        Update: {
          game_type?: string
          id?: string
          level?: number
          played_at?: string
          score?: number
          user_id?: string | null
        }
        Relationships: []
      }
      infrastructure_objects: {
        Row: {
          address: string
          built_year: number | null
          capacity: number | null
          created_at: string | null
          district: string
          id: string
          is_new: boolean | null
          is_reconstructed: boolean | null
          last_renovation: number | null
          lat: number
          lng: number
          name: string
          rating: number | null
          region: string
          total_feedbacks: number | null
          total_reviews: number | null
          type: Database["public"]["Enums"]["object_type"]
        }
        Insert: {
          address: string
          built_year?: number | null
          capacity?: number | null
          created_at?: string | null
          district: string
          id?: string
          is_new?: boolean | null
          is_reconstructed?: boolean | null
          last_renovation?: number | null
          lat: number
          lng: number
          name: string
          rating?: number | null
          region: string
          total_feedbacks?: number | null
          total_reviews?: number | null
          type: Database["public"]["Enums"]["object_type"]
        }
        Update: {
          address?: string
          built_year?: number | null
          capacity?: number | null
          created_at?: string | null
          district?: string
          id?: string
          is_new?: boolean | null
          is_reconstructed?: boolean | null
          last_renovation?: number | null
          lat?: number
          lng?: number
          name?: string
          rating?: number | null
          region?: string
          total_feedbacks?: number | null
          total_reviews?: number | null
          type?: Database["public"]["Enums"]["object_type"]
        }
        Relationships: []
      }
      news: {
        Row: {
          author_id: string | null
          category: string
          content: string
          created_at: string
          district: string | null
          id: string
          image_url: string | null
          is_published: boolean
          published_at: string
          region: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string
          content: string
          created_at?: string
          district?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string
          region?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string
          district?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string
          region?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string | null
          comment: string | null
          created_at: string | null
          id: string
          object_id: string
          rating: number
          user_id: string | null
        }
        Insert: {
          author_name?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          object_id: string
          rating: number
          user_id?: string | null
        }
        Update: {
          author_name?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          object_id?: string
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "infrastructure_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_rating_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          solution_rating_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          solution_rating_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          solution_rating_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_rating_images_solution_rating_id_fkey"
            columns: ["solution_rating_id"]
            isOneToOne: false
            referencedRelation: "solution_ratings"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_ratings: {
        Row: {
          comment: string | null
          created_at: string
          feedback_id: string
          id: string
          rating: number
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          feedback_id: string
          id?: string
          rating: number
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          feedback_id?: string
          id?: string
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solution_ratings_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedbacks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Enums: {
      app_role: "admin" | "user"
      feedback_status:
        | "submitted"
        | "reviewing"
        | "in_progress"
        | "completed"
        | "rejected"
      issue_type:
        | "water_supply"
        | "road_condition"
        | "heating"
        | "medical_quality"
        | "staff_shortage"
        | "infrastructure"
        | "other"
      object_type: "school" | "kindergarten" | "clinic" | "water" | "road"
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
      feedback_status: [
        "submitted",
        "reviewing",
        "in_progress",
        "completed",
        "rejected",
      ],
      issue_type: [
        "water_supply",
        "road_condition",
        "heating",
        "medical_quality",
        "staff_shortage",
        "infrastructure",
        "other",
      ],
      object_type: ["school", "kindergarten", "clinic", "water", "road"],
    },
  },
} as const
