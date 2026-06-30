/**
 * Upload service — sends a file to POST /me/upload (backend stores it in Supabase), returns the public URL.
 */
import { apiClient } from '../client';

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<{ url: string }>('/me/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.url;
}