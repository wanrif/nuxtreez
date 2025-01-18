CREATE TABLE `roles` (
	`id` varchar(32) NOT NULL,
	`name` varchar(50) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `tokens` (
	`id` varchar(32) NOT NULL,
	`token` varchar(512) NOT NULL,
	`user_id` varchar(32) NOT NULL,
	`device_info` json NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`last_used` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(32) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(15),
	`location` varchar(255),
	`website` varchar(255),
	`bio` varchar(255),
	`password` varchar(255) NOT NULL,
	`role_id` varchar(32) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_phone_unique` UNIQUE(`phone`)
);
--> statement-breakpoint
CREATE INDEX `name_idx` ON `roles` (`name`);--> statement-breakpoint
CREATE INDEX `token_idx` ON `tokens` (`token`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `phone_idx` ON `users` (`phone`);--> statement-breakpoint
CREATE INDEX `role_id_idx` ON `users` (`role_id`);