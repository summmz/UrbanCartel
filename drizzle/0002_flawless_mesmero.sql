ALTER TABLE `reviews` ADD `status` enum('pending','approved','rejected') DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE `reviews` ADD `helpfulVotes` int DEFAULT 0 NOT NULL;