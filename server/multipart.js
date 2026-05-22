let Busboy;

try {
  Busboy = require('busboy');
} catch {
  try {
    Busboy = require('../backend-node/node_modules/busboy');
  } catch {
    Busboy = null;
  }
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    if (!Busboy) {
      reject(new Error('Multipart uploads need the busboy package. Run npm install after switching to Node 20 LTS.'));
      return;
    }

    const fields = {};
    const files = [];
    const busboy = Busboy({ headers: req.headers });

    busboy.on('field', (name, value) => {
      fields[name] = value;
    });

    busboy.on('file', (name, file, info) => {
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        files.push({
          field: name,
          filename: info.filename || 'upload.jpg',
          mimeType: info.mimeType || 'image/jpeg',
          buffer: Buffer.concat(chunks)
        });
      });
    });

    busboy.on('error', reject);
    busboy.on('finish', () => resolve({ fields, files }));
    req.pipe(busboy);
  });
}

module.exports = { parseMultipart };
