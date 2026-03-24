export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          created_at?: string;
        };
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
      };
      extracted_positions: {
        Row: {
          id: string;
          document_id: string;
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
          asset_name?: string;
          institution?: string;
          amount?: number;
          quantity?: number;
          asset_type?: string;
          confirmed?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
