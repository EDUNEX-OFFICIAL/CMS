ALTER TABLE "workspace_settings" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "workspace_isolation" ON "workspace_settings" AS PERMISSIVE FOR ALL TO public USING (workspace_id = current_setting('app.workspace_id', true)::uuid);
