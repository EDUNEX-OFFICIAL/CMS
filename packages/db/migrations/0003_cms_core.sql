CREATE TYPE "public"."entry_status" AS ENUM('draft', 'published', 'archived');
--> statement-breakpoint
CREATE TABLE "content_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"schema" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"content_type_id" uuid NOT NULL,
	"slug" varchar(255) NOT NULL,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"data" jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entry_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"status" "entry_status" NOT NULL,
	"data" jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_types" ADD CONSTRAINT "content_types_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_content_type_id_content_types_id_fk" FOREIGN KEY ("content_type_id") REFERENCES "public"."content_types"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "entry_versions" ADD CONSTRAINT "entry_versions_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "entry_versions" ADD CONSTRAINT "entry_versions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "entry_versions" ADD CONSTRAINT "entry_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "content_types_workspace_slug_unique" ON "content_types" USING btree ("workspace_id","slug");
--> statement-breakpoint
CREATE UNIQUE INDEX "entries_workspace_slug_unique" ON "entries" USING btree ("workspace_id","slug");
--> statement-breakpoint
CREATE INDEX "entries_workspace_id_idx" ON "entries" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "entries_workspace_status_idx" ON "entries" USING btree ("workspace_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX "entry_versions_entry_version_unique" ON "entry_versions" USING btree ("entry_id","version");
--> statement-breakpoint
ALTER TABLE "content_types" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "content_types_isolation" ON "content_types" AS PERMISSIVE FOR ALL TO public USING (workspace_id = current_setting('app.workspace_id', true)::uuid);
--> statement-breakpoint
ALTER TABLE "entries" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "entries_isolation" ON "entries" AS PERMISSIVE FOR ALL TO public USING (workspace_id = current_setting('app.workspace_id', true)::uuid);
--> statement-breakpoint
ALTER TABLE "entry_versions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "entry_versions_isolation" ON "entry_versions" AS PERMISSIVE FOR ALL TO public USING (workspace_id = current_setting('app.workspace_id', true)::uuid);
