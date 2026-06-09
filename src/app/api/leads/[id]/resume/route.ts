import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, error, validateApiKey, checkRateLimit } from '@/utils/api';
import { confirmResumeUpload } from '@/services/resume.service';
import { sendResumeUploadNotification } from '@/services/notification.service';

const bodySchema = z.object({
  fileKey: z.string().min(1),
  isNew: z.boolean().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkRateLimit(request))) {
    return error('RATE_LIMITED', 'Too many requests', 429);
  }
  if (!validateApiKey(request)) {
    return error('UNAUTHORIZED', 'Invalid API key', 401);
  }

  const { id } = await params;

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return error('VALIDATION_ERROR', parsed.error.message, 400);
  }

  try {
    const { lead, resumeUrl } = await confirmResumeUpload(id, parsed.data.fileKey);
    if (!parsed.data.isNew) {
      console.log("[FCM] Triggering Resume notification...");
      await sendResumeUploadNotification(lead.id, lead.fullName ?? '', lead.positionApplyingFor ?? '').catch((e) => console.error("FCM resume error:", e));
    }
    return success({ lead, resumeUrl });
  } catch {
    return error('DB_ERROR', 'Failed to confirm resume upload', 500);
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
