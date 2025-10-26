-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 26, 2025 at 09:32 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dhmobile_website`
--

-- --------------------------------------------------------

--
-- Table structure for table `attributes`
--

CREATE TABLE `attributes` (
  `attribute_id` bigint UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attributes`
--

INSERT INTO `attributes` (`attribute_id`, `name`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'Màu sắc', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(2, 'Bộ nhớ', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17');

-- --------------------------------------------------------

--
-- Table structure for table `attribute_values`
--

CREATE TABLE `attribute_values` (
  `value_id` bigint UNSIGNED NOT NULL,
  `attribute_id` bigint UNSIGNED DEFAULT NULL,
  `value` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attribute_values`
--

INSERT INTO `attribute_values` (`value_id`, `attribute_id`, `value`, `deleted_at`, `updated_at`, `created_at`) VALUES
(1, 1, 'Natural Titanium', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(2, 1, 'Blue Titanium', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(3, 1, 'Black Titanium', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(4, 1, 'White Titanium', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(5, 1, 'Desert Titanium', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(6, 1, 'Space Black', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(7, 1, 'Deep Purple', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(8, 1, 'Gold', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(9, 1, 'Starlight', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(10, 1, 'Sierra Blue', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(11, 1, 'Ultramarine', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(12, 1, 'Teal', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(13, 1, 'Pink', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(14, 1, 'Black', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(15, 1, 'Red', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(16, 1, 'Purple', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(17, 1, 'Titanium Gray', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(18, 1, 'Titanium Black', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(19, 1, 'Phantom Black', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(20, 1, 'Cream', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(21, 1, 'Mint', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(22, 1, 'Lavender', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(23, 1, 'Blue', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(24, 1, 'Alpine Blue', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(25, 1, 'Purple', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(26, 1, 'Iconic Black', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(27, 1, 'Dark Illusion', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(28, 1, 'Sunrise Beige', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(29, 2, '128GB', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(30, 2, '256GB', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(31, 2, '512GB', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17'),
(32, 2, '1TB', NULL, '2025-10-26 09:32:17', '2025-10-26 09:32:17');

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `banner_id` bigint UNSIGNED NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`banner_id`, `title`, `image_url`, `link_url`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Banner_1', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1755872733/banners/zcxsp1shd9fztadayrqs.jpg', NULL, 1, '2025-05-22 03:24:24', '2025-05-22 19:40:14', NULL),
(2, 'Banner_2', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1747884438/banners/bx7tq5izfxkcwhc3ni4t.jpg', NULL, 1, '2025-05-22 03:24:36', '2025-05-22 03:27:19', NULL),
(3, 'Slider_1', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1755872706/banners/oijtmwln9a3a9w93mctq.jpg', NULL, 1, '2025-05-22 03:24:49', '2025-05-22 03:27:41', NULL),
(4, 'Slider_2', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1747884482/banners/cwmufyknwpoyecrwx52c.jpg', NULL, 1, '2025-05-22 03:25:00', '2025-05-22 03:28:03', NULL),
(5, 'Slider_3', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1747884497/banners/hv7598we0af5mj70r6il.jpg', NULL, 1, '2025-05-22 10:25:10', '2025-05-22 03:28:18', NULL),
(6, 'Event_1', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1755874522/banners/n2afazbfzajjumeuqedr.jpg', NULL, 1, '2025-05-22 10:25:10', '2025-05-22 03:28:18', NULL),
(7, 'Event_2', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1755875332/banners/ffonv1h2gjap2kicouq0.jpg', NULL, 1, '2025-05-22 10:25:10', '2025-05-22 03:28:18', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `cart_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `cart_item_id` bigint UNSIGNED NOT NULL,
  `cart_id` bigint UNSIGNED DEFAULT NULL,
  `variant_id` bigint UNSIGNED DEFAULT NULL,
  `price_snapshot` decimal(10,2) NOT NULL DEFAULT '0.00',
  `quantity` int NOT NULL DEFAULT '1',
  `is_selected` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` bigint UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `name`, `description`, `image_url`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'iPhone', 'Apple iPhone smartphones', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748945978/categories/nxt5q0zphk1ho1tgrnoi.png', '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(2, 'Samsung', 'Samsung smartphones including Galaxy series', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748945991/categories/gq6tqdsk85tlpna69xat.png', '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(3, 'Xiaomi', 'Xiaomi smartphones', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748946004/categories/v92i3rwqiqwrqqa1ps3e.png', '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(4, 'OPPO', 'OPPO smartphones', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748946021/categories/rmqhwksoeacjpewsmthw.png', '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(5, 'Vivo', 'Vivo smartphones', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748946056/categories/bwuqvht7vtnh0l9xkt4i.png', '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(6, 'Tecno', 'Tecno smartphones', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748946367/categories/w1anpsleqdosw2bro79c.png', '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(7, 'Realme', 'Realme smartphones', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1748946953/categories/ljpb3x6yda9ce5bsz7vt.png', '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `chatbots`
--

CREATE TABLE `chatbots` (
  `chatbot_id` bigint UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chatbots`
--

INSERT INTO `chatbots` (`chatbot_id`, `name`, `description`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Bot Tư Vấn Khách Hàng', 'Bot hỗ trợ tư vấn khách hàng về sản phẩm, voucher, đơn hàng.', 1, '2025-10-26 16:32:20', '2025-10-26 16:32:20', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `chatbot_logs`
--

CREATE TABLE `chatbot_logs` (
  `log_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `response` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `comment_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `product_id` bigint UNSIGNED DEFAULT NULL,
  `variant_id` bigint UNSIGNED DEFAULT NULL,
  `replied_by` bigint UNSIGNED DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `rating` int DEFAULT NULL,
  `upload_urls` json DEFAULT NULL,
  `reply` text COLLATE utf8mb4_unicode_ci,
  `replied_at` datetime DEFAULT NULL,
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loyalty_points`
--

CREATE TABLE `loyalty_points` (
  `loyalty_point_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `points` int NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loyalty_tiers`
--

CREATE TABLE `loyalty_tiers` (
  `tier_id` bigint UNSIGNED NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_points` int NOT NULL,
  `discount_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loyalty_tiers`
--

INSERT INTO `loyalty_tiers` (`tier_id`, `name`, `image_url`, `min_points`, `discount_percent`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Đồng', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1751509515/%C4%90o%CC%82%CC%80ng_kc0kio.png', 0, '0.00', 'Thành viên Đồng', '2025-10-26 09:32:17', NULL),
(2, 'Bạc', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1751509514/Ba%CC%A3c_nkgbsb.png', 100000, '2.00', 'Thành viên Bạc', '2025-10-26 09:32:17', NULL),
(3, 'Vàng', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1751509515/Va%CC%80ng_riphkz.png', 200000, '4.00', 'Thành viên Vàng', '2025-10-26 09:32:17', NULL),
(4, 'Kim cương', 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1751509515/Kim_cu%CC%9Bo%CC%9Bng_sngmpr.png', 1000000, '6.00', 'Thành viên Kim cương', '2025-10-26 09:32:17', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2025_05_13_033614_create_personal_access_tokens_table', 1),
(2, '2025_05_15_000005_create_loyalty_tiers_table', 1),
(3, '2025_05_15_192514_create_password_resets_table', 1),
(4, '2025_05_16_000001_create_attributes_table', 1),
(5, '2025_05_16_000002_create_attribute_values_table', 1),
(6, '2025_05_16_000003_create_banners_table', 1),
(7, '2025_05_16_000004_create_categories_table', 1),
(8, '2025_05_16_000005_create_products_table', 1),
(9, '2025_05_16_000006_create_users_table', 1),
(10, '2025_05_16_000007_create_carts_table', 1),
(11, '2025_05_16_000007_create_product_variants_table', 1),
(12, '2025_05_16_000008_create_cart_items_table', 1),
(13, '2025_05_16_000010_create_product_specifications_table', 1),
(14, '2025_05_16_000011_create_product_likes_table', 1),
(15, '2025_05_16_000012_create_product_views_table', 1),
(16, '2025_05_16_000013_create_comments_table', 1),
(17, '2025_05_16_000013_create_payment_methods_table', 1),
(18, '2025_05_16_000013_create_vouchers_table', 1),
(19, '2025_05_16_000014_create_orders_table', 1),
(20, '2025_05_16_000015_create_order_items_table', 1),
(21, '2025_05_16_000016_create_user_vouchers_table', 1),
(22, '2025_05_16_000018_create_variant_attribute_values_table', 1),
(23, '2025_05_16_000019_create_news_table', 1),
(24, '2025_05_16_000020_create_chatbots_table', 1),
(25, '2025_05_16_000021_create_chatbot_logs_table', 1),
(26, '2025_05_16_000022_create_support_chats_table', 1),
(27, '2025_05_16_000023_create_support_chat_attachments_table', 1),
(28, '2025_05_16_000024_create_support_chat_notifications_table', 1),
(29, '2025_05_16_000025_create_user_addresses_table', 1),
(30, '2025_05_16_000026_create_return_requests_table', 1),
(31, '2025_05_16_000027_create_return_logs_table', 1),
(32, '2025_05_16_000028_create_shipments_table', 1),
(33, '2025_05_16_000029_create_order_notifications_table', 1),
(34, '2025_05_21_000001_update_foreign_keys_with_cascade', 1),
(35, '2025_06_19_061024_create_pending_orders_table', 1),
(36, '2025_06_20_114900_create_cache_table', 1),
(37, '2025_06_20_115952_create_jobs_table', 1),
(38, '2025_06_21_101845_create_order_status_histories_table', 1),
(39, '2025_06_30_230536_create_loyalty_points_table', 1),
(40, '2025_07_24_101434_add_discount_type_and_max_discount_to_vouchers_table', 1),
(41, '2025_07_25_221954_create_wallets_table', 1),
(42, '2025_07_25_222027_create_wallet_transactions_table', 1),
(43, '2025_08_02_120409_create_withdraw_requests_table', 1),
(44, '2025_08_20_153446_add_return_columns_to_orders_table', 1),
(45, '2025_08_20_153907_add_return_order_id_to_return_requests_table', 1),
(46, '2025_08_22_134649_create_return_notifications_table', 1),
(47, '2026_08_22_000000_add_performance_indexes', 1);

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `news_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `news`
--

INSERT INTO `news` (`news_id`, `user_id`, `title`, `content`, `image_url`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'Jack J97 đồng hành cùng vivo quảng bá sản phẩm mới', 'Ca sĩ Jack J97 trở thành gương mặt đại diện trong chiến dịch quảng bá sản phẩm mới của vivo, thu hút sự quan tâm của giới trẻ.', 'https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/126143/Originals/jack1.png', '2025-10-26 16:32:20', '2025-10-26 16:32:20', NULL),
(2, 1, 'Jack J97 xuất hiện trong sự kiện ra mắt vivo S24', 'Jack J97 gây ấn tượng khi góp mặt tại sự kiện ra mắt vivo S24, sản phẩm nổi bật với thiết kế sang trọng và camera đột phá.', 'https://channel.mediacdn.vn/2020/9/24/photo-2-16009218842091981777481.jpg', '2025-10-26 16:32:20', '2025-10-26 16:32:20', NULL),
(3, 1, 'Jack J97 kết hợp vivo ra mắt dòng sản phẩm trẻ trung', 'Dòng sản phẩm mới của vivo với thiết kế năng động được Jack J97 đồng hành quảng bá, hướng tới đối tượng người dùng trẻ tuổi.', 'https://nghenhinvietnam.vn//uploads/20221024/anh_chup_man_hinh_2020_10_06_luc_11_05_50_sa_qykp.png', '2025-10-26 16:32:20', '2025-10-26 16:32:20', NULL),
(4, 1, 'Jack J97 và vivo ra mắt Find X7 Pro ấn tượng', 'Jack J97 tiếp tục đồng hành cùng vivo trong buổi ra mắt Find X7 Pro – sản phẩm sở hữu công nghệ sạc siêu nhanh và camera ẩn dưới màn hình.', 'https://cdn.tgdd.vn/Files/2020/09/23/1292939/jack-vivo-v20-5_800x450.png', '2025-10-26 16:32:20', '2025-10-26 16:32:20', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` bigint UNSIGNED NOT NULL,
  `order_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `method_id` bigint UNSIGNED DEFAULT NULL,
  `paid_by_wallet` decimal(11,2) NOT NULL DEFAULT '0.00',
  `paid_by_vnpay` decimal(11,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(11,2) DEFAULT NULL,
  `cancel_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ward` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Chờ xác nhận','Đã xác nhận','Đang vận chuyển','Đã giao hàng','Hoàn thành','Đã hủy','Yêu cầu hoàn hàng','Đã chấp thuận','Đã từ chối','Đang xử lý','Đã trả hàng') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Chờ xác nhận',
  `payment_status` enum('Chưa thanh toán','Đã thanh toán','Đã hoàn tiền','Thanh toán thất bại') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Chưa thanh toán',
  `rank_discount` decimal(11,2) NOT NULL DEFAULT '0.00',
  `voucher_id` bigint UNSIGNED DEFAULT NULL,
  `voucher_discount` decimal(11,2) DEFAULT NULL,
  `return_request_id` bigint UNSIGNED DEFAULT NULL,
  `is_return_order` tinyint(1) NOT NULL DEFAULT '0',
  `original_order_id` bigint UNSIGNED DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED DEFAULT NULL,
  `product_id` bigint UNSIGNED DEFAULT NULL,
  `variant_id` bigint UNSIGNED DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_notifications`
--

CREATE TABLE `order_notifications` (
  `notification_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED DEFAULT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_status_histories`
--

CREATE TABLE `order_status_histories` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `old_status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `method_id` bigint UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`method_id`, `name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'VNPay', 'Thanh toán qua VNPay', 1, '2025-10-26 16:32:20', '2025-10-26 16:32:20'),
(2, 'COD', 'Thanh toán COD', 1, '2025-10-26 16:32:20', '2025-10-26 16:32:20'),
(3, 'DHPay', 'Thanh toán qua ví DHPay', 1, '2025-10-26 16:32:20', '2025-10-26 16:32:20');

-- --------------------------------------------------------

--
-- Table structure for table `pending_orders`
--

CREATE TABLE `pending_orders` (
  `id` bigint UNSIGNED NOT NULL,
  `order_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `items` json NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `voucher_id` bigint UNSIGNED DEFAULT NULL,
  `voucher_discount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `customer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ward` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_by_wallet` decimal(15,2) NOT NULL DEFAULT '0.00',
  `paid_by_vnpay` decimal(15,2) NOT NULL DEFAULT '0.00',
  `rank_discount` decimal(11,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `price_original` decimal(10,2) DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `view_count` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `category_id`, `name`, `description`, `price`, `price_original`, `image_url`, `view_count`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'iPhone 15 Pro Max', 'The latest iPhone with A17 Pro chip, 48MP camera system, and titanium design', '31990000.00', '33990000.00', 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6525/6525424_sd.jpg', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(2, 1, 'iPhone 14 Pro', 'Features A16 Bionic chip, 48MP main camera, and Dynamic Island', '24990000.00', '26990000.00', 'https://m.media-amazon.com/images/I/51CJE8vrvIL._AC_UF894,1000_QL80_.jpg', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(3, 1, 'iPhone 13 Pro Max', 'Features A15 Bionic chip, ProMotion display, and pro camera system', '21990000.00', '23990000.00', 'https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-xanh-la-thumb-600x600.jpg', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(4, 1, 'iPhone 14 Pro Max', 'Features A16 Bionic chip, 48MP camera system, and Dynamic Island', '27990000.00', '29990000.00', 'https://cdn.tgdd.vn/Products/Images/42/251192/iphone-14-pro-max-vang-thumb-600x600.jpg', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(5, 1, 'iPhone 14 Plus', 'Features A15 Bionic chip, larger 6.7-inch display', '23990000.00', '25990000.00', 'https://cdn.tgdd.vn/Products/Images/42/245545/iPhone-14-plus-thumb-den-600x600.jpg', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(6, 1, 'iPhone 14', 'Features A15 Bionic chip, advanced camera system', '19990000.00', '21990000.00', 'https://cdn.tgdd.vn/Products/Images/42/240259/iPhone-14-thumb-do-600x600.jpg', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(7, 2, 'Samsung Galaxy S24 Ultra', 'Premium Android flagship with S Pen support and advanced AI features', '29490000.00', '31490000.00', 'https://cdn.xtmobile.vn/vnt_upload/product/05_2024/thumbs/600_d_1.png', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(8, 2, 'Samsung Galaxy Z Fold 5', 'Foldable smartphone with large internal display', '43990000.00', '45990000.00', 'https://m.media-amazon.com/images/I/51j7o+cmJ-L._AC_UF894,1000_QL80_DpWeblab_.jpg', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(9, 2, 'Samsung Galaxy S24+', 'High-end smartphone with premium features and AI capabilities', '25990000.00', '27990000.00', 'https://m.media-amazon.com/images/I/51wQxCsDMSL.jpg', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(10, 2, 'Samsung Galaxy Z Flip 5', 'Compact foldable smartphone with innovative design', '21990000.00', '23990000.00', 'https://m.media-amazon.com/images/I/61IqkfGCw5L._AC_UF894,1000_QL80_.jpg', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(11, 3, 'Xiaomi 13T Pro', 'Premium mid-range with great camera system', '15990000.00', '16990000.00', 'https://cdn.tgdd.vn/Products/Images/42/309816/xiaomi-13t-pro-xanh-thumb-600x600.jpg', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(12, 5, 'Vivo V29e', 'Mid-range phone with excellent camera', '8990000.00', '9990000.00', 'https://i.ebayimg.com/images/g/9vAAAOSwl7dk8fA3/s-l400.jpg', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(13, 5, 'Vivo V27e', 'Stylish mid-range smartphone', '7990000.00', '8990000.00', 'https://cdn.tgdd.vn/Products/Images/42/297026/vivo-v27e-tim-thumb-600x600.jpg', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(14, 6, 'Tecno Phantom V Flip', 'Affordable foldable smartphone', '11990000.00', '12990000.00', 'https://d13pvy8xd75yde.cloudfront.net/phantom/fileadmin/sitedesign/Resources/Public/Image/product/phantomvflip/AD11_Iconic_Black.png', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(15, 6, 'Tecno Pova 5 Pro', 'Gaming-focused budget smartphone', '5990000.00', '6490000.00', 'https://d13pvy8xd75yde.cloudfront.net/global/phones/pova-5-pro-5g/Drak%20Illusion.png', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(16, 7, 'Realme 11 Pro+ 5G', 'Mid-range phone with 100MP camera', '12990000.00', '13990000.00', 'https://m.media-amazon.com/images/I/81r+hFt6pDL._AC_UF894,1000_QL80_DpWeblab_.jpg', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(17, 7, 'Realme C67', 'Budget phone with good performance', '4290000.00', '4990000.00', 'https://rukminim2.flixcart.com/image/850/1000/xif0q/mobile/q/k/f/-original-imagw3rhccszrram.jpeg?q=20&crop=false', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(18, 1, 'iPhone 16 Pro Max', 'The latest iPhone with A18 Pro chip, enhanced camera system, and titanium design', '33990000.00', '35990000.00', 'https://cdn.tgdd.vn/Products/Images/42/329149/iphone-16-pro-max-sa-mac-thumb-1-600x600.jpg', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(19, 1, 'iPhone 16 Pro', 'Features A18 Pro chip, advanced camera system, and improved battery life', '28990000.00', '30990000.00', 'https://cdn.tgdd.vn/Products/Images/42/329143/iphone-16-pro-titan-trang.png', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(20, 1, 'iPhone 16 Plus', 'Features A18 chip, larger 6.7-inch display, and enhanced camera capabilities', '25990000.00', '27990000.00', 'https://cdn.tgdd.vn/Products/Images/42/329140/iphone-16-plus-xanh.png', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(21, 1, 'iPhone 16', 'Features A18 chip, improved camera system, and all-day battery life', '22990000.00', '24990000.00', 'https://cdn.tgdd.vn/Products/Images/42/329135/iphone-16-xanh-mong-ket-thumbnew-600x600.png', 0, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_likes`
--

CREATE TABLE `product_likes` (
  `like_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_specifications`
--

CREATE TABLE `product_specifications` (
  `spec_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED DEFAULT NULL,
  `spec_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `spec_value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_specifications`
--

INSERT INTO `product_specifications` (`spec_id`, `product_id`, `spec_name`, `spec_value`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'Display', '6.7\" Super Retina XDR OLED', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(2, 1, 'Processor', 'A17 Pro chip', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(3, 1, 'Camera', '48MP Main + 12MP Ultra Wide + 12MP Telephoto', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(4, 1, 'Battery', '4422 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(5, 1, 'Operating System', 'iOS 17', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(6, 1, 'Water Resistance', 'IP68', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(7, 1, 'Material', 'Titanium frame', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(8, 2, 'Display', '6.1\" Super Retina XDR OLED', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(9, 2, 'Processor', 'A16 Bionic chip', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(10, 2, 'Camera', '48MP Main + 12MP Ultra Wide + 12MP Telephoto', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(11, 2, 'Battery', '3200 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(12, 2, 'Operating System', 'iOS 17', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(13, 2, 'Water Resistance', 'IP68', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(14, 2, 'Material', 'Stainless steel frame', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(15, 3, 'Display', '6.7\" Super Retina XDR OLED with ProMotion', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(16, 3, 'Processor', 'A15 Bionic chip', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(17, 3, 'Camera', '12MP Main + 12MP Ultra Wide + 12MP Telephoto', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(18, 3, 'Battery', '4352 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(19, 3, 'Operating System', 'iOS 17', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(20, 3, 'Water Resistance', 'IP68', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(21, 3, 'Material', 'Stainless steel frame', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(22, 4, 'Display', '6.1\" Super Retina XDR OLED', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(23, 4, 'Processor', 'A16 Bionic chip', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(24, 4, 'Camera', '48MP Main + 12MP Ultra Wide + 12MP Telephoto', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(25, 4, 'Battery', '3200 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(26, 4, 'Operating System', 'iOS 17', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(27, 4, 'Water Resistance', 'IP68', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(28, 4, 'Material', 'Stainless steel frame', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(29, 5, 'Display', '6.1\" Super Retina XDR OLED', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(30, 5, 'Processor', 'A16 Bionic chip', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(31, 5, 'Camera', '48MP Main + 12MP Ultra Wide + 12MP Telephoto', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(32, 5, 'Battery', '3200 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(33, 5, 'Operating System', 'iOS 17', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(34, 5, 'Water Resistance', 'IP68', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(35, 5, 'Material', 'Stainless steel frame', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(36, 6, 'Display', '6.1\" Super Retina XDR OLED', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(37, 6, 'Processor', 'A16 Bionic chip', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(38, 6, 'Camera', '48MP Main + 12MP Ultra Wide + 12MP Telephoto', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(39, 6, 'Battery', '3200 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(40, 6, 'Operating System', 'iOS 17', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(41, 6, 'Water Resistance', 'IP68', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(42, 6, 'Material', 'Stainless steel frame', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(43, 7, 'Display', '6.8\" Dynamic AMOLED 2X', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(44, 7, 'Processor', 'Snapdragon 8 Gen 3', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(45, 7, 'Camera', '200MP Main + 12MP Ultra Wide + 50MP Telephoto', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(46, 7, 'Battery', '5000 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(47, 7, 'Operating System', 'Android 14 with One UI 6.1', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(48, 7, 'Water Resistance', 'IP68', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(49, 7, 'Material', 'Titanium frame', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(50, 8, 'Display', '6.5\" AMOLED', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(51, 8, 'Processor', 'Snapdragon 8 Gen 2', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(52, 8, 'Camera', '50MP Main + 12MP Ultra Wide', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(53, 8, 'Battery', '4500 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(54, 8, 'Operating System', 'Android 14', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(55, 8, 'Water Resistance', 'IP67', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(56, 9, 'Display', '6.8\" Dynamic AMOLED 2X', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(57, 9, 'Processor', 'Snapdragon 8 Gen 3', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(58, 9, 'Camera', '200MP Main + 12MP Ultra Wide + 50MP Telephoto', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(59, 9, 'Battery', '5000 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(60, 9, 'Operating System', 'Android 14 with One UI 6.1', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(61, 9, 'Water Resistance', 'IP68', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(62, 9, 'Material', 'Titanium frame', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(63, 10, 'Display', '6.5\" AMOLED', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(64, 10, 'Processor', 'Snapdragon 8 Gen 2', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(65, 10, 'Camera', '50MP Main + 12MP Ultra Wide', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(66, 10, 'Battery', '4500 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(67, 10, 'Operating System', 'Android 14', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(68, 10, 'Water Resistance', 'IP67', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(69, 11, 'Display', '6.5\" AMOLED', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(70, 11, 'Processor', 'Snapdragon 8 Gen 2', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(71, 11, 'Camera', '50MP Main + 12MP Ultra Wide', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(72, 11, 'Battery', '4500 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(73, 11, 'Operating System', 'Android 14', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(74, 11, 'Water Resistance', 'IP67', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(75, 12, 'Display', '6.5\" AMOLED', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(76, 12, 'Processor', 'Snapdragon 8 Gen 2', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(77, 12, 'Camera', '50MP Main + 12MP Ultra Wide', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(78, 12, 'Battery', '4500 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(79, 12, 'Operating System', 'Android 14', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(80, 12, 'Water Resistance', 'IP67', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(81, 13, 'Display', '6.5\" AMOLED', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(82, 13, 'Processor', 'Snapdragon 8 Gen 2', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(83, 13, 'Camera', '50MP Main + 12MP Ultra Wide', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(84, 13, 'Battery', '4500 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(85, 13, 'Operating System', 'Android 14', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(86, 13, 'Water Resistance', 'IP67', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(87, 14, 'Display', '6.5\" AMOLED', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(88, 14, 'Processor', 'Snapdragon 8 Gen 2', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(89, 14, 'Camera', '50MP Main + 12MP Ultra Wide', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(90, 14, 'Battery', '4500 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(91, 14, 'Operating System', 'Android 14', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(92, 14, 'Water Resistance', 'IP67', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(93, 15, 'Display', '6.5\" AMOLED', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(94, 15, 'Processor', 'Snapdragon 8 Gen 2', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(95, 15, 'Camera', '50MP Main + 12MP Ultra Wide', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(96, 15, 'Battery', '4500 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(97, 15, 'Operating System', 'Android 14', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(98, 15, 'Water Resistance', 'IP67', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(99, 16, 'Display', '6.5\" AMOLED', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(100, 16, 'Processor', 'Snapdragon 8 Gen 2', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(101, 16, 'Camera', '50MP Main + 12MP Ultra Wide', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(102, 16, 'Battery', '4500 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(103, 16, 'Operating System', 'Android 14', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(104, 16, 'Water Resistance', 'IP67', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(105, 17, 'Display', '6.5\" AMOLED', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(106, 17, 'Processor', 'Snapdragon 8 Gen 2', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(107, 17, 'Camera', '50MP Main + 12MP Ultra Wide', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(108, 17, 'Battery', '4500 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(109, 17, 'Operating System', 'Android 14', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(110, 17, 'Water Resistance', 'IP67', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(111, 18, 'Display', '6.7\" Super Retina XDR OLED with ProMotion', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(112, 18, 'Processor', 'A18 Pro chip', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(113, 18, 'Camera', '48MP Main + 48MP Ultra Wide + 12MP Telephoto', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(114, 18, 'Battery', '4685 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(115, 18, 'Operating System', 'iOS 18', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(116, 18, 'Water Resistance', 'IP68', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(117, 18, 'Material', 'Titanium frame', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(118, 19, 'Display', '6.7\" Super Retina XDR OLED with ProMotion', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(119, 19, 'Processor', 'A18 Pro chip', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(120, 19, 'Camera', '48MP Main + 48MP Ultra Wide + 12MP Telephoto', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(121, 19, 'Battery', '4685 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(122, 19, 'Operating System', 'iOS 18', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(123, 19, 'Water Resistance', 'IP68', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(124, 19, 'Material', 'Titanium frame', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(125, 20, 'Display', '6.7\" Super Retina XDR OLED with ProMotion', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(126, 20, 'Processor', 'A18 Pro chip', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(127, 20, 'Camera', '48MP Main + 48MP Ultra Wide + 12MP Telephoto', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(128, 20, 'Battery', '4685 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(129, 20, 'Operating System', 'iOS 18', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(130, 20, 'Water Resistance', 'IP68', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(131, 20, 'Material', 'Titanium frame', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(132, 21, 'Display', '6.7\" Super Retina XDR OLED with ProMotion', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(133, 21, 'Processor', 'A18 Pro chip', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(134, 21, 'Camera', '48MP Main + 48MP Ultra Wide + 12MP Telephoto', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(135, 21, 'Battery', '4685 mAh', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(136, 21, 'Operating System', 'iOS 18', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(137, 21, 'Water Resistance', 'IP68', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(138, 21, 'Material', 'Titanium frame', '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `variant_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED DEFAULT NULL,
  `sku` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `price_original` decimal(10,2) DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`variant_id`, `product_id`, `sku`, `price`, `price_original`, `image_url`, `stock`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'IP-iphone-15-pro-max-256-UoHi', '31990000.00', '33990000.00', 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6525/6525424_sd.jpg', 100, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(2, 1, 'IP-iphone-15-pro-max-512-fe9O', '35990000.00', '37990000.00', 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6525/6525425_sd.jpg', 75, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(3, 1, 'IP-iphone-15-pro-max-1TB-E6Kx', '41990000.00', '43990000.00', 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6525/6525426_sd.jpg', 50, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(4, 2, 'IP-iphone-14-pro-128-rp8n', '24990000.00', '26990000.00', 'https://cdn.tgdd.vn/Products/Images/42/247508/iphone-14-pro-den-thumb-600x600.jpg', 100, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(5, 2, 'IP-iphone-14-pro-256-Q5ba', '27990000.00', '29990000.00', 'https://m.media-amazon.com/images/I/51CJE8vrvIL._AC_UF894,1000_QL80_.jpg', 75, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(6, 2, 'IP-iphone-14-pro-512-Ly3j', '30990000.00', '32990000.00', 'https://cdn.tgdd.vn/Products/Images/42/247508/iphone-14-pro-vang-thumb-600x600.jpg', 50, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(7, 3, 'IP-iphone-13-pro-max-128-2OLa', '21990000.00', '23990000.00', 'https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-xanh-la-thumb-600x600.jpg', 100, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(8, 3, 'IP-iphone-13-pro-max-256-qG83', '24990000.00', '26990000.00', 'https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-gold-1-600x600.jpg', 75, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(9, 3, 'IP-iphone-13-pro-max-512-Fs5Z', '28990000.00', '30990000.00', 'https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-silver-600x600.jpg', 50, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(10, 4, 'IP-iphone-14-pro-max-128-DUgF', '27990000.00', '29990000.00', 'https://cdn.tgdd.vn/Products/Images/42/251192/iphone-14-pro-max-den-thumb-600x600.jpg', 100, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(11, 4, 'IP-iphone-14-pro-max-256-N6vO', '30990000.00', '32990000.00', 'https://cdn.tgdd.vn/Products/Images/42/251192/iphone-14-pro-max-tim-thumb-600x600.jpg', 75, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(12, 4, 'IP-iphone-14-pro-max-512-0Aso', '35990000.00', '37990000.00', 'https://cdn.tgdd.vn/Products/Images/42/251192/iphone-14-pro-max-vang-thumb-600x600.jpg', 50, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(13, 5, 'IP-iphone-14-plus-128-CRw6', '23990000.00', '25990000.00', 'https://cdn.tgdd.vn/Products/Images/42/245545/iPhone-14-plus-thumb-den-600x600.jpg', 100, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(14, 5, 'IP-iphone-14-plus-256-3uxo', '26990000.00', '28990000.00', 'https://cdn.tgdd.vn/Products/Images/42/245545/iPhone-14-plus-thumb-xanh-1-600x600.jpg', 75, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(15, 6, 'IP-iphone-14-128-eVDy', '19990000.00', '21990000.00', 'https://cdn.tgdd.vn/Products/Images/42/240259/iPhone-14-thumb-do-600x600.jpg', 100, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(16, 6, 'IP-iphone-14-256-aIW9', '22990000.00', '24990000.00', 'https://cdn.tgdd.vn/Products/Images/42/240259/iPhone-14-thumb-trang-600x600.jpg', 75, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(17, 7, 'SAM-samsung-galaxy-s24-ultra-256-FcKh', '29490000.00', '31490000.00', 'https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-5g-600x600.jpg', 100, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(18, 7, 'SAM-samsung-galaxy-s24-ultra-512-ZBNR', '32490000.00', '34490000.00', 'https://cdn.xtmobile.vn/vnt_upload/product/05_2024/thumbs/600_d_1.png', 75, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(19, 8, 'SAM-samsung-galaxy-z-fold-5-256-eXD3', '40990000.00', '42990000.00', 'https://m.media-amazon.com/images/I/51j7o+cmJ-L._AC_UF894,1000_QL80_DpWeblab_.jpg', 100, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(20, 8, 'SAM-samsung-galaxy-z-fold-5-512-GzqB', '43990000.00', '45990000.00', 'https://m.media-amazon.com/images/I/419+v5-SumL._QL92_SH45_SX240_SY220_CR,0,0,240,220_.jpg', 75, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(21, 9, 'SAM-samsung-galaxy-s24-256-ezDz', '25990000.00', '27990000.00', 'https://images.openai.com/thumbnails/54b526810c7d73bd2d2e22d3add2fc84.jpeg', 100, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(22, 9, 'SAM-samsung-galaxy-s24-512-YYRB', '28990000.00', '30990000.00', 'https://images.samsung.com/is/image/samsung/p6pim/vn/2401/gallery/vn-galaxy-s24-plus-s926-sm-s926bzsgxxv-thumb-539452184', 75, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(23, 10, 'SAM-samsung-galaxy-z-flip-5-256-VWBm', '21990000.00', '23990000.00', 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6548/6548830_sd.jpg', 100, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(24, 10, 'SAM-samsung-galaxy-z-flip-5-512-IPfh', '24990000.00', '26990000.00', 'https://m.media-amazon.com/images/I/61IqkfGCw5L._AC_UF894,1000_QL80_.jpg', 75, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(25, 11, 'XIA-xiaomi-13t-pro-256-KONz', '15990000.00', '16990000.00', 'https://cdn.tgdd.vn/Products/Images/42/309816/xiaomi-13t-pro-xanh-thumb-600x600.jpg', 100, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(26, 11, 'XIA-xiaomi-13t-pro-512-KA1z', '17990000.00', '18990000.00', 'https://cdn.tgdd.vn/Products/Images/42/309816/xiaomi-13t-pro-den-thumb-600x600.jpg', 75, 1, '2025-10-26 16:32:17', '2025-10-26 16:32:17', NULL),
(27, 12, 'VIV-vivo-v29e-256-IEJt', '8990000.00', '9990000.00', 'https://i.ebayimg.com/images/g/9vAAAOSwl7dk8fA3/s-l400.jpg', 100, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(28, 12, 'VIV-vivo-v29e-128-IeQ4', '7990000.00', '8990000.00', 'https://i.ebayimg.com/images/g/9vAAAOSwl7dk8fA3/s-l400.jpg', 75, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(29, 13, 'VIV-vivo-v27e-256-0zgd', '7990000.00', '8990000.00', 'https://cdn.tgdd.vn/Products/Images/42/297026/vivo-v27e-tim-thumb-600x600.jpg', 100, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(30, 13, 'VIV-vivo-v27e-128-HgHB', '6990000.00', '7990000.00', 'https://cdn.tgdd.vn/Products/Images/42/297026/vivo-v27e-den-thumb-600x600.jpg', 75, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(31, 14, 'TEC-tecno-phantom-v-flip-256-rzRz', '11990000.00', '12990000.00', 'https://d13pvy8xd75yde.cloudfront.net/phantom/fileadmin/sitedesign/Resources/Public/Image/product/phantomvflip/AD11_Iconic_Black.png', 100, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(32, 15, 'TEC-tecno-pova-5-pro-128-UDrH', '5990000.00', '6490000.00', 'https://d13pvy8xd75yde.cloudfront.net/global/phones/pova-5-pro-5g/Drak%20Illusion.png', 100, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(33, 16, 'REA-realme-11-pro-5g-256-NEPF', '12990000.00', '13990000.00', 'https://m.media-amazon.com/images/I/81r+hFt6pDL._AC_UF894,1000_QL80_DpWeblab_.jpg', 100, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(34, 17, 'REA-realme-c67-128-3QV3', '4290000.00', '4990000.00', 'https://rukminim2.flixcart.com/image/850/1000/xif0q/mobile/q/k/f/-original-imagw3rhccszrram.jpeg?q=20&crop=false', 100, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(35, 18, 'IP-iphone-16-pro-max-256-0a5s', '33990000.00', '35990000.00', 'https://cdn.tgdd.vn/Products/Images/42/329149/iphone-16-pro-max-sa-mac-thumb-1-600x600.jpg', 100, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(36, 18, 'IP-iphone-16-pro-max-512-PErW', '37990000.00', '39990000.00', 'https://img.tgdd.vn/imgt/old/f_webp,fit_outside,quality_75/https://cdn.tgdd.vn/Products/Images/42/329151/iphone-16-pro-max-black-thumb-600x600.jpg', 75, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(37, 18, 'IP-iphone-16-pro-max-1TB-3jiA', '42990000.00', '44990000.00', 'https://cdn.tgdd.vn/Products/Images/42/329151/iphone-16-pro-max-titan-trang-thumbtgdd-600x600.png', 50, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(38, 19, 'IP-iphone-16-pro-256-iqHx', '28990000.00', '30990000.00', 'https://cdn.tgdd.vn/Products/Images/42/329143/iphone-16-pro-titan-trang.png', 100, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(39, 19, 'IP-iphone-16-pro-512-00rk', '32990000.00', '34990000.00', 'https://cdn.tgdd.vn/Products/Images/42/329143/iphone-16-pro-titan-den.png', 75, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(40, 19, 'IP-iphone-16-pro-1TB-Fl8s', '37990000.00', '39990000.00', 'https://cdn.tgdd.vn/Products/Images/42/329149/iphone-16-pro-max-sa-mac-thumb-1-600x600.jpg', 50, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(41, 20, 'IP-iphone-16-plus-128-6UNr', '25990000.00', '27990000.00', 'https://cdn.tgdd.vn/Products/Images/42/329140/iphone-16-plus-xanh.png', 100, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(42, 20, 'IP-iphone-16-plus-256-2U9B', '28990000.00', '30990000.00', 'https://cdn.tgdd.vn/Products/Images/42/329140/iphone-16-plus-hong.png', 75, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(43, 20, 'IP-iphone-16-plus-512-YS5p', '33990000.00', '35990000.00', 'https://cdn.tgdd.vn/Products/Images/42/329140/iphone-16-plus-den.png', 50, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(44, 21, 'IP-iphone-16-128-lsTL', '22990000.00', '24990000.00', 'https://cdn.tgdd.vn/Products/Images/42/329135/iphone-16-xanh-mong-ket-thumbnew-600x600.png', 100, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(45, 21, 'IP-iphone-16-256-8ZHD', '25990000.00', '27990000.00', 'https://cdn.tgdd.vn/Products/Images/42/329135/iphone-16-black-600x600.png', 75, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(46, 21, 'IP-iphone-16-512-Bazt', '30990000.00', '32990000.00', 'https://cdn.tgdd.vn/Products/Images/42/329135/iphone-16-pink-600x600.png', 50, 1, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_views`
--

CREATE TABLE `product_views` (
  `view_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `product_id` bigint UNSIGNED DEFAULT NULL,
  `viewed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `return_logs`
--

CREATE TABLE `return_logs` (
  `log_id` bigint UNSIGNED NOT NULL,
  `return_id` bigint UNSIGNED DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `return_notifications`
--

CREATE TABLE `return_notifications` (
  `return_notification_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `return_request_id` bigint UNSIGNED NOT NULL,
  `message` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `return_requests`
--

CREATE TABLE `return_requests` (
  `return_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED DEFAULT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `upload_url` json DEFAULT NULL,
  `return_reason_other` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Đã yêu cầu','Đã chấp thuận','Đã từ chối','Đang xử lý','Đã hoàn lại','Đã hủy') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Đã yêu cầu',
  `refund_amount` decimal(11,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `return_items` json DEFAULT NULL,
  `return_order_id` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shipments`
--

CREATE TABLE `shipments` (
  `shipment_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED DEFAULT NULL,
  `tracking_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `carrier` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `shipping_address` text COLLATE utf8mb4_unicode_ci,
  `shipped_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `support_chats`
--

CREATE TABLE `support_chats` (
  `chat_id` bigint UNSIGNED NOT NULL,
  `customer_id` bigint UNSIGNED DEFAULT NULL,
  `staff_id` bigint UNSIGNED DEFAULT NULL,
  `sender` enum('customer','admin','sale') COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `sent_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `support_chat_attachments`
--

CREATE TABLE `support_chat_attachments` (
  `attachment_id` bigint UNSIGNED NOT NULL,
  `chat_id` bigint UNSIGNED DEFAULT NULL,
  `file_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `support_chat_notifications`
--

CREATE TABLE `support_chat_notifications` (
  `notification_id` bigint UNSIGNED NOT NULL,
  `chat_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint UNSIGNED NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `ward` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('customer','admin','sale') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `is_blocked` tinyint(1) NOT NULL DEFAULT '0',
  `tier_id` bigint UNSIGNED DEFAULT NULL,
  `loyalty_points` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `image_url`, `username`, `password_hash`, `email`, `full_name`, `phone`, `address`, `ward`, `district`, `city`, `role`, `is_blocked`, `tier_id`, `loyalty_points`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'https://www.shutterstock.com/image-vector/man-inscription-admin-icon-outline-600nw-1730974153.jpg', 'admin_user', '$2y$12$c9JUwh1XhnH2aKL.64xG5ukmHxnsvku2R7nfLR58Rb0VMG7G8wmvK', 'admin@gmail.com', 'Admin User', '0123456780', '123 Admin Street', NULL, NULL, NULL, 'admin', 0, 1, 0, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(2, 'https://www.shutterstock.com/image-vector/man-inscription-admin-icon-outline-600nw-1730974153.jpg', 'customer_user', '$2y$12$d8GHZNvoO4iGZnKUUQ/9VuWUrOtGsXJRi422RAOdvf7Fgf9Aa4/n6', 'customer@gmail.com', 'Customer User', '0123456781', '123 Customer Street', NULL, NULL, NULL, 'customer', 0, 1, 0, '2025-10-26 16:32:19', '2025-10-26 16:32:19', NULL),
(3, 'https://www.shutterstock.com/image-vector/man-inscription-admin-icon-outline-600nw-1730974153.jpg', 'sale_user', '$2y$12$dxTItQ2wNox4gzMdjNe.yeu66F.97duq14.FheHe0GrfMfzgycq6S', 'sale@gmail.com', 'Sale User', '0123456782', '123 Sale Street', NULL, NULL, NULL, 'sale', 0, 1, 0, '2025-10-26 16:32:19', '2025-10-26 16:32:19', NULL),
(4, 'https://www.shutterstock.com/image-vector/man-inscription-admin-icon-outline-600nw-1730974153.jpg', 'x$ng', '$2y$12$j1mxQPpakSgOLWWQ8BrxMuM5eMqtAUC1p0uwBkotNCUMAqH73z4Ie', 'tungnguyenle0909@gmail.com', 'Lê Nguyên Tùng', '01656502625', 'Khu phố 8, thị trấn Thiệu Hóa, huyện Thiệu Hóa, tỉnh Thanh Hóa', 'Xã An Thái', 'Huyện An Lão', 'Thành phố Hải Phòng', 'sale', 0, 1, 0, '2025-05-22 03:42:09', '2025-05-22 08:11:55', NULL),
(5, 'https://res.cloudinary.com/dvxpjf2zb/image/upload/v1747888442/users/ojju0ueo5bkigm2ygqcg.jpg', 'dfsf', '$2y$12$O0lIXtzms1DtdllWKJvdWed7SSmI45JCnQeUKwkrItWLtjn9kmwtK', 'tung.ln@mor.com.vn', 'Xèng', '0396180619', 'Thanh hóa', 'Xã Tề Lễ', 'Huyện Tam Nông', 'Tỉnh Phú Thọ', 'customer', 0, 1, 0, '2025-05-22 03:43:12', '2025-05-22 04:34:03', NULL),
(6, 'https://www.shutterstock.com/image-vector/man-inscription-admin-icon-outline-600nw-1730974153.jpg', 'xengne', '$2y$12$9AlfJ2A5uOS6oWwrLutkxur1Ru4ygx3OG8uLhyK5iMjIoFlmkdaeK', 'tunglnph49038@gmail.com', 'Lê Nguyên Tùng', '0396180619', 'Bắc Ninh', 'Xã Hà Hiệu', 'Huyện Ba Bể', 'Tỉnh Bắc Kạn', 'customer', 0, 1, 0, '2025-05-22 06:14:22', '2025-05-22 06:29:00', NULL),
(7, 'https://www.shutterstock.com/image-vector/man-inscription-admin-icon-outline-600nw-1730974153.jpg', 'hquan12323', '$2y$12$oZFEgcWamyLP8GuVzCUwQeQTGwvy3FWTQHWtVnZh2YDWBFoiX75m.', 'hquan12323@gmail.com', 'Hoàng Quân', '0987654321', 'Hải Phòng', 'Phường Thượng Lý', 'Quận Hồng Bàng', 'Thành phố Hải Phòng', 'admin', 0, 1, 0, '2025-10-26 16:32:19', '2025-10-26 16:32:19', NULL),
(8, 'https://www.shutterstock.com/image-vector/man-inscription-admin-icon-outline-600nw-1730974153.jpg', 'duyhung05', '$2y$12$/otxpE9q4DiH8vzu5hqFXeUqEtWiE3SR52kiAf0T4jejdFvJSBc3K', 'duyhung05@gmail.com', 'Duy Hưng', '0123456789', 'Hải Phòng', 'Phường Quán Toan', 'Quận Hồng Bàng', 'Thành phố Hải Phòng', 'admin', 0, 1, 0, '2025-10-26 16:32:20', '2025-10-26 16:32:20', NULL),
(9, 'https://www.shutterstock.com/image-vector/man-inscription-admin-icon-outline-600nw-1730974153.jpg', 'ninhatran', '$2y$12$9dsXI3N1jJWipFONGzLWmOXeaaY9UmKWlzVkdEVTjbgNxNJPSkZ3y', 'ninhtnph49084@gmail.com', 'Nhật Ninh Trần', '0971366828', 'Vĩnh Phúc', 'Thị Trấn Hợp Hòa', 'Huyện Tam Dương', 'Tỉnh Vĩnh phúc', 'admin', 0, 1, 0, '2025-10-26 16:32:20', '2025-10-26 16:32:20', NULL),
(10, 'https://www.shutterstock.com/image-vector/man-inscription-admin-icon-outline-600nw-1730974153.jpg', 'ninhatran5', '$2y$12$sKFvl6cHVZLXDGM/PPipI.HHEeHLJkU38hCRqBp7cPFq8HUof4Yuq', 'tnnpalk@gmail.com', 'Nhật Ninh Trần', '0971366828', 'Vĩnh Phúc', 'Thị Trấn Hợp Hòa', 'Huyện Tam Dương', 'Tỉnh Vĩnh phúc', 'customer', 0, 1, 0, '2025-10-26 16:32:20', '2025-10-26 16:32:20', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_addresses`
--

CREATE TABLE `user_addresses` (
  `address_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `recipient_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `ward` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_vouchers`
--

CREATE TABLE `user_vouchers` (
  `user_voucher_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `voucher_id` bigint UNSIGNED DEFAULT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `quantity` int NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `variant_attribute_values`
--

CREATE TABLE `variant_attribute_values` (
  `id` bigint UNSIGNED NOT NULL,
  `variant_id` bigint UNSIGNED DEFAULT NULL,
  `value_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `variant_attribute_values`
--

INSERT INTO `variant_attribute_values` (`id`, `variant_id`, `value_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(2, 1, 2, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(3, 2, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(4, 2, 3, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(5, 3, 32, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(6, 3, 4, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(7, 4, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(8, 4, 3, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(9, 5, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(10, 5, 6, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(11, 6, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(12, 6, 8, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(13, 7, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(14, 7, 10, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(15, 8, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(16, 8, 8, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(17, 9, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(18, 9, 9, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(19, 10, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(20, 10, 3, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(21, 11, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(22, 11, 7, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(23, 12, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(24, 12, 8, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(25, 13, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(26, 13, 6, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(27, 14, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(28, 15, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(29, 16, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(30, 16, 9, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(31, 17, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(32, 18, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(33, 18, 17, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(34, 19, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(35, 19, 19, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(36, 20, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(37, 21, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(38, 22, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(39, 23, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(40, 24, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(41, 24, 21, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(42, 25, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(43, 25, 24, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(44, 26, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(45, 26, 14, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(46, 27, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(47, 28, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(48, 29, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(49, 29, 16, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(50, 30, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(51, 30, 14, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(52, 31, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(53, 31, 26, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(54, 32, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(55, 33, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(56, 33, 28, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(57, 34, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(58, 34, 14, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(59, 35, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(60, 35, 5, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(61, 36, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(62, 36, 3, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(63, 37, 32, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(64, 37, 4, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(65, 38, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(66, 38, 4, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(67, 39, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(68, 39, 3, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(69, 40, 32, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(70, 40, 5, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(71, 41, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(72, 41, 12, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(73, 42, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(74, 42, 13, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(75, 43, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(76, 43, 6, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(77, 44, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(78, 44, 11, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(79, 45, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(80, 45, 14, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(81, 46, 29, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL),
(82, 46, 13, '2025-10-26 16:32:18', '2025-10-26 16:32:18', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vouchers`
--

CREATE TABLE `vouchers` (
  `voucher_id` bigint UNSIGNED NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `max_discount` int DEFAULT NULL,
  `min_order_value` int NOT NULL DEFAULT '0',
  `quantity` int NOT NULL DEFAULT '0',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `discount_type` enum('fixed','percent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'fixed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vouchers`
--

INSERT INTO `vouchers` (`voucher_id`, `code`, `title`, `discount_amount`, `max_discount`, `min_order_value`, `quantity`, `start_date`, `end_date`, `is_active`, `created_at`, `updated_at`, `deleted_at`, `discount_type`) VALUES
(1, 'NEWUSER80K', 'Voucher Giảm 80K', '80000.00', NULL, 0, 100, '2025-10-26 16:32:20', '2026-08-22 16:32:20', 1, '2025-10-26 16:32:20', '2025-10-26 16:32:20', NULL, 'fixed');

-- --------------------------------------------------------

--
-- Table structure for table `wallets`
--

CREATE TABLE `wallets` (
  `wallet_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `balance` decimal(11,2) NOT NULL DEFAULT '0.00' COMMENT 'Số dư hiện tại trong ví',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `transaction_id` bigint UNSIGNED NOT NULL,
  `wallet_id` bigint UNSIGNED NOT NULL,
  `type` enum('hoàn tiền','tiêu tiền','rút tiền') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(11,2) NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `return_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `withdraw_requests`
--

CREATE TABLE `withdraw_requests` (
  `withdraw_id` bigint UNSIGNED NOT NULL COMMENT 'ID yêu cầu rút tiền',
  `user_id` bigint UNSIGNED NOT NULL,
  `wallet_id` bigint UNSIGNED NOT NULL,
  `transaction_id` bigint UNSIGNED DEFAULT NULL,
  `amount` decimal(11,2) NOT NULL COMMENT 'Số tiền yêu cầu rút',
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên ngân hàng',
  `bank_account_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Số tài khoản',
  `bank_account_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Chủ tài khoản',
  `beneficiary_bank` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ngân hàng thụ hưởng',
  `status` enum('Thêm thông tin','Chờ xử lý','Đã hoàn tất') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Thêm thông tin' COMMENT 'Trạng thái xử lý',
  `img_qr` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL hình ảnh liên quan đến yêu cầu rút tiền',
  `img_bill` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL hình ảnh hóa đơn',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attributes`
--
ALTER TABLE `attributes`
  ADD PRIMARY KEY (`attribute_id`);

--
-- Indexes for table `attribute_values`
--
ALTER TABLE `attribute_values`
  ADD PRIMARY KEY (`value_id`),
  ADD KEY `attribute_values_attribute_id_foreign` (`attribute_id`);

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`banner_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`cart_id`),
  ADD KEY `carts_user_id_foreign` (`user_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`cart_item_id`),
  ADD KEY `cart_items_cart_id_foreign` (`cart_id`),
  ADD KEY `cart_items_variant_id_foreign` (`variant_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `chatbots`
--
ALTER TABLE `chatbots`
  ADD PRIMARY KEY (`chatbot_id`);

--
-- Indexes for table `chatbot_logs`
--
ALTER TABLE `chatbot_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `chatbot_logs_user_id_foreign` (`user_id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `comments_variant_id_foreign` (`variant_id`),
  ADD KEY `comments_replied_by_foreign` (`replied_by`),
  ADD KEY `comments_user_id_foreign` (`user_id`),
  ADD KEY `comments_product_id_foreign` (`product_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `loyalty_points`
--
ALTER TABLE `loyalty_points`
  ADD PRIMARY KEY (`loyalty_point_id`),
  ADD KEY `loyalty_points_user_id_foreign` (`user_id`);

--
-- Indexes for table `loyalty_tiers`
--
ALTER TABLE `loyalty_tiers`
  ADD PRIMARY KEY (`tier_id`),
  ADD UNIQUE KEY `loyalty_tiers_name_unique` (`name`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`news_id`),
  ADD KEY `news_user_id_foreign` (`user_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `orders_order_code_unique` (`order_code`),
  ADD KEY `orders_method_id_foreign` (`method_id`),
  ADD KEY `orders_voucher_id_foreign` (`voucher_id`),
  ADD KEY `orders_original_order_id_foreign` (`original_order_id`),
  ADD KEY `idx_orders_user_created` (`user_id`,`created_at`),
  ADD KEY `idx_orders_status_created` (`status`,`created_at`),
  ADD KEY `idx_orders_return_request_id` (`return_request_id`),
  ADD KEY `idx_orders_is_return_order` (`is_return_order`),
  ADD KEY `idx_orders_order_code` (`order_code`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_items_product_id_foreign` (`product_id`),
  ADD KEY `idx_order_items_order_product` (`order_id`,`product_id`),
  ADD KEY `idx_order_items_variant_id` (`variant_id`);

--
-- Indexes for table `order_notifications`
--
ALTER TABLE `order_notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `order_notifications_order_id_foreign` (`order_id`),
  ADD KEY `order_notifications_user_id_foreign` (`user_id`);

--
-- Indexes for table `order_status_histories`
--
ALTER TABLE `order_status_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_history_order_created` (`order_id`,`created_at`),
  ADD KEY `idx_order_history_changed_by` (`changed_by`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD KEY `password_resets_email_index` (`email`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`method_id`);

--
-- Indexes for table `pending_orders`
--
ALTER TABLE `pending_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pending_orders_order_code_unique` (`order_code`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `products_category_id_foreign` (`category_id`);

--
-- Indexes for table `product_likes`
--
ALTER TABLE `product_likes`
  ADD PRIMARY KEY (`like_id`),
  ADD UNIQUE KEY `product_likes_user_id_product_id_unique` (`user_id`,`product_id`),
  ADD KEY `product_likes_product_id_foreign` (`product_id`);

--
-- Indexes for table `product_specifications`
--
ALTER TABLE `product_specifications`
  ADD PRIMARY KEY (`spec_id`),
  ADD KEY `product_specifications_product_id_foreign` (`product_id`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`variant_id`),
  ADD UNIQUE KEY `product_variants_sku_unique` (`sku`),
  ADD KEY `product_variants_product_id_foreign` (`product_id`),
  ADD KEY `idx_product_variants_price` (`price`);

--
-- Indexes for table `product_views`
--
ALTER TABLE `product_views`
  ADD PRIMARY KEY (`view_id`),
  ADD KEY `product_views_user_id_foreign` (`user_id`),
  ADD KEY `product_views_product_id_foreign` (`product_id`);

--
-- Indexes for table `return_logs`
--
ALTER TABLE `return_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `return_logs_return_id_foreign` (`return_id`);

--
-- Indexes for table `return_notifications`
--
ALTER TABLE `return_notifications`
  ADD PRIMARY KEY (`return_notification_id`),
  ADD KEY `idx_return_notifications_order` (`order_id`),
  ADD KEY `idx_return_notifications_request` (`return_request_id`);

--
-- Indexes for table `return_requests`
--
ALTER TABLE `return_requests`
  ADD PRIMARY KEY (`return_id`),
  ADD KEY `idx_return_requests_order_status` (`order_id`,`status`),
  ADD KEY `idx_return_requests_user_id` (`user_id`),
  ADD KEY `idx_return_requests_created_at` (`created_at`),
  ADD KEY `idx_return_requests_return_order_id` (`return_order_id`);

--
-- Indexes for table `shipments`
--
ALTER TABLE `shipments`
  ADD PRIMARY KEY (`shipment_id`),
  ADD KEY `shipments_order_id_foreign` (`order_id`);

--
-- Indexes for table `support_chats`
--
ALTER TABLE `support_chats`
  ADD PRIMARY KEY (`chat_id`),
  ADD KEY `support_chats_customer_id_foreign` (`customer_id`),
  ADD KEY `support_chats_staff_id_foreign` (`staff_id`);

--
-- Indexes for table `support_chat_attachments`
--
ALTER TABLE `support_chat_attachments`
  ADD PRIMARY KEY (`attachment_id`),
  ADD KEY `support_chat_attachments_chat_id_foreign` (`chat_id`);

--
-- Indexes for table `support_chat_notifications`
--
ALTER TABLE `support_chat_notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `support_chat_notifications_chat_id_foreign` (`chat_id`),
  ADD KEY `support_chat_notifications_user_id_foreign` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_tier_id_foreign` (`tier_id`);

--
-- Indexes for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD PRIMARY KEY (`address_id`),
  ADD KEY `user_addresses_user_id_foreign` (`user_id`);

--
-- Indexes for table `user_vouchers`
--
ALTER TABLE `user_vouchers`
  ADD PRIMARY KEY (`user_voucher_id`),
  ADD KEY `user_vouchers_user_id_foreign` (`user_id`),
  ADD KEY `user_vouchers_voucher_id_foreign` (`voucher_id`);

--
-- Indexes for table `variant_attribute_values`
--
ALTER TABLE `variant_attribute_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `variant_attribute_values_value_id_foreign` (`value_id`),
  ADD KEY `idx_variant_attr_values_variant_id` (`variant_id`);

--
-- Indexes for table `vouchers`
--
ALTER TABLE `vouchers`
  ADD PRIMARY KEY (`voucher_id`),
  ADD UNIQUE KEY `vouchers_code_unique` (`code`);

--
-- Indexes for table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`wallet_id`),
  ADD KEY `wallets_user_id_foreign` (`user_id`);

--
-- Indexes for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `wallet_transactions_wallet_id_foreign` (`wallet_id`),
  ADD KEY `wallet_transactions_return_id_foreign` (`return_id`);

--
-- Indexes for table `withdraw_requests`
--
ALTER TABLE `withdraw_requests`
  ADD PRIMARY KEY (`withdraw_id`),
  ADD KEY `withdraw_requests_user_id_foreign` (`user_id`),
  ADD KEY `withdraw_requests_wallet_id_foreign` (`wallet_id`),
  ADD KEY `withdraw_requests_transaction_id_foreign` (`transaction_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attributes`
--
ALTER TABLE `attributes`
  MODIFY `attribute_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `attribute_values`
--
ALTER TABLE `attribute_values`
  MODIFY `value_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `banner_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `cart_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `cart_item_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `chatbots`
--
ALTER TABLE `chatbots`
  MODIFY `chatbot_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `chatbot_logs`
--
ALTER TABLE `chatbot_logs`
  MODIFY `log_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `comment_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loyalty_points`
--
ALTER TABLE `loyalty_points`
  MODIFY `loyalty_point_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loyalty_tiers`
--
ALTER TABLE `loyalty_tiers`
  MODIFY `tier_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `news_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_notifications`
--
ALTER TABLE `order_notifications`
  MODIFY `notification_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_status_histories`
--
ALTER TABLE `order_status_histories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `method_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `pending_orders`
--
ALTER TABLE `pending_orders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `product_likes`
--
ALTER TABLE `product_likes`
  MODIFY `like_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_specifications`
--
ALTER TABLE `product_specifications`
  MODIFY `spec_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=139;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `variant_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `product_views`
--
ALTER TABLE `product_views`
  MODIFY `view_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `return_logs`
--
ALTER TABLE `return_logs`
  MODIFY `log_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `return_notifications`
--
ALTER TABLE `return_notifications`
  MODIFY `return_notification_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `return_requests`
--
ALTER TABLE `return_requests`
  MODIFY `return_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shipments`
--
ALTER TABLE `shipments`
  MODIFY `shipment_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `support_chats`
--
ALTER TABLE `support_chats`
  MODIFY `chat_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `support_chat_attachments`
--
ALTER TABLE `support_chat_attachments`
  MODIFY `attachment_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `support_chat_notifications`
--
ALTER TABLE `support_chat_notifications`
  MODIFY `notification_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `user_addresses`
--
ALTER TABLE `user_addresses`
  MODIFY `address_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_vouchers`
--
ALTER TABLE `user_vouchers`
  MODIFY `user_voucher_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `variant_attribute_values`
--
ALTER TABLE `variant_attribute_values`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `vouchers`
--
ALTER TABLE `vouchers`
  MODIFY `voucher_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `wallets`
--
ALTER TABLE `wallets`
  MODIFY `wallet_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  MODIFY `transaction_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `withdraw_requests`
--
ALTER TABLE `withdraw_requests`
  MODIFY `withdraw_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID yêu cầu rút tiền';

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attribute_values`
--
ALTER TABLE `attribute_values`
  ADD CONSTRAINT `attribute_values_attribute_id_foreign` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`attribute_id`);

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_cart_id_foreign` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`),
  ADD CONSTRAINT `cart_items_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`);

--
-- Constraints for table `chatbot_logs`
--
ALTER TABLE `chatbot_logs`
  ADD CONSTRAINT `chatbot_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `comments_replied_by_foreign` FOREIGN KEY (`replied_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `comments_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`);

--
-- Constraints for table `loyalty_points`
--
ALTER TABLE `loyalty_points`
  ADD CONSTRAINT `loyalty_points_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `news`
--
ALTER TABLE `news`
  ADD CONSTRAINT `news_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_method_id_foreign` FOREIGN KEY (`method_id`) REFERENCES `payment_methods` (`method_id`),
  ADD CONSTRAINT `orders_original_order_id_foreign` FOREIGN KEY (`original_order_id`) REFERENCES `orders` (`order_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_return_request_id_foreign` FOREIGN KEY (`return_request_id`) REFERENCES `return_requests` (`return_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `orders_voucher_id_foreign` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`voucher_id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  ADD CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `order_items_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`);

--
-- Constraints for table `order_notifications`
--
ALTER TABLE `order_notifications`
  ADD CONSTRAINT `order_notifications_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  ADD CONSTRAINT `order_notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `order_status_histories`
--
ALTER TABLE `order_status_histories`
  ADD CONSTRAINT `order_status_histories_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE;

--
-- Constraints for table `product_likes`
--
ALTER TABLE `product_likes`
  ADD CONSTRAINT `product_likes_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `product_likes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `product_specifications`
--
ALTER TABLE `product_specifications`
  ADD CONSTRAINT `product_specifications_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `product_views`
--
ALTER TABLE `product_views`
  ADD CONSTRAINT `product_views_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_views_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `return_logs`
--
ALTER TABLE `return_logs`
  ADD CONSTRAINT `return_logs_return_id_foreign` FOREIGN KEY (`return_id`) REFERENCES `return_requests` (`return_id`);

--
-- Constraints for table `return_requests`
--
ALTER TABLE `return_requests`
  ADD CONSTRAINT `return_requests_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  ADD CONSTRAINT `return_requests_return_order_id_foreign` FOREIGN KEY (`return_order_id`) REFERENCES `orders` (`order_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `return_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `shipments`
--
ALTER TABLE `shipments`
  ADD CONSTRAINT `shipments_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`);

--
-- Constraints for table `support_chats`
--
ALTER TABLE `support_chats`
  ADD CONSTRAINT `support_chats_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `support_chats_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `support_chat_attachments`
--
ALTER TABLE `support_chat_attachments`
  ADD CONSTRAINT `support_chat_attachments_chat_id_foreign` FOREIGN KEY (`chat_id`) REFERENCES `support_chats` (`chat_id`);

--
-- Constraints for table `support_chat_notifications`
--
ALTER TABLE `support_chat_notifications`
  ADD CONSTRAINT `support_chat_notifications_chat_id_foreign` FOREIGN KEY (`chat_id`) REFERENCES `support_chats` (`chat_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `support_chat_notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_tier_id_foreign` FOREIGN KEY (`tier_id`) REFERENCES `loyalty_tiers` (`tier_id`) ON DELETE SET NULL;

--
-- Constraints for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD CONSTRAINT `user_addresses_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `user_vouchers`
--
ALTER TABLE `user_vouchers`
  ADD CONSTRAINT `user_vouchers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `user_vouchers_voucher_id_foreign` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`voucher_id`);

--
-- Constraints for table `variant_attribute_values`
--
ALTER TABLE `variant_attribute_values`
  ADD CONSTRAINT `variant_attribute_values_value_id_foreign` FOREIGN KEY (`value_id`) REFERENCES `attribute_values` (`value_id`),
  ADD CONSTRAINT `variant_attribute_values_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE CASCADE;

--
-- Constraints for table `wallets`
--
ALTER TABLE `wallets`
  ADD CONSTRAINT `wallets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD CONSTRAINT `wallet_transactions_return_id_foreign` FOREIGN KEY (`return_id`) REFERENCES `return_requests` (`return_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `wallet_transactions_wallet_id_foreign` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`wallet_id`) ON DELETE CASCADE;

--
-- Constraints for table `withdraw_requests`
--
ALTER TABLE `withdraw_requests`
  ADD CONSTRAINT `withdraw_requests_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `wallet_transactions` (`transaction_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `withdraw_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `withdraw_requests_wallet_id_foreign` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`wallet_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
