import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export { cloudinary }

/**
 * Upload a buffer to Cloudinary and return the public URL.
 * Images are stored in the 'blog' folder with automatic format/quality optimization.
 */
export async function uploadImage(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'blog',
        public_id: filename,
        resource_type: 'image',
        overwrite: false,
        // Cloudinary will auto-serve optimized format (webp/avif) via URL
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) reject(error)
        else if (result) resolve(result.secure_url)
        else reject(new Error('No result from Cloudinary'))
      },
    )
    stream.end(buffer)
  })
}