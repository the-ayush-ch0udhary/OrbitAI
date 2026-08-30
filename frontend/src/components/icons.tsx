import React from 'react';
import { FaUser, FaChartLine, FaSearch, FaMoon, FaSun, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

export const ProfileIcon: React.FC<{ className?: string }> = ({ className }) => (
  <FaUser className={className} />
);

export const AnalysisIcon: React.FC<{ className?: string }> = ({ className }) => (
  <FaChartLine className={className} />
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <FaSearch className={className} />
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <FaMoon className={className} />
);

export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <FaSun className={className} />
);

export const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <FaSignOutAlt className={className} />
);

export const UserCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <FaUserCircle className={className} />
);