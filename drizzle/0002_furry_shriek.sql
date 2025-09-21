ALTER TABLE "apps" ADD COLUMN "allow_money_movement" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "max_daily_limit" integer;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "max_transaction_limit" integer;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "require_approval" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "approval_threshold" integer;