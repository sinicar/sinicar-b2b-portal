/**
 * Images API Module
 * وحدة API للصور
 */

import { post, del } from '../../apiClient';

// ============================================
// Images Functions
// ============================================

/**
 * Upload Image
 */
export async function uploadImage(file: File, type: string = 'general') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  return post('/images/upload', formData);
}

/**
 * Delete Image
 */
export async function deleteImage(imageId: string) {
  return del(`/images/${imageId}`);
}
