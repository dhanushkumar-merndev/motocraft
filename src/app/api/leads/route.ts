import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { leads } from '@/db/schema';
import { inferDepartment } from '@/utils/normalize';
import { success, error, validateApiKey, checkRateLimit } from '@/utils/api';
import { sendNewLeadNotification } from '@/services/notification.service';
import { eq } from 'drizzle-orm';

const bodySchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z.string().regex(/^\d{10}$/),
  positionApplyingFor: z.enum([
    'sales_manager',
    'sales_executive',
    'test_rider',
    'receptionist',
    'service_manager',
    'service_advisor',
    'technician',
    'parts_manager',
    'parts_supervisor',
  ]),
  location: z.enum(['Yes', 'No']),
  campaignName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  if (!(await checkRateLimit(request))) {
    return error('RATE_LIMITED', 'Too many requests', 429);
  }
  if (!validateApiKey(request)) {
    return error('UNAUTHORIZED', 'Invalid API key', 401);
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return error('VALIDATION_ERROR', parsed.error.message, 400);
  }

  const { fullName, email, phoneNumber, positionApplyingFor, location, campaignName } =
    parsed.data;

  const department = inferDepartment(positionApplyingFor);

  // Check if lead already exists based on phone number
  const existingLeads = await db
    .select({ id: leads.id })
    .from(leads)
    .where(eq(leads.phoneNumber, phoneNumber))
    .limit(1);

  if (existingLeads.length > 0) {
    // Lead exists — update info from website (resume handled separately)
    await db
      .update(leads)
      .set({
        fullName,
        email,
        positionApplyingFor,
        department,
        location: location === 'Yes' ? 'Bengaluru' : 'no',
        campaignName: campaignName || 'collected via website',
        updatedAt: new Date(),
      })
      .where(eq(leads.id, existingLeads[0].id));

    return success({ id: existingLeads[0].id }, 200);
  }

  const [lead] = await db
    .insert(leads)
    .values({
      fullName,
      email,
      phoneNumber,
      positionApplyingFor,
      department,
      location: location === 'Yes' ? 'Bengaluru' : 'no',
      campaignName: campaignName || 'collected via website',
      source: 'website',
      status: 'new',
      sheetRowNumber: null,
      createdTime: new Date(),
    })
    .returning({ id: leads.id });

  console.log("[FCM] Triggering NewLead notification...");
  await sendNewLeadNotification(lead.id, fullName, positionApplyingFor).catch((e) => console.error("FCM error:", e));

  return success({ id: lead.id }, 201);
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
