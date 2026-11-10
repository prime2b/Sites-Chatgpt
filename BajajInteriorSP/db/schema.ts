import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const cmsUsers = sqliteTable('cms_users', {
  id: text('id').primaryKey(), userId: text('user_id').unique(), email: text('email').notNull().unique(),
  name: text('name').notNull(), role: text('role').notNull(), active: integer('active').notNull().default(1),
  canContacts: integer('can_contacts').notNull().default(0), createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull(),
  canTrainingManage: integer('can_training_manage').notNull().default(0),
  canTrainingEdit: integer('can_training_edit').notNull().default(0),
});
export const cmsContent = sqliteTable('cms_content', {
  id: text('id').primaryKey(), kind: text('kind').notNull(), slug: text('slug').notNull(),
  status: text('status').notNull().default('draft'), draftJson: text('draft_json').notNull(), publishedJson: text('published_json'),
  version: integer('version').notNull().default(1), createdBy: text('created_by').notNull(), updatedBy: text('updated_by').notNull(),
  createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull(), publishedAt: text('published_at'),stockCode:text('stock_code'),
}, t => [uniqueIndex('cms_content_url').on(t.kind,t.slug), index('cms_content_status').on(t.status),uniqueIndex('cms_stock_code').on(t.stockCode)]);
export const commercePage = sqliteTable('commerce_page',{
  id:text('id').primaryKey(),draftJson:text('draft_json').notNull(),publishedJson:text('published_json'),
  version:integer('version').notNull().default(1),updatedAt:text('updated_at').notNull(),updatedBy:text('updated_by').notNull(),
});
export const cmsRevisions = sqliteTable('cms_revisions', {
  id: text('id').primaryKey(), contentId: text('content_id').notNull().references(() => cmsContent.id),
  version: integer('version').notNull(), action: text('action').notNull(), snapshotJson: text('snapshot_json').notNull(),
  actorId: text('actor_id').notNull(), createdAt: text('created_at').notNull(),
}, t => [uniqueIndex('cms_revision_version').on(t.contentId,t.version)]);
export const cmsMedia = sqliteTable('cms_media', {
  id: text('id').primaryKey(), objectKey: text('object_key').notNull().unique(), name: text('name').notNull(),
  mime: text('mime').notNull(), size: integer('size').notNull(), sha256: text('sha256').notNull(), alt: text('alt').notNull(),
  createdBy: text('created_by').notNull(), createdAt: text('created_at').notNull(),
});
export const cmsAudit = sqliteTable('cms_audit', {
  id: text('id').primaryKey(), actorId: text('actor_id').notNull(), actorName: text('actor_name').notNull(),
  action: text('action').notNull(), targetId: text('target_id').notNull(), createdAt: text('created_at').notNull(),
},t => [index('cms_audit_date').on(t.createdAt)]);
export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(), name: text('name').notNull(), phone: text('phone').notNull(),
  contextJson: text('context_json').notNull(), status: text('status').notNull().default('new'),
  idempotencyKey: text('idempotency_key').notNull().unique(), createdAt: text('created_at').notNull(),
  requestHash: text('request_hash'), receiptHash: text('receipt_hash'),
  handoffAttemptedAt: text('handoff_attempted_at'), updatedAt: text('updated_at'),
  version: integer('version').notNull().default(1),
}, t => [index('contacts_date').on(t.createdAt,t.id),index('contacts_status').on(t.status,t.createdAt)]);

export const cmsCredentials = sqliteTable('cms_credentials', {
  userId:text('user_id').primaryKey().references(()=>cmsUsers.id), username:text('username').notNull().unique(),
  passwordHash:text('password_hash').notNull(), salt:text('salt').notNull(), iterations:integer('iterations').notNull(),
  updatedAt:text('updated_at').notNull(),
});
export const cmsSessions = sqliteTable('cms_sessions', {
  tokenHash:text('token_hash').primaryKey(), userId:text('user_id').notNull().references(()=>cmsUsers.id),
  createdAt:integer('created_at').notNull(), expiresAt:integer('expires_at').notNull(),
},t=>[index('cms_sessions_user').on(t.userId),index('cms_sessions_expiry').on(t.expiresAt)]);
export const cmsPasswordTokens = sqliteTable('cms_password_tokens', {
  tokenHash:text('token_hash').primaryKey(), userId:text('user_id').notNull().references(()=>cmsUsers.id),
  expiresAt:integer('expires_at').notNull(), usedAt:text('used_at'), createdAt:text('created_at').notNull(),
});
export const cmsAuthLimits = sqliteTable('cms_auth_limits', {
  key:text('key').primaryKey(), hits:integer('hits').notNull(), expiresAt:integer('expires_at').notNull(),
});

export const academyEntries = sqliteTable('academy_entries', {
  id:text('id').primaryKey(), draftJson:text('draft_json').notNull(), publishedJson:text('published_json'),
  version:integer('version').notNull().default(1), publishedVersion:integer('published_version').notNull().default(0),
  updatedAt:text('updated_at').notNull(), updatedBy:text('updated_by').notNull(), publishedAt:text('published_at'),
});
export const academyRevisions = sqliteTable('academy_revisions', {
  id:text('id').primaryKey(), entryId:text('entry_id').notNull().references(()=>academyEntries.id),
  version:integer('version').notNull(), snapshotJson:text('snapshot_json').notNull(),
  action:text('action').notNull(), actorId:text('actor_id').notNull(), createdAt:text('created_at').notNull(),
},t=>[uniqueIndex('academy_revision_version').on(t.entryId,t.version)]);
export const academyProgress = sqliteTable('academy_progress', {
  userId:text('user_id').notNull().references(()=>cmsUsers.id), entryId:text('entry_id').notNull().references(()=>academyEntries.id),
  lessonVersion:integer('lesson_version').notNull(), step:integer('step').notNull().default(0),
  completed:integer('completed').notNull().default(0), updatedAt:text('updated_at').notNull(),
},t=>[uniqueIndex('academy_progress_identity').on(t.userId,t.entryId,t.lessonVersion)]);
export const academyAttempts = sqliteTable('academy_attempts', {
  id:text('id').primaryKey(), userId:text('user_id').notNull().references(()=>cmsUsers.id),
  entryId:text('entry_id').notNull().references(()=>academyEntries.id), lessonVersion:integer('lesson_version').notNull(),
  snapshotJson:text('snapshot_json').notNull(), answersJson:text('answers_json').notNull(),
  score:integer('score').notNull(), passed:integer('passed').notNull(), createdAt:text('created_at').notNull(),
},t=>[index('academy_attempt_user').on(t.userId,t.createdAt)]);
export const academyObservations = sqliteTable('academy_observations', {
  id:text('id').primaryKey(), userId:text('user_id').notNull().references(()=>cmsUsers.id),
  entryId:text('entry_id').notNull().references(()=>academyEntries.id), instructorId:text('instructor_id').notNull(),
  status:text('status').notNull(), note:text('note').notNull(), createdAt:text('created_at').notNull(),
},t=>[index('academy_observation_user').on(t.userId,t.createdAt)]);
