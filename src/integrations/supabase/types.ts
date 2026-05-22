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
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name_ar: string
          name_en: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name_ar: string
          name_en: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name_ar?: string
          name_en?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          city: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          name_ar: string | null
          rating: number | null
          verified: boolean | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          name_ar?: string | null
          rating?: number | null
          verified?: boolean | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          name_ar?: string | null
          rating?: number | null
          verified?: boolean | null
        }
        Relationships: []
      }
      completed_projects: {
        Row: {
          area_m2: number | null
          category: string | null
          city: string | null
          created_at: string | null
          description: string | null
          description_ar: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          images: Json | null
          title: string
          title_ar: string | null
          year: number | null
        }
        Insert: {
          area_m2?: number | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          images?: Json | null
          title: string
          title_ar?: string | null
          year?: number | null
        }
        Update: {
          area_m2?: number | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          images?: Json | null
          title?: string
          title_ar?: string | null
          year?: number | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          message: string
          phone: string | null
          status: string | null
          subject: string
          ticket_number: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          message: string
          phone?: string | null
          status?: string | null
          subject: string
          ticket_number?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string | null
          status?: string | null
          subject?: string
          ticket_number?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contractor_bids: {
        Row: {
          contractor_id: string
          created_at: string | null
          details: string | null
          duration_days: number
          id: string
          materials: string | null
          payment_schedule: Json | null
          price: number
          project_id: string
          status: string
          user_id: string
          warranty_months: number | null
        }
        Insert: {
          contractor_id: string
          created_at?: string | null
          details?: string | null
          duration_days: number
          id?: string
          materials?: string | null
          payment_schedule?: Json | null
          price: number
          project_id: string
          status?: string
          user_id: string
          warranty_months?: number | null
        }
        Update: {
          contractor_id?: string
          created_at?: string | null
          details?: string | null
          duration_days?: number
          id?: string
          materials?: string | null
          payment_schedule?: Json | null
          price?: number
          project_id?: string
          status?: string
          user_id?: string
          warranty_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contractor_bids_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contractor_bids_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "turnkey_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          bio: string | null
          bio_ar: string | null
          completed_projects: number | null
          created_at: string | null
          email: string | null
          experience_years: number | null
          featured: boolean | null
          id: string
          logo_url: string | null
          name: string
          name_ar: string | null
          phone: string | null
          portfolio: Json | null
          rating: number | null
          rating_count: number | null
          regions: string[] | null
          specialties: string[] | null
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          bio?: string | null
          bio_ar?: string | null
          completed_projects?: number | null
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          featured?: boolean | null
          id?: string
          logo_url?: string | null
          name: string
          name_ar?: string | null
          phone?: string | null
          portfolio?: Json | null
          rating?: number | null
          rating_count?: number | null
          regions?: string[] | null
          specialties?: string[] | null
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          bio?: string | null
          bio_ar?: string | null
          completed_projects?: number | null
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          featured?: boolean | null
          id?: string
          logo_url?: string | null
          name?: string
          name_ar?: string | null
          phone?: string | null
          portfolio?: Json | null
          rating?: number | null
          rating_count?: number | null
          regions?: string[] | null
          specialties?: string[] | null
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          max_uses: number | null
          min_order: number
          used_count: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_order?: number
          used_count?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_order?: number
          used_count?: number
        }
        Relationships: []
      }
      inspection_requests: {
        Row: {
          address: string
          area_m2: number | null
          city: string
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          inspection_type: string
          notes: string | null
          phone: string
          preferred_date: string | null
          preferred_time: string | null
          project_type: string | null
          status: string | null
          ticket_number: string | null
          user_id: string | null
        }
        Insert: {
          address: string
          area_m2?: number | null
          city: string
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          inspection_type: string
          notes?: string | null
          phone: string
          preferred_date?: string | null
          preferred_time?: string | null
          project_type?: string | null
          status?: string | null
          ticket_number?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string
          area_m2?: number | null
          city?: string
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          inspection_type?: string
          notes?: string | null
          phone?: string
          preferred_date?: string | null
          preferred_time?: string | null
          project_type?: string | null
          status?: string | null
          ticket_number?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_tracking: {
        Row: {
          created_at: string | null
          id: string
          note: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          note?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          id?: string
          note?: string | null
          order_id?: string
          status?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string
          city: string
          created_at: string | null
          delivery_fee: number | null
          discount_amount: number
          discount_code: string | null
          full_name: string
          id: string
          notes: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          phone: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax: number | null
          total: number
          user_id: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          delivery_fee?: number | null
          discount_amount?: number
          discount_code?: string | null
          full_name: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          phone: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax?: number | null
          total: number
          user_id: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          delivery_fee?: number | null
          discount_amount?: number
          discount_code?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          phone?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number | null
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      price_quotes: {
        Row: {
          area_m2: number
          breakdown: Json | null
          created_at: string | null
          estimated_total: number | null
          finish_level: string | null
          floors: number | null
          full_name: string
          id: string
          notes: string | null
          phone: string
          project_type: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          area_m2: number
          breakdown?: Json | null
          created_at?: string | null
          estimated_total?: number | null
          finish_level?: string | null
          floors?: number | null
          full_name: string
          id?: string
          notes?: string | null
          phone: string
          project_type: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          area_m2?: number
          breakdown?: Json | null
          created_at?: string | null
          estimated_total?: number | null
          finish_level?: string | null
          floors?: number | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string
          project_type?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          company_id: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          images: Json | null
          in_stock: boolean | null
          name_ar: string
          name_en: string
          order_count: number | null
          price: number
          rating: number | null
          rating_count: number | null
          stock_quantity: number | null
          unit_ar: string | null
          unit_en: string | null
          verified: boolean | null
        }
        Insert: {
          category_id?: string | null
          company_id?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          images?: Json | null
          in_stock?: boolean | null
          name_ar: string
          name_en: string
          order_count?: number | null
          price: number
          rating?: number | null
          rating_count?: number | null
          stock_quantity?: number | null
          unit_ar?: string | null
          unit_en?: string | null
          verified?: boolean | null
        }
        Update: {
          category_id?: string | null
          company_id?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          images?: Json | null
          in_stock?: boolean | null
          name_ar?: string
          name_en?: string
          order_count?: number | null
          price?: number
          rating?: number | null
          rating_count?: number | null
          stock_quantity?: number | null
          unit_ar?: string | null
          unit_en?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          language: string | null
          loyalty_points: number
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          theme: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          language?: string | null
          loyalty_points?: number
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          theme?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          language?: string | null
          loyalty_points?: number
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          theme?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_payments: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string | null
          id: string
          label: string
          paid_at: string | null
          payment_method: string | null
          project_id: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          label: string
          paid_at?: string | null
          payment_method?: string | null
          project_id: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          label?: string
          paid_at?: string | null
          payment_method?: string | null
          project_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "turnkey_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          photos: Json | null
          progress_percent: number | null
          project_id: string
          stage: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          photos?: Json | null
          progress_percent?: number | null
          project_id: string
          stage?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          photos?: Json | null
          progress_percent?: number | null
          project_id?: string
          stage?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "turnkey_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          product_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_offers: {
        Row: {
          created_at: string | null
          delivery_days: number | null
          id: string
          notes: string | null
          rfq_id: string
          status: string | null
          supplier_id: string | null
          supplier_name: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          delivery_days?: number | null
          id?: string
          notes?: string | null
          rfq_id: string
          status?: string | null
          supplier_id?: string | null
          supplier_name: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          delivery_days?: number | null
          id?: string
          notes?: string | null
          rfq_id?: string
          status?: string | null
          supplier_id?: string | null
          supplier_name?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "rfq_offers_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfq_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_offers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_requests: {
        Row: {
          city: string
          created_at: string | null
          delivery_date: string | null
          email: string | null
          full_name: string
          id: string
          material: string
          notes: string | null
          phone: string
          quantity: number
          status: string | null
          ticket_number: string | null
          unit: string | null
          user_id: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          delivery_date?: string | null
          email?: string | null
          full_name: string
          id?: string
          material: string
          notes?: string | null
          phone: string
          quantity: number
          status?: string | null
          ticket_number?: string | null
          unit?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          delivery_date?: string | null
          email?: string | null
          full_name?: string
          id?: string
          material?: string
          notes?: string | null
          phone?: string
          quantity?: number
          status?: string | null
          ticket_number?: string | null
          unit?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          features_ar: Json
          features_en: Json
          id: string
          name_ar: string
          name_en: string
          popular: boolean | null
          price_monthly: number
          price_yearly: number
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          features_ar?: Json
          features_en?: Json
          id?: string
          name_ar: string
          name_en: string
          popular?: boolean | null
          price_monthly: number
          price_yearly: number
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          features_ar?: Json
          features_en?: Json
          id?: string
          name_ar?: string
          name_en?: string
          popular?: boolean | null
          price_monthly?: number
          price_yearly?: number
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          category: string | null
          city: string | null
          created_at: string | null
          description: string | null
          description_ar: string | null
          email: string | null
          featured: boolean | null
          id: string
          logo_url: string | null
          name: string
          name_ar: string | null
          phone: string | null
          rating: number | null
          type: string
          verified: boolean | null
        }
        Insert: {
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          email?: string | null
          featured?: boolean | null
          id?: string
          logo_url?: string | null
          name: string
          name_ar?: string | null
          phone?: string | null
          rating?: number | null
          type?: string
          verified?: boolean | null
        }
        Update: {
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          email?: string | null
          featured?: boolean | null
          id?: string
          logo_url?: string | null
          name?: string
          name_ar?: string | null
          phone?: string | null
          rating?: number | null
          type?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      turnkey_projects: {
        Row: {
          accepted_bid_id: string | null
          address: string | null
          area_m2: number
          assigned_contractor_id: string | null
          budget_max: number | null
          budget_min: number | null
          city: string
          created_at: string | null
          description: string | null
          email: string | null
          expected_end_date: string | null
          finish_level: string | null
          floors: number | null
          full_name: string
          id: string
          phone: string
          plans_urls: Json | null
          progress_percent: number | null
          project_number: string
          project_type: string
          start_date: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_bid_id?: string | null
          address?: string | null
          area_m2: number
          assigned_contractor_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          expected_end_date?: string | null
          finish_level?: string | null
          floors?: number | null
          full_name: string
          id?: string
          phone: string
          plans_urls?: Json | null
          progress_percent?: number | null
          project_number?: string
          project_type: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_bid_id?: string | null
          address?: string | null
          area_m2?: number
          assigned_contractor_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          expected_end_date?: string | null
          finish_level?: string | null
          floors?: number | null
          full_name?: string
          id?: string
          phone?: string
          plans_urls?: Json | null
          progress_percent?: number | null
          project_number?: string
          project_type?: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      user_subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string | null
          ends_at: string | null
          id: string
          plan_id: string
          starts_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string | null
          ends_at?: string | null
          id?: string
          plan_id: string
          starts_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string | null
          ends_at?: string | null
          id?: string
          plan_id?: string
          starts_at?: string | null
          status?: string
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
      app_role: "admin" | "supplier" | "driver" | "customer"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      payment_method: "cash" | "cliq" | "card" | "bank_transfer"
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
      app_role: ["admin", "supplier", "driver", "customer"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      payment_method: ["cash", "cliq", "card", "bank_transfer"],
    },
  },
} as const
