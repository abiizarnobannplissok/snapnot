// DeepL Supported Languages with Flags
export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const SOURCE_LANGUAGES: Language[] = [
  { code: 'auto', name: 'Auto-detect', flag: '🌐' },
  { code: 'EN', name: 'English', flag: '🇬🇧' },
  { code: 'ID', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'BG', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'CS', name: 'Czech', flag: '🇨🇿' },
  { code: 'DA', name: 'Danish', flag: '🇩🇰' },
  { code: 'DE', name: 'German', flag: '🇩🇪' },
  { code: 'EL', name: 'Greek', flag: '🇬🇷' },
  { code: 'ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ET', name: 'Estonian', flag: '🇪🇪' },
  { code: 'FI', name: 'Finnish', flag: '🇫🇮' },
  { code: 'FR', name: 'French', flag: '🇫🇷' },
  { code: 'HU', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'JA', name: 'Japanese', flag: '🇯🇵' },
  { code: 'KO', name: 'Korean', flag: '🇰🇷' },
  { code: 'LT', name: 'Lithuanian', flag: '🇱🇹' },
  { code: 'LV', name: 'Latvian', flag: '🇱🇻' },
  { code: 'NB', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'NL', name: 'Dutch', flag: '🇳🇱' },
  { code: 'PL', name: 'Polish', flag: '🇵🇱' },
  { code: 'PT', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'RO', name: 'Romanian', flag: '🇷🇴' },
  { code: 'RU', name: 'Russian', flag: '🇷🇺' },
  { code: 'SK', name: 'Slovak', flag: '🇸🇰' },
  { code: 'SL', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'SV', name: 'Swedish', flag: '🇸🇪' },
  { code: 'TR', name: 'Turkish', flag: '🇹🇷' },
  { code: 'UK', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'ZH', name: 'Chinese', flag: '🇨🇳' },
];

export const TARGET_LANGUAGES: Language[] = [
  { code: 'EN-GB', name: 'English (British)', flag: '🇬🇧' },
  { code: 'EN-US', name: 'English (American)', flag: '🇺🇸' },
  { code: 'ID', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'BG', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'CS', name: 'Czech', flag: '🇨🇿' },
  { code: 'DA', name: 'Danish', flag: '🇩🇰' },
  { code: 'DE', name: 'German', flag: '🇩🇪' },
  { code: 'EL', name: 'Greek', flag: '🇬🇷' },
  { code: 'ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ET', name: 'Estonian', flag: '🇪🇪' },
  { code: 'FI', name: 'Finnish', flag: '🇫🇮' },
  { code: 'FR', name: 'French', flag: '🇫🇷' },
  { code: 'HU', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'JA', name: 'Japanese', flag: '🇯🇵' },
  { code: 'KO', name: 'Korean', flag: '🇰🇷' },
  { code: 'LT', name: 'Lithuanian', flag: '🇱🇹' },
  { code: 'LV', name: 'Latvian', flag: '🇱🇻' },
  { code: 'NB', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'NL', name: 'Dutch', flag: '🇳🇱' },
  { code: 'PL', name: 'Polish', flag: '🇵🇱' },
  { code: 'PT-BR', name: 'Portuguese (Brazilian)', flag: '🇧🇷' },
  { code: 'PT-PT', name: 'Portuguese (European)', flag: '🇵🇹' },
  { code: 'RO', name: 'Romanian', flag: '🇷🇴' },
  { code: 'RU', name: 'Russian', flag: '🇷🇺' },
  { code: 'SK', name: 'Slovak', flag: '🇸🇰' },
  { code: 'SL', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'SV', name: 'Swedish', flag: '🇸🇪' },
  { code: 'TR', name: 'Turkish', flag: '🇹🇷' },
  { code: 'UK', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'ZH', name: 'Chinese', flag: '🇨🇳' },
];

export const findLanguageByCode = (code: string, isTarget: boolean = false): Language | undefined => {
  const languages = isTarget ? TARGET_LANGUAGES : SOURCE_LANGUAGES;
  return languages.find(lang => lang.code === code);
};
