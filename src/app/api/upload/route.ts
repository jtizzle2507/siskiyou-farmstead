import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();

  try {
    const { image, fileName, contentType } = await request.json();

    if (!image || !fileName) {
      return NextResponse.json({ error: 'Image data and fileName are required' }, { status: 400 });
    }

    const buffer = Buffer.from(image, 'base64');
    const ext = fileName.split('.').pop();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(uniqueName, buffer, {
        contentType: contentType || 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(uniqueName);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Upload failed';
    console.error('Upload error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
