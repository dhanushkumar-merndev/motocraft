import { NextRequest } from 'next/server';
import { success, error, validateApiKey, checkRateLimit } from '@/utils/api';
import { generatePresignedUrl } from '@/services/resume.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkRateLimit(_request))) {
    return error('RATE_LIMITED', 'Too many requests', 429);
  }
  if (!validateApiKey(_request)) {
    return error('UNAUTHORIZED', 'Invalid API key', 401);
  }

  const { id } = await params;

  try {
    const { uploadUrl, fileKey } = await generatePresignedUrl(id);
    return success({ uploadUrl, fileKey });
  } catch {
    return error('S3_ERROR', 'Failed to generate upload URL', 500);
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
