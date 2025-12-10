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
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_cron_configs` (
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
INSERT INTO `__new_cron_configs`("id", "group_name", "name", "description", "cron_expression", "timezone", "is_active", "created_at", "updated_at") SELECT "id", "group_name", "name", "description", "cron_expression", "timezone", "is_active", "created_at", "updated_at" FROM `cron_configs`;--> statement-breakpoint
DROP TABLE `cron_configs`;--> statement-breakpoint
ALTER TABLE `__new_cron_configs` RENAME TO `cron_configs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;