CREATE TABLE `academy_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`entry_id` text NOT NULL,
	`lesson_version` integer NOT NULL,
	`snapshot_json` text NOT NULL,
	`answers_json` text NOT NULL,
	`score` integer NOT NULL,
	`passed` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `cms_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`entry_id`) REFERENCES `academy_entries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `academy_attempt_user` ON `academy_attempts` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `academy_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`draft_json` text NOT NULL,
	`published_json` text,
	`version` integer DEFAULT 1 NOT NULL,
	`published_version` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`published_at` text
);
--> statement-breakpoint
CREATE TABLE `academy_observations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`entry_id` text NOT NULL,
	`instructor_id` text NOT NULL,
	`status` text NOT NULL,
	`note` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `cms_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`entry_id`) REFERENCES `academy_entries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `academy_observation_user` ON `academy_observations` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `academy_progress` (
	`user_id` text NOT NULL,
	`entry_id` text NOT NULL,
	`lesson_version` integer NOT NULL,
	`step` integer DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `cms_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`entry_id`) REFERENCES `academy_entries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `academy_progress_identity` ON `academy_progress` (`user_id`,`entry_id`,`lesson_version`);--> statement-breakpoint
CREATE TABLE `academy_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_id` text NOT NULL,
	`version` integer NOT NULL,
	`snapshot_json` text NOT NULL,
	`action` text NOT NULL,
	`actor_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `academy_entries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `academy_revision_version` ON `academy_revisions` (`entry_id`,`version`);--> statement-breakpoint
ALTER TABLE `cms_users` ADD `can_training_manage` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `cms_users` ADD `can_training_edit` integer DEFAULT 0 NOT NULL;