import {
  pgTable,
  uuid,
  text,
  boolean,
  index,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firebaseUid: text('firebase_uid').unique().notNull(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('admin').notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const fcmTokens = pgTable(
  'fcm_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    token: text('token').unique().notNull(),
    deviceName: text('device_name'),
    userName: text('user_name'),
    active: boolean('active').default(true),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('fcm_tokens_user_id_idx').on(table.userId),
    index('fcm_tokens_active_idx').on(table.active),
  ],
);

export const leads = pgTable(
  'leads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    source: text('source').notNull().default('sheet'),
    sheetRowNumber: integer('sheet_row_number'),
    fullName: text('full_name').notNull(),
    phoneNumber: text('phone_number'),
    email: text('email'),
    positionApplyingFor: text('position_applying_for'),
    department: text('department'),
    location: text('location'),
    campaignName: text('campaign_name'),
    status: text('status').notNull().default('new'),
    resumeFileKey: text('resume_file_key'),
    resumeUploadedAt: timestamp('resume_uploaded_at', { withTimezone: true }),
    createdTime: timestamp('created_time', { withTimezone: true }),
    remark: text('remark'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('leads_created_at_idx').on(table.createdAt),
    index('leads_created_time_idx').on(table.createdTime),
    index('leads_created_time_status_idx').on(table.createdTime, table.status),
    index('leads_status_created_time_idx').on(table.status, table.createdTime),
    index('leads_department_created_time_idx').on(table.department, table.createdTime),
    index('leads_position_created_time_idx').on(table.positionApplyingFor, table.createdTime),
    index('leads_sheet_row_number_idx').on(table.sheetRowNumber),
    index('leads_phone_email_campaign_idx').on(
      table.phoneNumber,
      table.email,
      table.campaignName,
    ),
  ],
);

export const leadEvents = pgTable(
  'lead_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    leadId: uuid('lead_id')
      .references(() => leads.id)
      .notNull(),
    userId: uuid('user_id').references(() => users.id),
    userName: text('user_name'),
    action: text('action').notNull(),
    oldValue: text('old_value'),
    newValue: text('new_value'),
    remark: text('remark'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('lead_events_lead_created_at_idx').on(table.leadId, table.createdAt),
    index('lead_events_user_id_idx').on(table.userId),
  ],
);

export const followups = pgTable(
  'followups',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    leadId: uuid('lead_id')
      .references(() => leads.id)
      .notNull(),
    reminderAt: timestamp('reminder_at', { withTimezone: true }).notNull(),
    notifiedAt: timestamp('notified_at', { withTimezone: true }),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('followups_notified_reminder_idx').on(table.notifiedAt, table.reminderAt),
    index('followups_lead_notified_idx').on(table.leadId, table.notifiedAt),
    index('followups_created_by_idx').on(table.createdBy),
  ],
);
