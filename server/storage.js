const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { rootDir } = require('./util');
const { query } = require('./db');

/** Seven storage buckets for project assets */
const BUCKETS = {
  ITEM_IMAGES: 'item-images',
  USER_AVATARS: 'user-avatars',
  CHAT_ATTACHMENTS: 'chat-attachments',
  CLAIM_PROOFS: 'claim-proofs',
  REPORT_EVIDENCE: 'report-evidence',
  CATEGORY_ASSETS: 'category-assets',
  MISC_UPLOADS: 'misc-uploads'
};

const bucketsRoot = path.join(rootDir, 'storage', 'buckets');

function ensureBuckets() {
  Object.values(BUCKETS).forEach((name) => {
    fs.mkdirSync(path.join(bucketsRoot, name), { recursive: true });
  });
}

function publicUrl(bucket, objectKey) {
  return `/storage/buckets/${bucket}/${objectKey}`;
}

function diskPath(bucket, objectKey) {
  return path.join(bucketsRoot, bucket, objectKey);
}

async function saveFile({ bucket, buffer, originalName, mimeType, uploadedBy, entityType, entityId }) {
  ensureBuckets();
  const ext = path.extname(originalName || '').toLowerCase() || '.bin';
  const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.pdf'].includes(ext) ? ext : '.jpg';
  const objectKey = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`;
  const fullPath = diskPath(bucket, objectKey);
  fs.writeFileSync(fullPath, buffer);

  const url = publicUrl(bucket, objectKey);
  const result = await query(
    `INSERT INTO storage_objects (bucket, object_key, public_url, mime_type, size_bytes, uploaded_by, entity_type, entity_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [bucket, objectKey, url, mimeType || 'application/octet-stream', buffer.length, uploadedBy || null, entityType || null, entityId || null]
  );

  return {
    id: result.insertId,
    bucket,
    objectKey,
    url,
    path: url
  };
}

async function saveUpload(file, meta) {
  const buffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
  if (!buffer) return null;
  return saveFile({
    bucket: meta.bucket || BUCKETS.MISC_UPLOADS,
    buffer,
    originalName: file.filename || file.originalname || 'upload.jpg',
    mimeType: file.mimeType || file.mimetype,
    uploadedBy: meta.uploadedBy,
    entityType: meta.entityType,
    entityId: meta.entityId
  });
}

module.exports = { BUCKETS, ensureBuckets, publicUrl, diskPath, saveFile, saveUpload, bucketsRoot };
