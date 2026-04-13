import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

// ============================================
// Types
// ============================================

export interface UploadResult {
  key: string;
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Upload a single file to storage
 * POST /api/v1/storage/upload
 * 
 * @param file - The file to upload
 * @param folder - Optional folder path (default: 'tickets/pending')
 * @returns Upload result with key, url, and metadata
 */
export const uploadFile = async (
  file: File,
  folder: string = 'tickets/pending',
): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<UploadResult>(
    `${API_ENDPOINTS.STORAGE.UPLOAD}?folder=${encodeURIComponent(folder)}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
};

/**
 * Upload multiple files to storage
 * 
 * @param files - Array of files to upload
 * @param folder - Optional folder path (default: 'tickets/pending')
 * @returns Array of upload results
 */
export const uploadMultipleFiles = async (
  files: File[],
  folder: string = 'tickets/pending',
): Promise<UploadResult[]> => {
  const uploadPromises = files.map((file) => uploadFile(file, folder));
  return Promise.all(uploadPromises);
};
