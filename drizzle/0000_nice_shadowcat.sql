CREATE TABLE `devices` (
	`id` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`label` text NOT NULL,
	`seen` integer NOT NULL,
	`done` integer DEFAULT -1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`secret` text NOT NULL,
	`stage` text DEFAULT 'waiting' NOT NULL,
	`seq` integer DEFAULT 0 NOT NULL,
	`updated` integer NOT NULL,
	`created` integer NOT NULL,
	`playing` integer DEFAULT 0 NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`round` integer DEFAULT 0 NOT NULL
);
