export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          cpf: string | null;
          cpf_consultor: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          cpf?: string | null;
          cpf_consultor?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          cpf?: string | null;
          cpf_consultor?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      consultores: {
        Row: {
          id: string;
          cpf: string;
          name: string;
          email: string;
          auth_user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          cpf: string;
          name: string;
          email: string;
          auth_user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          cpf?: string;
          name?: string;
          email?: string;
          auth_user_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      institutions: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      positions: {
        Row: {
          id: string;
          client_id: string;
          institution: string;
          asset_name: string;
          asset_type: string;
          amount: number;
          quantity: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          institution: string;
          asset_name: string;
          asset_type: string;
          amount?: number;
          quantity?: number;
          date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          institution?: string;
          asset_name?: string;
          asset_type?: string;
          amount?: number;
          quantity?: number;
          date?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          client_id: string;
          file_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          file_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          file_url?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      extracted_positions: {
        Row: {
          id: string;
          document_id: string;
          client_id: string | null;
          asset_name: string;
          institution: string;
          amount: number;
          quantity: number;
          asset_type: string;
          confirmed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          client_id?: string | null;
          asset_name: string;
          institution: string;
          amount?: number;
          quantity?: number;
          asset_type: string;
          confirmed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          client_id?: string | null;
          asset_name?: string;
          institution?: string;
          amount?: number;
          quantity?: number;
          asset_type?: string;
          confirmed?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          description: string | null;
          target_amount: number;
          current_amount: number;
          monthly_contribution: number;
          expected_annual_return: number;
          deadline: string | null;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          description?: string | null;
          target_amount: number;
          current_amount?: number;
          monthly_contribution?: number;
          expected_annual_return?: number;
          deadline?: string | null;
          category?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          title?: string;
          description?: string | null;
          target_amount?: number;
          current_amount?: number;
          monthly_contribution?: number;
          expected_annual_return?: number;
          deadline?: string | null;
          category?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
