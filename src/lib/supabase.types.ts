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
      bookings: {
        Row: {
          amount: number
          contact_info: string
          contact_platform: string
          created_at: string
          email: string
          id: string
          name: string
          slots: string[]
          status: string
        }
        Insert: {
          amount: number
          contact_info: string
          contact_platform: string
          created_at?: string
          email: string
          id?: string
          name: string
          slots: string[]
          status?: string
        }
        Update: {
          amount?: number
          contact_info?: string
          contact_platform?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          slots?: string[]
          status?: string
        }
        Relationships: []
      }
      lead_submissions: {
        Row: {
          budget: string | null
          company: string | null
          created_at: string | null
          design_end_date: string | null
          design_start_date: string | null
          design_type: string | null
          email: string
          freelance_dates: string[] | null
          freelance_type: string | null
          id: string
          is_freelance: boolean | null
          is_partnership: boolean | null
          job_type: string | null
          name: string
          other_design_type: string | null
          other_work_type: string | null
          partnership_needs: string[] | null
          partnership_pitch: string | null
          partnership_type: string | null
          phone: string | null
          project: string
          status: string | null
          timeline: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: string | null
          company?: string | null
          created_at?: string | null
          design_end_date?: string | null
          design_start_date?: string | null
          design_type?: string | null
          email: string
          freelance_dates?: string[] | null
          freelance_type?: string | null
          id?: string
          is_freelance?: boolean | null
          is_partnership?: boolean | null
          job_type?: string | null
          name: string
          other_design_type?: string | null
          other_work_type?: string | null
          partnership_needs?: string[] | null
          partnership_pitch?: string | null
          partnership_type?: string | null
          phone?: string | null
          project: string
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: string | null
          company?: string | null
          created_at?: string | null
          design_end_date?: string | null
          design_start_date?: string | null
          design_type?: string | null
          email?: string
          freelance_dates?: string[] | null
          freelance_type?: string | null
          id?: string
          is_freelance?: boolean | null
          is_partnership?: boolean | null
          job_type?: string | null
          name?: string
          other_design_type?: string | null
          other_work_type?: string | null
          partnership_needs?: string[] | null
          partnership_pitch?: string | null
          partnership_type?: string | null
          phone?: string | null
          project?: string
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quick_chat_requests: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string | null
          name: string
          preferred_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message?: string | null
          name: string
          preferred_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string | null
          name?: string
          preferred_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      timer_logs: {
        Row: {
          id: string
          name: string
          start_time: string
          end_time: string | null
          initial_hours: number
          initial_minutes: number
          initial_seconds: number
          final_hours: number
          final_minutes: number
          final_seconds: number
          was_completed: boolean
          over_time: boolean
          over_time_amount: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          start_time: string
          end_time?: string | null
          initial_hours: number
          initial_minutes: number
          initial_seconds: number
          final_hours: number
          final_minutes: number
          final_seconds: number
          was_completed: boolean
          over_time: boolean
          over_time_amount?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_time?: string
          end_time?: string | null
          initial_hours?: number
          initial_minutes?: number
          initial_seconds?: number
          final_hours?: number
          final_minutes?: number
          final_seconds?: number
          was_completed?: boolean
          over_time?: boolean
          over_time_amount?: Json | null
          created_at?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never 