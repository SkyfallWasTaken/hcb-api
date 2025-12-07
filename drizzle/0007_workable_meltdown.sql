ALTER TABLE `apps` ADD `allow_fundraising` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `apps` ADD `allow_bookkeeping` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `apps` ADD `allow_org_admin` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `apps` ADD `allow_view_financials` integer DEFAULT false NOT NULL;--> statement-breakpoint

-- Set existing rows to true (they had implicit access before these granular permissions existed)
UPDATE `apps` SET 
    `allow_fundraising` = true,
    `allow_bookkeeping` = true,
    `allow_org_admin` = true,
    `allow_view_financials` = true
WHERE 1=1;