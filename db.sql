-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.41 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for app
CREATE DATABASE IF NOT EXISTS `app` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `app`;

-- Dumping structure for table app.cache
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table app.cache: ~0 rows (approximately)

-- Dumping structure for table app.cache_locks
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table app.cache_locks: ~0 rows (approximately)

-- Dumping structure for table app.failed_jobs
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table app.failed_jobs: ~0 rows (approximately)

-- Dumping structure for table app.jobs
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table app.jobs: ~0 rows (approximately)

-- Dumping structure for table app.job_batches
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table app.job_batches: ~0 rows (approximately)

-- Dumping structure for table app.migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table app.migrations: ~2 rows (approximately)
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '0001_01_01_000000_create_users_table', 1),
	(2, '0001_01_01_000001_create_cache_table', 1),
	(3, '0001_01_01_000002_create_jobs_table', 1);

-- Dumping structure for table app.password_reset_tokens
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table app.password_reset_tokens: ~0 rows (approximately)

-- Dumping structure for table app.sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table app.sessions: ~1 rows (approximately)
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
	('TzztgC6FGp3tyN38VqtRRaDTdKV40lBjdDBRoaLr', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiS2lYVEgwQ1p1TFVmclJkWE9xOXh2dFpMb0tRN2dCVkZvaUtaQ2JSTCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTtzOjk6Il9wcmV2aW91cyI7YToxOntzOjM6InVybCI7czoyODoiaHR0cDovL3JtZS50ZXN0L21hc3Rlci91c2VycyI7fX0=', 1746626681);

-- Dumping structure for table app.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nip` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`nip`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table app.users: ~15 rows (approximately)
INSERT INTO `users` (`id`, `nama`, `nip`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
	(1, 'Dimas Wisnu Wirawan', '2023.01.12.189', NULL, '$2y$12$QvUc0FGZJWkmxK08ArK.KOwn6IweIrQd8qvAxLAapMWyUDZTJCYgy', NULL, '2025-05-07 01:58:41', '2025-05-07 06:40:06'),
	(2, 'DDDDDD', '111111', NULL, '$2y$12$Sc0n6iEayECpd5FUnFVgeOE7S3m1pD7xKmsWtD4DEr.5cvrZ7QNG.', NULL, '2025-05-07 04:45:57', '2025-05-07 04:45:57'),
	(3, 'Nostrud natus cillum', 'Et ut in similique o', NULL, '$2y$12$3ekjGJydDQQM53F9u8J4Oei6T07oYtvRWe0xopvnTsXm6bak5Vvh6', NULL, '2025-05-07 04:46:05', '2025-05-07 04:46:05'),
	(4, 'Culpa non aut dolor', 'Ipsum numquam iure', NULL, '$2y$12$0BcO2wpqfhRu0Nq8ryGC5ecmJnzCuPaBFrx/v03VNE9CU6/0pMPaG', NULL, '2025-05-07 04:46:09', '2025-05-07 04:46:09'),
	(7, 'Id qui et aut pariat', 'Voluptas ipsum facer', NULL, '$2y$12$18jIwUXPVn2azxtlS80usO5xEOZBUwj.45KSnlhCyATk.C3B/fJOu', NULL, '2025-05-07 05:14:50', '2025-05-07 05:14:50'),
	(8, 'Ipsam voluptas deser', 'Voluptates qui non a', NULL, '$2y$12$8Qp8HPazGVMPTHjoeZbLbeMv/IXDd9a/Nt8RdJRe/cFvSPgKMrEM.', NULL, '2025-05-07 05:14:53', '2025-05-07 05:14:53'),
	(9, 'Fugit dolor quam ut', 'Sed tempore nisi au', NULL, '$2y$12$IgmrZoPxrN25gzdIG7hHcOVpWKR/Wos2.zFDzlfU5i4BxsOeTm81W', NULL, '2025-05-07 05:14:55', '2025-05-07 05:14:55'),
	(10, 'Eiusmod officia iure', 'Et beatae iure asper', NULL, '$2y$12$W3YWZEgmovekcwhmAEtxTeby7aSkpDfGe.CR66w7BPMJYq4U9AMBa', NULL, '2025-05-07 05:14:58', '2025-05-07 05:14:58'),
	(11, 'Vel aperiam sit in', 'Libero ut officia qu', NULL, '$2y$12$Fd2HFK7bFDrjFKxFja5SVubPtS2xXTFmuiXEWW0pMgw5x4GR40knC', NULL, '2025-05-07 05:34:56', '2025-05-07 05:34:56'),
	(12, 'Ab similique laborum', 'Cupidatat tempore q', NULL, '$2y$12$Jq6KJLpFzLGbEAgvvsuxnO1h64E11gUBlQ/iDnce/jVF/pfSa9z9a', NULL, '2025-05-07 05:37:29', '2025-05-07 05:37:29'),
	(13, 'Ex aut Nam assumenda', 'Voluptatem Et asper', NULL, '$2y$12$qIcSE2ORxWKQ/eXDTIrlTeqAcX5Sj.wpsGl3vsPeUDBb1s1JixiSa', NULL, '2025-05-07 05:44:29', '2025-05-07 05:44:29'),
	(16, 'Rerum odit ex fugiat', 'Dolor nihil cum dolo', NULL, '$2y$12$gSyl6T6Oaqpe6K2Ib1EMnuWRLXnDTUWhca5EMW2GCECTPya/vO1Gm', NULL, '2025-05-07 06:09:13', '2025-05-07 06:09:13'),
	(17, 'Nobis ea recusandae', 'Anim temporibus faceaa', NULL, '$2y$12$CGz/vQBcmBj.B0AXD/vYE.DBcjxJSX1mVYBltTyuctuQpdAnMRQBO', NULL, '2025-05-07 06:51:06', '2025-05-07 06:58:45'),
	(20, 'Voluptas tempora id', 'Ea ex ea adipisicing', NULL, '$2y$12$YsrmVe0vp.R3tSub9SYj/.P5pOTlbG2dJqOtqxoQHhWHzr4a16lby', NULL, '2025-05-07 06:58:50', '2025-05-07 06:58:50'),
	(21, 'Laboriosam ex magna', 'Nam dolor et nisi ve', NULL, '$2y$12$M3lDASg/w4izvIrsFTNyf.0uLfyiHOH4LmYvadPjxelMeRC3QHF8i', NULL, '2025-05-07 06:58:54', '2025-05-07 06:58:54');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
