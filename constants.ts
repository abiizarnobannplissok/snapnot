import { NoteColor } from './types';

export const COLORS: Record<NoteColor, { bg: string; border: string; label: string; hex: string }> = {
  yellow: { bg: 'bg-[#D4FF00]', border: 'border-[#b8e600]', label: 'Neon', hex: '#D4FF00' },
  blue: { bg: 'bg-[#8FB4FF]', border: 'border-[#7aa0e5]', label: 'Ocean', hex: '#8FB4FF' },
  white: { bg: 'bg-white', border: 'border-gray-200', label: 'Clean', hex: '#FFFFFF' },
  purple: { bg: 'bg-[#E0BBE4]', border: 'border-[#cca3d1]', label: 'Dream', hex: '#E0BBE4' },
  green: { bg: 'bg-[#95E1D3]', border: 'border-[#81cabb]', label: 'Fresh', hex: '#95E1D3' },
  pink: { bg: 'bg-[#FFB3D9]', border: 'border-[#ff9ac8]', label: 'Sweet', hex: '#FFB3D9' },
  orange: { bg: 'bg-[#FFD1A9]', border: 'border-[#ffba87]', label: 'Warm', hex: '#FFD1A9' },
  mint: { bg: 'bg-[#B4F8C8]', border: 'border-[#9de6b3]', label: 'Cool', hex: '#B4F8C8' },
  lavender: { bg: 'bg-[#C5B4E3]', border: 'border-[#b19dd4]', label: 'Calm', hex: '#C5B4E3' },
  coral: { bg: 'bg-[#FFC3A0]', border: 'border-[#ffad7d]', label: 'Sunset', hex: '#FFC3A0' },
};

export const COLOR_OPTIONS: NoteColor[] = ['yellow', 'blue', 'green', 'purple', 'white', 'pink', 'orange', 'mint', 'lavender', 'coral'];
