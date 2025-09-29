PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_auth_config` (
	`id` text PRIMARY KEY NOT NULL,
	`password_hash` text NOT NULL,
	`jwt_secret` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_auth_config`("id", "password_hash", "jwt_secret", "created_at", "updated_at") SELECT "id", "password_hash", "jwt_secret", "created_at", "updated_at" FROM `auth_config`;--> statement-breakpoint
DROP TABLE `auth_config`;--> statement-breakpoint
ALTER TABLE `__new_auth_config` RENAME TO `auth_config`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `app_id_idx` ON `apps` (`id`);--> statement-breakpoint
CREATE INDEX `app_api_key_hash_idx` ON `apps` (`api_key_hash`);