-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 26, 2024 at 05:22 PM
-- Server version: 8.2.0
-- PHP Version: 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fortai`
--

-- --------------------------------------------------------

--
-- Table structure for table `stripe_products`
--

DROP TABLE IF EXISTS `stripe_products`;
CREATE TABLE IF NOT EXISTS `stripe_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `product_link` text NOT NULL,
  `credits` int NOT NULL,
  `price` decimal(13,2) NOT NULL,
  `stripe_product_id` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `stripe_products`
--

INSERT INTO `stripe_products` (`id`, `name`, `product_link`, `credits`, `price`, `stripe_product_id`) VALUES
(1, '25 Credits', 'https://dashboard.stripe.com/test/products/prod_R6OoBji2hgUnbE', 25, 100.00, 'prod_R6OoBji2hgUnbE'),
(2, '50 Credits', 'https://dashboard.stripe.com/test/products/prod_R6OpJwoSLSGvec', 50, 180.00, 'prod_R6OpJwoSLSGvec'),
(3, '100 Credits', 'https://dashboard.stripe.com/test/products/prod_R6OqbosyOEsWfF', 100, 350.00, 'prod_R6OqbosyOEsWfF');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
