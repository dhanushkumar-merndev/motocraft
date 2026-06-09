import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { db } from '@/db';
import { leads, leadEvents } from '@/db/schema';
import { eq } from 'drizzle-orm';

const s3 = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;

export async function generatePresignedUrl(leadId: string) {
  const fileKey = `resumes/${leadId}/resume.pdf`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileKey,
    ContentType: 'application/pdf',
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return { uploadUrl, fileKey };
}

export async function confirmResumeUpload(leadId: string, fileKey: string) {
  const now = new Date();

  await db
    .update(leads)
    .set({
      resumeFileKey: fileKey,
      resumeUploadedAt: now,
    })
    .where(eq(leads.id, leadId));

  await db.insert(leadEvents).values({
    leadId,
    action: 'resume_uploaded',
    newValue: fileKey,
    createdAt: now,
  });

  const getCommand = new GetObjectCommand({
    Bucket: BUCKET,
    Key: fileKey,
  });

  const resumeUrl = await getSignedUrl(s3, getCommand, { expiresIn: 604800 });

  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);

  return { lead, resumeUrl };
}
