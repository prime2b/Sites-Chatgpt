CREATE TABLE `commerce_page` (
	`id` text PRIMARY KEY NOT NULL,
	`draft_json` text NOT NULL,
	`published_json` text,
	`version` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `cms_content` ADD `stock_code` text;--> statement-breakpoint
CREATE UNIQUE INDEX `cms_stock_code` ON `cms_content` (`stock_code`);