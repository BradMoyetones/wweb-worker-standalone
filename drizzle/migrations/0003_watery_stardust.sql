ALTER TABLE `cron_configs` ADD `start_at` integer;--> statement-breakpoint
ALTER TABLE `cron_configs` ADD `end_at` integer;--> statement-breakpoint
ALTER TABLE `cron_configs` ADD `last_run_at` integer;--> statement-breakpoint
ALTER TABLE `cron_configs` ADD `next_run_at` integer;