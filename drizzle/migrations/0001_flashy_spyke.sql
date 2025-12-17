ALTER TABLE `cron_workflow_steps` ADD `body_type` text DEFAULT 'json';--> statement-breakpoint
ALTER TABLE `cron_workflow_steps` ADD `request_options` text;--> statement-breakpoint
ALTER TABLE `cron_workflow_steps` ADD `extract` text;