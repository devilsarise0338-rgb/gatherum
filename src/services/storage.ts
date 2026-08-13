import { supabase } from '../lib/supabase';

export const StorageService = {
  /**
   * Uploads an image to the Supabase storage bucket.
   * Replaces the old file if an old URL is provided.
   */
  uploadImage: async (
    file: File, 
    folder: 'avatars' | 'events', 
    userId: string, 
    oldImageUrl?: string | null
  ): Promise<string> => {
    // 1. Delete old image if it exists
    if (oldImageUrl) {
      await StorageService.deleteImage(oldImageUrl);
    }

    // 2. Generate a unique path for the new file
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${userId}/${fileName}`;

    // 3. Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // 4. Get the public URL
    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Deletes an image from the storage bucket given its public URL.
   */
  deleteImage: async (publicUrl: string): Promise<void> => {
    try {
      // Extract the path from the URL
      // E.g., https://[project].supabase.co/storage/v1/object/public/images/avatars/123/file.jpg
      const urlParts = publicUrl.split('/public/images/');
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        const { error } = await supabase.storage.from('images').remove([filePath]);
        if (error) {
          console.error("Failed to delete old image:", error);
        }
      }
    } catch (e) {
      console.error("Error during image deletion:", e);
    }
  }
};
