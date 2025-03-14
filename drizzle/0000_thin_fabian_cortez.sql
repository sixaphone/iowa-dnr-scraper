CREATE TABLE `enforcement_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`defendant` text NOT NULL,
	`plaintiff` text NOT NULL,
	`year` integer NOT NULL,
	`settlement` text NOT NULL,
	`violationType` text NOT NULL,
	`dataSourceLink` text NOT NULL
);
