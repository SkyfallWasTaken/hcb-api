DROP INDEX `audit_logs_idempotency_key_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `audit_logs_app_id_idempotency_key_idx` ON `audit_logs` (`app_id`,`idempotency_key`);