import { createPreview } from 'bare-media/worker/media'

export default async function createPreviewImage (filePath) {
  const result = await createPreview({ path: filePath, maxHeight: 256, maxWidth: 256 })
  const base64 = result.preview.buffer.toString('base64')
  const mimeType = result.preview.metadata.mimetype
  return `data:${mimeType};base64,${base64}`
}
