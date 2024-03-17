-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 14, 2024 at 04:03 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `paladin_spells`
--

-- --------------------------------------------------------

--
-- Table structure for table `spells`
--

CREATE TABLE `spells` (
  `index` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `level` tinyint(9) NOT NULL,
  `school` varchar(255) NOT NULL,
  `casting_time` varchar(255) NOT NULL,
  `range` varchar(255) NOT NULL,
  `verbal` tinyint(1) DEFAULT NULL,
  `somatic` tinyint(1) DEFAULT NULL,
  `material` varchar(255) DEFAULT NULL,
  `duration` varchar(255) NOT NULL,
  `concentration` tinyint(1) NOT NULL,
  `ritual` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `spells`
--

INSERT INTO `spells` (`index`, `name`, `level`, `school`, `casting_time`, `range`, `verbal`, `somatic`, `material`, `duration`, `concentration`, `ritual`) VALUES
('bless', 'Bless', 1, 'Enchantment', '1 action', '30 feet', 1, 1, 'A sprinkling of holy water.', 'Up to 1 minute', 1, 0),
('command', 'Command', 1, 'Enchantment', '1 action', '60 feet', 1, 0, '', '1 round', 0, 0),
('cure-wounds', 'Cure Wounds', 1, 'Evocation', '1 action', 'Touch', 1, 1, '', 'Instantaneous', 0, 0),
('detect-evil-and-good', 'Detect Evil and Good', 1, 'Divination', '1 action', 'Self', 1, 1, '', 'Up to 10 minutes', 1, 0),
('detect-magic', 'Detect Magic', 1, 'Divination', '1 action', 'Self', 1, 1, '', 'Up to 10 minutes', 1, 1),
('divine-favor', 'Divine Favor', 1, 'Evocation', '1 bonus action', 'Self', 1, 1, '', 'Up to 1 minute', 1, 0),
('heroism', 'Heroism', 1, 'Enchantment', '1 action', 'Touch', 1, 1, '', 'Up to 1 minute', 1, 0),
('protection-from-evil-and-good', 'Protection from Evil and Good', 1, 'Abjuration', '1 action', 'Touch', 1, 1, 'Holy water or powdered silver and iron, which the spell consumes.', 'Up to 10 minutes', 1, 0),
('purify-food-and-drink', 'Purify Food and Drink', 1, 'Transmutation', '1 action', '10 feet', 1, 1, '', 'Instantaneous', 0, 1),
('shield-of-faith', 'Shield of Faith', 1, 'Abjuration', '1 bonus action', '60 feet', 1, 1, 'A small parchment with a bit of holy text written on it.', 'Up to 10 minutes', 1, 0),
('detect-poison-and-disease', 'Detect Poison and Disease', 1, 'Divination', '1 action', 'Self', 1, 1, 'A yew leaf.', 'Up to 10 minutes', 1, 1),
('aid', 'Aid', 2, 'Abjuration', '1 action', '30 feet', 1, 1, 'A tiny strip of white cloth.', '8 hours', 0, 0),
('branding-smite', 'Branding Smite', 2, 'Evocation', '1 bonus action', 'Self', 1, 0, '', 'Up to 1 minute', 1, 0),
('locate-object', 'Locate Object', 2, 'Divination', '1 action', 'Self', 1, 1, 'A forked twig.', 'Up to 10 minutes', 1, 0),
('find-steed', 'Find Steed', 2, 'Conjuration', '10 minutes', '30 feet', 1, 1, '', 'Instantaneous', 0, 0),
('lesser-restoration', 'Lesser Restoration', 2, 'Abjuration', '1 action', 'Touch', 1, 1, '', 'Instantaneous', 0, 0),
('magic-weapon', 'Magic Weapon', 2, 'Transmutation', '1 bonus action', 'Touch', 1, 1, '', 'Up to 1 hour', 1, 0),
('protection-from-poison', 'Protection from Poison', 2, 'Abjuration', '1 action', 'Touch', 1, 1, '', '1 hour', 0, 0),
('zone-of-truth', 'Zone of Truth', 2, 'Enchantment', '1 action', '60 feet', 1, 1, '', '10 minutes', 0, 0),
('daylight', 'Daylight', 3, 'Evocation', '1 action', '60 feet', 1, 1, '', '1 hour', 0, 0),
('dispel-magic', 'Dispel Magic', 3, 'Abjuration', '1 action', '120 feet', 1, 1, '', 'Instantaneous', 0, 0),
('create-food-and-water', 'Create Food and Water', 3, 'Conjuration', '1 action', '30 feet', 1, 1, '', 'Instantaneous', 0, 0),
('magic-circle', 'Magic Circle', 3, 'Abjuration', '1 minute', '10 feet', 1, 1, 'Holy water or powdered silver and iron worth at least 100 gp, which the spell consumes.', '1 hour', 0, 0),
('remove-curse', 'Remove Curse', 3, 'Abjuration', '1 action', 'Touch', 1, 1, '', 'Instantaneous', 0, 0),
('revivify', 'Revivify', 3, 'Conjuration', '1 action', 'Touch', 1, 1, 'Diamonds worth 300gp, which the spell consumes.', 'Instantaneous', 0, 0),
('banishment', 'Banishment', 4, 'Abjuration', '1 action', '60 feet', 1, 1, 'An item distasteful to the target.', 'Up to 1 minute', 1, 0),
('death-ward', 'Death Ward', 4, 'Abjuration', '1 action', 'Touch', 1, 1, '', '8 hours', 0, 0),
('locate-creature', 'Locate Creature', 4, 'Divination', '1 action', 'Self', 1, 1, 'A bit of fur from a bloodhound.', 'Up to 1 hour', 1, 0),
('dispel-evil-and-good', 'Dispel Evil and Good', 5, 'Abjuration', '1 action', 'Self', 1, 1, 'Holy water or powdered silver and iron.', 'Up to 1 minute', 1, 0),
('raise-dead', 'Raise Dead', 5, 'Necromancy', '1 hour', 'Touch', 1, 1, 'A diamond worth at least 500gp, which the spell consumes.', 'Instantaneous', 0, 0),
('geas', 'Geas', 5, 'Enchantment', '1 minute', '60 feet', 1, 0, '', '30 days', 0, 0);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
