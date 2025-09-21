CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"app_id" text NOT NULL,
	"method" text NOT NULL,
	"path" text NOT NULL,
	"user_ip" text NOT NULL,
	"request_headers" text NOT NULL,
	"request_body" text,
	"response_status" integer NOT NULL,
	"response_headers" text NOT NULL,
	"response_body" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;