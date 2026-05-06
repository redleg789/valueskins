import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Verify auth
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    const userId = payload.userId;

    // Parse form data
    const form = formidable({ multiples: false });
    const [fields, files] = await form.parse(req);

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    // Validate file
    const validMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validMimes.includes(file.mimetype || '')) {
      return res.status(400).json({ success: false, error: 'Invalid file type' });
    }

    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'File too large' });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate safe filename
    const filename = `${userId}_${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalFilename || '.jpg')}`;
    const filepath = path.join(uploadsDir, filename);

    // Copy file
    fs.copyFileSync(file.filepath, filepath);

    // Return URL
    const url = `/uploads/avatars/${filename}`;

    return res.status(200).json({ success: true, url });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ success: false, error: 'Upload failed' });
  }
}
