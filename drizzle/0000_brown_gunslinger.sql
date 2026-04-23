CREATE TABLE "assignments" (
	"id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"subject_id" integer NOT NULL,
	"subject_type" text NOT NULL,
	"srs_stage" integer DEFAULT 0 NOT NULL,
	"unlocked_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"passed_at" timestamp with time zone,
	"burned_at" timestamp with time zone,
	"available_at" timestamp with time zone,
	"resurrected_at" timestamp with time zone,
	"hidden" boolean DEFAULT false NOT NULL,
	"data_updated_at" timestamp with time zone,
	"synced_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "assignments_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "global_sync_log" (
	"endpoint" text PRIMARY KEY NOT NULL,
	"last_synced_at" timestamp with time zone,
	"total_synced" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "level_progressions" (
	"id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"level" integer NOT NULL,
	"unlocked_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"passed_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"abandoned_at" timestamp with time zone,
	"created_at" timestamp with time zone,
	"synced_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "level_progressions_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "platform_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wanikani_username" text NOT NULL,
	"wanikani_level" integer NOT NULL,
	"wanikani_api_token" text NOT NULL,
	"subscription_active" boolean DEFAULT false NOT NULL,
	"subscription_type" text DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"last_synced_at" timestamp with time zone,
	CONSTRAINT "platform_users_wanikani_username_unique" UNIQUE("wanikani_username")
);
--> statement-breakpoint
CREATE TABLE "resets" (
	"id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"original_level" integer NOT NULL,
	"target_level" integer NOT NULL,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone,
	"synced_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "resets_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "review_statistics" (
	"id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"subject_id" integer NOT NULL,
	"subject_type" text NOT NULL,
	"meaning_correct" integer DEFAULT 0 NOT NULL,
	"meaning_incorrect" integer DEFAULT 0 NOT NULL,
	"reading_correct" integer DEFAULT 0 NOT NULL,
	"reading_incorrect" integer DEFAULT 0 NOT NULL,
	"meaning_current_streak" integer DEFAULT 0 NOT NULL,
	"reading_current_streak" integer DEFAULT 0 NOT NULL,
	"meaning_max_streak" integer DEFAULT 0 NOT NULL,
	"reading_max_streak" integer DEFAULT 0 NOT NULL,
	"percentage_correct" integer DEFAULT 0 NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"data_updated_at" timestamp with time zone,
	"synced_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "review_statistics_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "study_materials" (
	"id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"subject_id" integer NOT NULL,
	"subject_type" text NOT NULL,
	"meaning_note" text,
	"reading_note" text,
	"meaning_synonyms" jsonb,
	"hidden" boolean DEFAULT false NOT NULL,
	"data_updated_at" timestamp with time zone,
	"synced_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "study_materials_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" integer PRIMARY KEY NOT NULL,
	"object" text NOT NULL,
	"slug" text,
	"characters" text,
	"level" integer NOT NULL,
	"document_url" text,
	"data" jsonb NOT NULL,
	"data_updated_at" timestamp with time zone,
	"synced_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"stripe_subscription_id" text,
	"stripe_customer_id" text,
	"status" text DEFAULT 'inactive' NOT NULL,
	"plan_id" text,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "sync_log" (
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"last_synced_at" timestamp with time zone,
	"total_synced" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "sync_log_user_id_endpoint_pk" PRIMARY KEY("user_id","endpoint")
);
--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_user_id_platform_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."platform_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_progressions" ADD CONSTRAINT "level_progressions_user_id_platform_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."platform_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resets" ADD CONSTRAINT "resets_user_id_platform_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."platform_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_statistics" ADD CONSTRAINT "review_statistics_user_id_platform_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."platform_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_materials" ADD CONSTRAINT "study_materials_user_id_platform_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."platform_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_platform_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."platform_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_log" ADD CONSTRAINT "sync_log_user_id_platform_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."platform_users"("id") ON DELETE cascade ON UPDATE no action;