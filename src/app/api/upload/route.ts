import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(new Error(`Cloudinary upload failed: ${error.message || JSON.stringify(error)}`));
        }
        resolve(result);
      });
      uploadStream.end(buffer);
    });

    // @ts-ignore
    return NextResponse.json({ success: true, url: result.secure_url });

  } catch (error) {
    console.error("API upload error:", error);
    return NextResponse.json({ success: false, message: 'Failed to upload image.' }, { status: 500 });
  }
}
