CREATE TABLE `cron_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`group_name` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`cron_expression` text NOT NULL,
	`timezone` text DEFAULT 'America/New_York',
	`is_active` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cron_workflow_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`cron_config_id` text NOT NULL,
	`step_order` integer NOT NULL,
	`name` text NOT NULL,
	`method` text DEFAULT 'POST' NOT NULL,
	`url` text NOT NULL,
	`headers` text,
	`body` text,
	`response_format` text DEFAULT 'text',
	`data_path` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`cron_config_id`) REFERENCES `cron_configs`(`id`) ON UPDATE cascade ON DELETE cascade
);
