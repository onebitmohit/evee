CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`external_id` text NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`author` text,
	`published_at` integer,
	`metadata` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `conversations_source_external_unique` ON `conversations` (`source`,`external_id`);--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`opportunity_id` text NOT NULL,
	`value` text NOT NULL,
	`note` text,
	`edited_draft` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `feedback_user_id_idx` ON `feedback` (`user_id`);--> statement-breakpoint
CREATE TABLE `monitor_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`status` text NOT NULL,
	`sources_checked` integer DEFAULT 0 NOT NULL,
	`candidates_found` integer DEFAULT 0 NOT NULL,
	`opportunities_created` integer DEFAULT 0 NOT NULL,
	`error` text,
	`started_at` integer NOT NULL,
	`finished_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `opportunities` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`conversation_id` text NOT NULL,
	`relevant` integer NOT NULL,
	`score` integer NOT NULL,
	`intent_score` integer NOT NULL,
	`fit_score` integer NOT NULL,
	`urgency_score` integer NOT NULL,
	`specificity_score` integer NOT NULL,
	`reply_safety_score` integer NOT NULL,
	`confidence_basis_points` integer NOT NULL,
	`reason` text NOT NULL,
	`signals` text NOT NULL,
	`risks` text NOT NULL,
	`reply_draft` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`alerted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `opportunities_user_conversation_unique` ON `opportunities` (`user_id`,`conversation_id`);--> statement-breakpoint
CREATE INDEX `opportunities_user_score_idx` ON `opportunities` (`user_id`,`score`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`product_name` text NOT NULL,
	`product_url` text,
	`product_summary` text NOT NULL,
	`target_customers` text NOT NULL,
	`pain_points` text NOT NULL,
	`competitors` text NOT NULL,
	`reply_style` text NOT NULL,
	`keywords` text NOT NULL,
	`exclusions` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_user_id_unique` ON `profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`config` text DEFAULT '{}' NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`last_checked_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sources_user_id_idx` ON `sources` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_digests` (
	`user_id` text NOT NULL,
	`opportunity_id` text NOT NULL,
	`sent_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `opportunity_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
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
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_telegram_user_id_unique` ON `users` (`telegram_user_id`);