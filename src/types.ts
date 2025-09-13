// src/types.ts

// Artwork type for individual artworks
export interface Artwork {
  id: number;
  title?: string;
  place_of_origin?: string;
  artist_display?: string;
  inscriptions?: string;
  date_start?: number;
  date_end?: number;
  [key: string]: any; // fallback for extra fields
}

// Pagination type based on API response
export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  total_pages: number;
  current_page: number;
  next_url?: string | null;
}

// The full API response structure
export interface ApiResponse {
  data: Artwork[];
  pagination: Pagination;
}
