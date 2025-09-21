CREATE TABLE "oauth_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"oauth_client_id" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"created_at" integer NOT NULL,
	"expires_in" integer NOT NULL,
	"expires_at" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_tokens_oauth_client_id_unique" UNIQUE("oauth_client_id")
);
