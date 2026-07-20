PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`telegram_user_id` text NOT NULL,
	`telegram_chat_id` text NOT NULL,
	`first_name` text,
	`username` text,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`digest_hour` integer DEFAULT 9 NOT NULL,
	`min_score` integer DEFAULT 65 NOT NULL,
	`alerts_enabled` integer DEFAULT true NOT NULL,
	`onboarding_step` text DEFAULT 'product_name' NOT NULL,
	`onboarding_data` text DEFAULT '{}' NOT NULL,
	`last_digest_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`workspace_id` text,
	`auth_user_id` text,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`auth_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);--> statement-breakpoint
INSERT INTO `__new_users` (
	`id`, `telegram_user_id`, `telegram_chat_id`, `first_name`, `username`, `timezone`,
	`digest_hour`, `min_score`, `alerts_enabled`, `onboarding_step`, `onboarding_data`,
	`last_digest_at`, `created_at`, `updated_at`, `workspace_id`, `auth_user_id`
)
SELECT
	`id`, `telegram_user_id`, `telegram_chat_id`, `first_name`, `username`, `timezone`,
	`digest_hour`, `min_score`, `alerts_enabled`, `onboarding_step`, `onboarding_data`,
	`last_digest_at`, `created_at`, `updated_at`, `workspace_id`, `auth_user_id`
FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_telegram_user_id_unique` ON `users` (`telegram_user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_workspace_id_unique` ON `users` (`workspace_id`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
