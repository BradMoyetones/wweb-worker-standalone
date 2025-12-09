CREATE TABLE `cron_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`group_name` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`cron_expression` text NOT NULL,
	`webhook_url` text NOT NULL,
	`method` text DEFAULT 'POST' NOT NULL,
	`headers` text,
	`body` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
