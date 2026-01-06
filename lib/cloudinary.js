import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Sube una imagen a Cloudinary
 * @param {string} base64Image - Imagen en formato base64 o URL
 * @param {object} options - Opciones de upload
 * @returns {Promise<object>} - Resultado del upload con URL y public_id
 */
export async function uploadImage(base64Image, options = {}) {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: options.folder || 'doctorcar',
      resource_type: 'image',
      ...options,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Sube múltiples imágenes a Cloudinary
 * @param {string[]} images - Array de imágenes en base64
 * @param {object} options - Opciones de upload
 * @returns {Promise<object[]>} - Array de resultados
 */
export async function uploadMultipleImages(images, options = {}) {
  try {
    const uploadPromises = images.map((image) => uploadImage(image, options));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw new Error('Failed to upload images');
  }
}

/**
 * Elimina una imagen de Cloudinary
 * @param {string} publicId - Public ID de la imagen en Cloudinary
 * @returns {Promise<object>} - Resultado de la eliminación
 */
export async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
}

/**
 * Elimina múltiples imágenes de Cloudinary
 * @param {string[]} publicIds - Array de public IDs
 * @returns {Promise<object[]>} - Array de resultados
 */
export async function deleteMultipleImages(publicIds) {
  try {
    const deletePromises = publicIds.map((publicId) => deleteImage(publicId));
    return await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting multiple images:', error);
    throw new Error('Failed to delete images');
  }
}

export default cloudinary;
