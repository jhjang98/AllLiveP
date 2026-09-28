
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "announcement_indications": {
                  Row: {
                    "announcement_id": number,"code_id": number
                  }
                  Insert: {
                    "announcement_id": number,"code_id": number
                  }
                  Update: {
                    "announcement_id"?: number,"code_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "announcement_indications_announcement_id_fkey"
      columns: ["announcement_id"]
isOneToOne: false
      referencedRelation: "announcements"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "announcement_indications_code_id_fkey"
      columns: ["code_id"]
isOneToOne: false
      referencedRelation: "codes"
      referencedColumns: ["id"]
    }
                  ]
                },"announcements": {
                  Row: {
                    "age_max": number,"age_min": number,"attachment_path": string | null,"body": string,"clinical_step_id": number | null,"created_at": string,"created_by": string,"early_closed_at": string | null,"gender": Database["public"]['Enums']["gender_type"],"hidden": boolean,"id": number,"institution_id": number,"participation_text": string | null,"protocol_no": string | null,"reading_period_months": number,"recruit_end": string,"recruit_start": string,"reject_reason": string | null,"reviewed_at": string | null,"reviewed_by": string | null,"sensitive_consent_required": boolean,"sponsor_name": string | null,"status": Database["public"]['Enums']["announcement_status"],"target": Database["public"]['Enums']["target_type"],"target_count": number | null,"thumbnail_path": string | null,"title": string,"updated_at": string,"view_count": number
                  }
                  Insert: {
                    "age_max"?: number,"age_min"?: number,"attachment_path"?: string | null,"body": string,"clinical_step_id"?: number | null,"created_at"?: string,"created_by": string,"early_closed_at"?: string | null,"gender"?: Database["public"]['Enums']["gender_type"],"hidden"?: boolean,"id"?: never,"institution_id": number,"participation_text"?: string | null,"protocol_no"?: string | null,"reading_period_months"?: number,"recruit_end": string,"recruit_start": string,"reject_reason"?: string | null,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"sensitive_consent_required"?: boolean,"sponsor_name"?: string | null,"status"?: Database["public"]['Enums']["announcement_status"],"target"?: Database["public"]['Enums']["target_type"],"target_count"?: number | null,"thumbnail_path"?: string | null,"title": string,"updated_at"?: string,"view_count"?: number
                  }
                  Update: {
                    "age_max"?: number,"age_min"?: number,"attachment_path"?: string | null,"body"?: string,"clinical_step_id"?: number | null,"created_at"?: string,"created_by"?: string,"early_closed_at"?: string | null,"gender"?: Database["public"]['Enums']["gender_type"],"hidden"?: boolean,"id"?: never,"institution_id"?: number,"participation_text"?: string | null,"protocol_no"?: string | null,"reading_period_months"?: number,"recruit_end"?: string,"recruit_start"?: string,"reject_reason"?: string | null,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"sensitive_consent_required"?: boolean,"sponsor_name"?: string | null,"status"?: Database["public"]['Enums']["announcement_status"],"target"?: Database["public"]['Enums']["target_type"],"target_count"?: number | null,"thumbnail_path"?: string | null,"title"?: string,"updated_at"?: string,"view_count"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "announcements_clinical_step_id_fkey"
      columns: ["clinical_step_id"]
isOneToOne: false
      referencedRelation: "codes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "announcements_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "announcements_institution_id_fkey"
      columns: ["institution_id"]
isOneToOne: false
      referencedRelation: "institutions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "announcements_reviewed_by_fkey"
      columns: ["reviewed_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"application_events": {
                  Row: {
                    "actor_id": string | null,"actor_role": Database["public"]['Enums']["user_role"] | null,"application_id": number,"created_at": string,"event": Database["public"]['Enums']["app_event_type"],"from_status": Database["public"]['Enums']["application_status"] | null,"id": number,"ip": unknown,"reason": string | null,"to_status": Database["public"]['Enums']["application_status"] | null
                  }
                  Insert: {
                    "actor_id"?: string | null,"actor_role"?: Database["public"]['Enums']["user_role"] | null,"application_id": number,"created_at"?: string,"event": Database["public"]['Enums']["app_event_type"],"from_status"?: Database["public"]['Enums']["application_status"] | null,"id"?: never,"ip"?: unknown,"reason"?: string | null,"to_status"?: Database["public"]['Enums']["application_status"] | null
                  }
                  Update: {
                    "actor_id"?: string | null,"actor_role"?: Database["public"]['Enums']["user_role"] | null,"application_id"?: number,"created_at"?: string,"event"?: Database["public"]['Enums']["app_event_type"],"from_status"?: Database["public"]['Enums']["application_status"] | null,"id"?: never,"ip"?: unknown,"reason"?: string | null,"to_status"?: Database["public"]['Enums']["application_status"] | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "application_events_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "application_events_application_id_fkey"
      columns: ["application_id"]
isOneToOne: false
      referencedRelation: "applications"
      referencedColumns: ["id"]
    }
                  ]
                },"applications": {
                  Row: {
                    "announcement_id": number,"applied_at": string,"canceled_at": string | null,"city": string,"consent_privacy": boolean,"consent_sensitive": boolean,"consent_sensitive_third": boolean,"consent_third_party": boolean,"district": string,"id": number,"member_id": string,"not_selected_reason_id": number | null,"status": Database["public"]['Enums']["application_status"]
                  }
                  Insert: {
                    "announcement_id": number,"applied_at"?: string,"canceled_at"?: string | null,"city": string,"consent_privacy": boolean,"consent_sensitive"?: boolean,"consent_sensitive_third"?: boolean,"consent_third_party": boolean,"district": string,"id"?: never,"member_id": string,"not_selected_reason_id"?: number | null,"status"?: Database["public"]['Enums']["application_status"]
                  }
                  Update: {
                    "announcement_id"?: number,"applied_at"?: string,"canceled_at"?: string | null,"city"?: string,"consent_privacy"?: boolean,"consent_sensitive"?: boolean,"consent_sensitive_third"?: boolean,"consent_third_party"?: boolean,"district"?: string,"id"?: never,"member_id"?: string,"not_selected_reason_id"?: number | null,"status"?: Database["public"]['Enums']["application_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "applications_announcement_id_fkey"
      columns: ["announcement_id"]
isOneToOne: false
      referencedRelation: "announcements"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "applications_member_id_fkey"
      columns: ["member_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "applications_not_selected_reason_id_fkey"
      columns: ["not_selected_reason_id"]
isOneToOne: false
      referencedRelation: "codes"
      referencedColumns: ["id"]
    }
                  ]
                },"codes": {
                  Row: {
                    "active": boolean,"id": number,"name": string,"parent_id": number | null,"sort": number,"type": Database["public"]['Enums']["code_type"]
                  }
                  Insert: {
                    "active"?: boolean,"id"?: never,"name": string,"parent_id"?: number | null,"sort"?: number,"type": Database["public"]['Enums']["code_type"]
                  }
                  Update: {
                    "active"?: boolean,"id"?: never,"name"?: string,"parent_id"?: number | null,"sort"?: number,"type"?: Database["public"]['Enums']["code_type"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "codes_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "codes"
      referencedColumns: ["id"]
    }
                  ]
                },"faqs": {
                  Row: {
                    "answer": string,"category": string | null,"id": number,"published": boolean,"question": string,"sort": number
                  }
                  Insert: {
                    "answer": string,"category"?: string | null,"id"?: never,"published"?: boolean,"question": string,"sort"?: number
                  }
                  Update: {
                    "answer"?: string,"category"?: string | null,"id"?: never,"published"?: boolean,"question"?: string,"sort"?: number
                  }
                  Relationships: [
                    
                  ]
                },"institution_members": {
                  Row: {
                    "institution_id": number,"member_role": string,"profile_id": string
                  }
                  Insert: {
                    "institution_id": number,"member_role"?: string,"profile_id": string
                  }
                  Update: {
                    "institution_id"?: number,"member_role"?: string,"profile_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "institution_members_institution_id_fkey"
      columns: ["institution_id"]
isOneToOne: false
      referencedRelation: "institutions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "institution_members_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"institutions": {
                  Row: {
                    "address": string | null,"address_detail": string | null,"biz_cert_path": string,"biz_reg_no": string,"created_at": string,"id": number,"intro": string | null,"lat": number | null,"lng": number | null,"logo_path": string | null,"name": string,"phone": string | null,"reviewed_at": string | null,"reviewed_by": string | null,"status": Database["public"]['Enums']["institution_status"],"status_reason": string | null
                  }
                  Insert: {
                    "address"?: string | null,"address_detail"?: string | null,"biz_cert_path": string,"biz_reg_no": string,"created_at"?: string,"id"?: never,"intro"?: string | null,"lat"?: number | null,"lng"?: number | null,"logo_path"?: string | null,"name": string,"phone"?: string | null,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"status"?: Database["public"]['Enums']["institution_status"],"status_reason"?: string | null
                  }
                  Update: {
                    "address"?: string | null,"address_detail"?: string | null,"biz_cert_path"?: string,"biz_reg_no"?: string,"created_at"?: string,"id"?: never,"intro"?: string | null,"lat"?: number | null,"lng"?: number | null,"logo_path"?: string | null,"name"?: string,"phone"?: string | null,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"status"?: Database["public"]['Enums']["institution_status"],"status_reason"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "institutions_reviewed_by_fkey"
      columns: ["reviewed_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"member_diseases": {
                  Row: {
                    "code_id": number,"profile_id": string
                  }
                  Insert: {
                    "code_id": number,"profile_id": string
                  }
                  Update: {
                    "code_id"?: number,"profile_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "member_diseases_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"notices": {
                  Row: {
                    "body": string,"created_at": string,"created_by": string | null,"id": number,"published": boolean,"title": string
                  }
                  Insert: {
                    "body": string,"created_at"?: string,"created_by"?: string | null,"id"?: never,"published"?: boolean,"title": string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"created_by"?: string | null,"id"?: never,"published"?: boolean,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notices_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"notifications": {
                  Row: {
                    "created_at": string,"error": string | null,"id": number,"payload": NonNullable<Json>,"recipient_email": string,"sent_at": string | null,"template": string
                  }
                  Insert: {
                    "created_at"?: string,"error"?: string | null,"id"?: never,"payload"?: NonNullable<Json>,"recipient_email": string,"sent_at"?: string | null,"template": string
                  }
                  Update: {
                    "created_at"?: string,"error"?: string | null,"id"?: never,"payload"?: NonNullable<Json>,"recipient_email"?: string,"sent_at"?: string | null,"template"?: string
                  }
                  Relationships: [
                    
                  ]
                },"phone_verifications": {
                  Row: {
                    "code_hash": string,"created_at": string,"expires_at": string,"id": number,"phone": string,"purpose": string,"verified_at": string | null
                  }
                  Insert: {
                    "code_hash": string,"created_at"?: string,"expires_at": string,"id"?: never,"phone": string,"purpose"?: string,"verified_at"?: string | null
                  }
                  Update: {
                    "code_hash"?: string,"created_at"?: string,"expires_at"?: string,"id"?: never,"phone"?: string,"purpose"?: string,"verified_at"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "birth_date": string | null,"city": string | null,"created_at": string,"district": string | null,"gender": Database["public"]['Enums']["person_gender"] | null,"id": string,"marketing_agreed_at": string | null,"matching_agreed_at": string | null,"name": string | null,"person_type": Database["public"]['Enums']["target_type"] | null,"phone": string | null,"phone_verified_at": string | null,"role": Database["public"]['Enums']["user_role"],"withdrawn_at": string | null
                  }
                  Insert: {
                    "birth_date"?: string | null,"city"?: string | null,"created_at"?: string,"district"?: string | null,"gender"?: Database["public"]['Enums']["person_gender"] | null,"id": string,"marketing_agreed_at"?: string | null,"matching_agreed_at"?: string | null,"name"?: string | null,"person_type"?: Database["public"]['Enums']["target_type"] | null,"phone"?: string | null,"phone_verified_at"?: string | null,"role"?: Database["public"]['Enums']["user_role"],"withdrawn_at"?: string | null
                  }
                  Update: {
                    "birth_date"?: string | null,"city"?: string | null,"created_at"?: string,"district"?: string | null,"gender"?: Database["public"]['Enums']["person_gender"] | null,"id"?: string,"marketing_agreed_at"?: string | null,"matching_agreed_at"?: string | null,"name"?: string | null,"person_type"?: Database["public"]['Enums']["target_type"] | null,"phone"?: string | null,"phone_verified_at"?: string | null,"role"?: Database["public"]['Enums']["user_role"],"withdrawn_at"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"prospective_diseases": {
                  Row: {
                    "code_id": number,"custom_title": string | null,"registration_id": number
                  }
                  Insert: {
                    "code_id": number,"custom_title"?: string | null,"registration_id": number
                  }
                  Update: {
                    "code_id"?: number,"custom_title"?: string | null,"registration_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "prospective_diseases_code_id_fkey"
      columns: ["code_id"]
isOneToOne: false
      referencedRelation: "codes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "prospective_diseases_registration_id_fkey"
      columns: ["registration_id"]
isOneToOne: false
      referencedRelation: "prospective_registrations"
      referencedColumns: ["id"]
    }
                  ]
                },"prospective_registrations": {
                  Row: {
                    "birth_date": string | null,"canceled_at": string | null,"city": string | null,"created_at": string,"district": string | null,"gender": Database["public"]['Enums']["person_gender"] | null,"id": number,"name": string,"person_type": Database["public"]['Enums']["target_type"] | null,"phone": string
                  }
                  Insert: {
                    "birth_date"?: string | null,"canceled_at"?: string | null,"city"?: string | null,"created_at"?: string,"district"?: string | null,"gender"?: Database["public"]['Enums']["person_gender"] | null,"id"?: never,"name": string,"person_type"?: Database["public"]['Enums']["target_type"] | null,"phone": string
                  }
                  Update: {
                    "birth_date"?: string | null,"canceled_at"?: string | null,"city"?: string | null,"created_at"?: string,"district"?: string | null,"gender"?: Database["public"]['Enums']["person_gender"] | null,"id"?: never,"name"?: string,"person_type"?: Database["public"]['Enums']["target_type"] | null,"phone"?: string
                  }
                  Relationships: [
                    
                  ]
                },"scraps": {
                  Row: {
                    "announcement_id": number,"created_at": string,"profile_id": string
                  }
                  Insert: {
                    "announcement_id": number,"created_at"?: string,"profile_id": string
                  }
                  Update: {
                    "announcement_id"?: number,"created_at"?: string,"profile_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "scraps_announcement_id_fkey"
      columns: ["announcement_id"]
isOneToOne: false
      referencedRelation: "announcements"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "scraps_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
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
            "announcement_status": "draft"|"pending_review"|"rejected"|"approved"|"closed","app_event_type": "status_change"|"pii_view"|"submit"|"note","application_status": "applied"|"viewed"|"in_progress"|"selected"|"not_selected"|"canceled","code_type": "indication"|"clinical_step"|"interest"|"not_selected_reason","gender_type": "female"|"male"|"any","institution_status": "pending"|"approved"|"rejected"|"suspended","person_gender": "female"|"male","target_type": "patient"|"healthy"|"all","user_role": "member"|"institution"|"admin"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "announcement_status": ["draft", "pending_review", "rejected", "approved", "closed"],"app_event_type": ["status_change", "pii_view", "submit", "note"],"application_status": ["applied", "viewed", "in_progress", "selected", "not_selected", "canceled"],"code_type": ["indication", "clinical_step", "interest", "not_selected_reason"],"gender_type": ["female", "male", "any"],"institution_status": ["pending", "approved", "rejected", "suspended"],"person_gender": ["female", "male"],"target_type": ["patient", "healthy", "all"],"user_role": ["member", "institution", "admin"]
          }
        }
} as const

