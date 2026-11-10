ALTER TABLE `contacts` ADD `request_hash` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `receipt_hash` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `handoff_attempted_at` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `updated_at` text;--> statement-breakpoint
ALTER TABLE `contacts` ADD `version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX `contacts_date` ON `contacts` (`created_at`,`id`);--> statement-breakpoint
CREATE INDEX `contacts_status` ON `contacts` (`status`,`created_at`);