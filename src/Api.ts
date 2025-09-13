// src/api.ts
import type { ApiResponse } from "./types";

export async function fetchPage(page: number): Promise<ApiResponse> {
  try {
    const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();

    return {
      data: json.data,
      pagination: json.pagination,
    } as ApiResponse;
  } catch (error) {
    console.error("Failed to fetch artworks:", error);
    throw error;
  }
}
