import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { db } from '@/db';
import { fcmTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';

function getFirebaseApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function sendNewLeadNotification(
  leadId: string,
  fullName: string,
  position: string,
) {
  const tokens = await db
    .select({ token: fcmTokens.token, id: fcmTokens.id })
    .from(fcmTokens)
    .where(eq(fcmTokens.active, true));

  if (tokens.length === 0) {
    console.log("[FCM] NewLead: no active tokens — skipped");
    return;
  }

  const app = getFirebaseApp();
  const messaging = getMessaging(app);

  const positionLabel = position.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const messages = tokens.map(({ token }) => ({
    token,
    data: {
      type: 'NEW_LEAD' as const,
      lead_id: leadId,
      fullName,
      positionApplyingFor: position,
    },
  }));

  console.log(`[FCM] NewLead: sending to ${tokens.length} tokens...`);
  const results = await messaging.sendEach(messages);
  console.log(`[FCM] NewLead: ${results.successCount} success, ${results.failureCount} failed`);

  for (let i = 0; i < results.responses.length; i++) {
    const error = results.responses[i].error;
    if (error) {
      console.log(`[FCM] NewLead token ${i} error:`, error.code);
      if (
        error.code?.includes('registration-token-not-registered') ||
        error.code?.includes('invalid-registration-token')
      ) {
        await db
          .update(fcmTokens)
          .set({ active: false })
          .where(eq(fcmTokens.id, tokens[i].id));
      }
    }
  }
}

export async function sendResumeUploadNotification(
  leadId: string,
  fullName: string,
  position: string,
) {
  const tokens = await db
    .select({ token: fcmTokens.token, id: fcmTokens.id })
    .from(fcmTokens)
    .where(eq(fcmTokens.active, true));

  if (tokens.length === 0) {
    console.log("[FCM] Resume: no active tokens — skipped");
    return;
  }

  const app = getFirebaseApp();
  const messaging = getMessaging(app);

  const positionLabel = position.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const messages = tokens.map(({ token }) => ({
    token,
    data: {
      type: 'RESUME_UPLOAD' as const,
      lead_id: leadId,
      fullName,
      positionApplyingFor: position,
    },
  }));

  console.log(`[FCM] Resume: sending to ${tokens.length} tokens...`);
  const results = await messaging.sendEach(messages);
  console.log(`[FCM] Resume: ${results.successCount} success, ${results.failureCount} failed`);

  for (let i = 0; i < results.responses.length; i++) {
    const error = results.responses[i].error;
    if (error) {
      console.log(`[FCM] Resume token ${i} error:`, error.code);
      if (
        error.code?.includes('registration-token-not-registered') ||
        error.code?.includes('invalid-registration-token')
      ) {
        await db
          .update(fcmTokens)
          .set({ active: false })
          .where(eq(fcmTokens.id, tokens[i].id));
      }
    }
  }
}
