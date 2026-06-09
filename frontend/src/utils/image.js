import imageCompression from 'browser-image-compression';

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024;
const DEFAULT_MAX_SIZE_MB = 1.2;
const DEFAULT_MAX_DIMENSION = 1600;

export function validateImageFile(file) {
    if (!file) {
        return { valid: false, error: 'No file selected.' };
    }

    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        return { valid: false, error: 'Only JPG, PNG, and WEBP images are allowed.' };
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        return { valid: false, error: 'Image must be smaller than 2MB.' };
    }

    return { valid: true, error: '' };
}

export async function compressImageFile(file, options = {}) {
    if (!file) return file;
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) return file;

    const config = {
        maxSizeMB: options.maxSizeMB || DEFAULT_MAX_SIZE_MB,
        maxWidthOrHeight: options.maxWidthOrHeight || DEFAULT_MAX_DIMENSION,
        useWebWorker: options.useWebWorker ?? true,
        maxIteration: options.maxIteration ?? 10,
        fileType: file.type,
        exifOrientation: options.exifOrientation ?? undefined,
    };

    try {
        const compressedBlob = await imageCompression(file, config);
        const compressedFile = new File([compressedBlob], file.name, { type: file.type });
        if (compressedFile.size <= file.size) {
            return compressedFile;
        }
    } catch (error) {
        console.warn('[imageUtils] Compression failed, using original file.', error);
    }

    return file;
}

export async function prepareImageForUpload(file) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
        return { file: null, error: validation.error };
    }

    const optimizedFile = await compressImageFile(file);

    if (optimizedFile.size > MAX_UPLOAD_SIZE_BYTES) {
        return { file: null, error: 'Image must be smaller than 2MB after compression.' };
    }

    return { file: optimizedFile, error: '' };
}
