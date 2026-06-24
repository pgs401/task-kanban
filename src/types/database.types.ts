export type ColumnId = "todo" | "in_progress" | "done";

export interface Database {
  public: {
    Tables: {
      boards: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      cards: {
        Row: {
          id: string;
          board_id: string;
          column: ColumnId;
          title: string;
          description: string | null;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          column: ColumnId;
          title: string;
          description?: string | null;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          column?: ColumnId;
          title?: string;
          description?: string | null;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Board = Database["public"]["Tables"]["boards"]["Row"];
export type Card = Database["public"]["Tables"]["cards"]["Row"];
