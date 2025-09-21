CREATE INDEX "audit_logs_app_id_timestamp_idx" ON "audit_logs" USING btree ("app_id","timestamp");--> statement-breakpoint
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "audit_logs_method_idx" ON "audit_logs" USING btree ("method");--> statement-breakpoint
CREATE INDEX "audit_logs_response_status_idx" ON "audit_logs" USING btree ("response_status");--> statement-breakpoint
CREATE INDEX "oauth_tokens_expires_at_idx" ON "oauth_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "oauth_tokens_updated_at_idx" ON "oauth_tokens" USING btree ("updated_at");