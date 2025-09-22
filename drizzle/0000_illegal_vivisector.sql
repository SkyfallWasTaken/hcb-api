CREATE TABLE `apps` (
	`id` text PRIMARY KEY NOT NULL,
	`app_name` text NOT NULL,
	`api_key_hash` text NOT NULL,
	`allow_money_movement` integer DEFAULT false NOT NULL,
	`allow_card_access` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`app_id` text NOT NULL,
	`method` text NOT NULL,
	`path` text NOT NULL,
	`user_ip` text NOT NULL,
	`request_headers` text NOT NULL,
	`request_body` text,
	`response_status` integer NOT NULL,
	`response_headers` text NOT NULL,
	`response_body` text,
	`timestamp` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `audit_logs_app_id_timestamp_idx` ON `audit_logs` (`app_id`,`timestamp`);--> statement-breakpoint
CREATE INDEX `audit_logs_timestamp_idx` ON `audit_logs` (`timestamp`);--> statement-breakpoint
CREATE INDEX `audit_logs_method_idx` ON `audit_logs` (`method`);--> statement-breakpoint
CREATE INDEX `audit_logs_response_status_idx` ON `audit_logs` (`response_status`);--> statement-breakpoint
CREATE TABLE `oauth_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`oauth_client_id` text NOT NULL,
	`access_token` text NOT NULL,
	`refresh_token` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_in` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_tokens_oauth_client_id_unique` ON `oauth_tokens` (`oauth_client_id`);--> statement-breakpoint
CREATE INDEX `oauth_tokens_expires_at_idx` ON `oauth_tokens` (`expires_at`);--> statement-breakpoint
CREATE INDEX `oauth_tokens_updated_at_idx` ON `oauth_tokens` (`updated_at`);