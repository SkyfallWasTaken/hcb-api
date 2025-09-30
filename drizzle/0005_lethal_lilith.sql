ALTER TABLE `audit_logs` ADD `idempotency_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `audit_logs_idempotency_key_unique` ON `audit_logs` (`idempotency_key`);