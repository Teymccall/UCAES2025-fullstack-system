import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Prefer environment variables; fallback to documented credentials for local dev
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dyvabxsvh'
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '976451452252245'
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'K_ul_YNOfbBvkOprTguVfgpA-Qk'
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const file = form.get('file') as File | null
    const folder = (form.get('folder') as string) || 'student-profiles'
    const tags = (form.get('tags') as string) || 'student_profile,ucaes_registration'

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 })
    }

    const timestamp = Math.floor(Date.now() / 1000)

    // Build string to sign (alphabetical order of params used for signature)
    const paramsToSign: Record<string, string | number> = {
      folder,
      tags,
      timestamp,
    }

    const stringToSign = Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join('&')

    const signature = crypto
      .createHash('sha1')
      .update(stringToSign + CLOUDINARY_API_SECRET)
      .digest('hex')

    const cloudForm = new FormData()
    cloudForm.append('file', file)
    cloudForm.append('api_key', CLOUDINARY_API_KEY)
    cloudForm.append('timestamp', String(timestamp))
    cloudForm.append('signature', signature)
    cloudForm.append('folder', folder)
    cloudForm.append('tags', tags)

    const cloudRes = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: cloudForm,
    })

    const text = await cloudRes.text()
    if (!cloudRes.ok) {
      return NextResponse.json({ error: text }, { status: cloudRes.status })
    }

    const result = JSON.parse(text)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}





























