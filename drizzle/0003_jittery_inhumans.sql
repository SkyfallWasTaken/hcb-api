ALTER TABLE "apps" ADD COLUMN "allow_card_access" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "apps" DROP COLUMN "max_daily_limit";--> statement-breakpoint
ALTER TABLE "apps" DROP COLUMN "max_transaction_limit";--> statement-breakpoint
ALTER TABLE "apps" DROP COLUMN "require_approval";--> statement-breakpoint
ALTER TABLE "apps" DROP COLUMN "approval_threshold";