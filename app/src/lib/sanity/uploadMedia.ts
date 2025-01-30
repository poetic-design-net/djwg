import { uploadClient } from './uploadClient'
import type { SanityClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// Initialisiere den Image URL Builder
const builder = imageUrlBuilder(uploadClient)

interface UploadResult {
  sanityId: string;
  sanityAssetId: string;
  url: string;
}

export async function uploadToSanity(
  file: File,
  userId: string,
  supabaseId: string,
  userName: string,
  userEmail?: string
): Promise<UploadResult> {
  try {
    // 1. Lade die Datei als Asset hoch
    const asset = await uploadClient.assets.upload('file', file);

    // 2. Erstelle das mediaUpload Dokument mit erweiterten Informationen
    const doc = await uploadClient.create({
      _type: 'mediaUpload',
      // User Informationen
      userId: userId,
      userName: userName,
      userEmail: userEmail,
      supabaseId: supabaseId,

      // File Informationen
      originalFilename: file.name,
      fileType: file.type,
      fileSize: file.size,
      status: 'pending',

      // Upload Details
      uploadedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),

      // Erweiterte Metadaten
      metadata: {
        mimeType: file.type,
        lastModified: new Date(file.lastModified).toISOString(),
        fileExtension: file.name.split('.').pop()?.toLowerCase(),
        uploadSource: 'user_dashboard',
        originalSize: file.size,
        dimensions: file.type.startsWith('image/') ? {
          width: null,  // Wird später gefüllt wenn es ein Bild ist
          height: null
        } : undefined
      },

      // Datei-Referenz
      file: {
        _type: 'file',
        asset: {
          _type: 'reference',
          _ref: asset._id
        }
      },

      // Administratives
      adminNotes: '',
      reviewStatus: 'pending',
      reviewedBy: null,
      reviewedAt: null,

      // Sicherheits-Flags
      isPublic: false,
      hasRestrictions: false,
      allowedUsers: [],

      // Versionierung
      version: 1,
      previousVersions: []
    });

    // 3. Bereite das Ergebnis vor
    const result: UploadResult = {
      sanityId: doc._id,
      sanityAssetId: asset._id,
      url: asset.url
    };

    console.log('Upload erfolgreich:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      sanityId: result.sanityId,
      url: result.url
    });

    return result;

  } catch (error) {
    console.error('Fehler beim Upload zu Sanity:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    throw new Error(`Sanity Upload Fehler: ${errorMessage}`);
  }
}