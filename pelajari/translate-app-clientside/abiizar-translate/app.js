// Abiizar Translate - Main Application JavaScript
// DeepL API Integration

// Configuration
const DEEPL_API_URL = 'https://api-free.deepl.com/v2';
const MAX_CHARS = 5000;
const STORAGE_KEY = 'abiizar_translate_api_key';

// Language Database with Flags
const LANGUAGES = [
    { code: 'AR', name: 'Arabic', flag: '🇸🇦' },
    { code: 'BG', name: 'Bulgarian', flag: '🇧🇬' },
    { code: 'CS', name: 'Czech', flag: '🇨🇿' },
    { code: 'DA', name: 'Danish', flag: '🇩🇰' },
    { code: 'DE', name: 'German', flag: '🇩🇪' },
    { code: 'EL', name: 'Greek', flag: '🇬🇷' },
    { code: 'EN-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'EN-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'ET', name: 'Estonian', flag: '🇪🇪' },
    { code: 'FI', name: 'Finnish', flag: '🇫🇮' },
    { code: 'FR', name: 'French', flag: '🇫🇷' },
    { code: 'HU', name: 'Hungarian', flag: '🇭🇺' },
    { code: 'ID', name: 'Indonesian', flag: '🇮🇩' },
    { code: 'IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'JA', name: 'Japanese', flag: '🇯🇵' },
    { code: 'KO', name: 'Korean', flag: '🇰🇷' },
    { code: 'LT', name: 'Lithuanian', flag: '🇱🇹' },
    { code: 'LV', name: 'Latvian', flag: '🇱🇻' },
    { code: 'NB', name: 'Norwegian', flag: '🇳🇴' },
    { code: 'NL', name: 'Dutch', flag: '🇳🇱' },
    { code: 'PL', name: 'Polish', flag: '🇵🇱' },
    { code: 'PT-BR', name: 'Portuguese (BR)', flag: '🇧🇷' },
    { code: 'PT-PT', name: 'Portuguese (PT)', flag: '🇵🇹' },
    { code: 'RO', name: 'Romanian', flag: '🇷🇴' },
    { code: 'RU', name: 'Russian', flag: '🇷🇺' },
    { code: 'SK', name: 'Slovak', flag: '🇸🇰' },
    { code: 'SL', name: 'Slovenian', flag: '🇸🇮' },
    { code: 'SV', name: 'Swedish', flag: '🇸🇪' },
    { code: 'TR', name: 'Turkish', flag: '🇹🇷' },
    { code: 'UK', name: 'Ukrainian', flag: '🇺🇦' },
    { code: 'ZH', name: 'Chinese', flag: '🇨🇳' }
];

// App State
let appState = {
    apiKey: localStorage.getItem(STORAGE_KEY) || '',
    sourceLang: 'ID',
    targetLang: 'EN-US',
    sourceText: '',
    translatedText: '',
    isTranslating: false,
    modalType: null // 'source' | 'target' | null
};

// DOM Elements
const elements = {
    // Language buttons
    sourceLangBtn: document.getElementById('sourceLangBtn'),
    targetLangBtn: document.getElementById('targetLangBtn'),
    sourceLangFlag: document.getElementById('sourceLangFlag'),
    sourceLangName: document.getElementById('sourceLangName'),
    sourceLangCode: document.getElementById('sourceLangCode'),
    targetLangFlag: document.getElementById('targetLangFlag'),
    targetLangName: document.getElementById('targetLangName'),
    targetLangCode: document.getElementById('targetLangCode'),
    swapBtn: document.getElementById('swapBtn'),
    
    // Text areas
    sourceText: document.getElementById('sourceText'),
    targetText: document.getElementById('targetText'),
    charCount: document.getElementById('charCount'),
    translatedCharCount: document.getElementById('translatedCharCount'),
    
    // Buttons
    translateBtn: document.getElementById('translateBtn'),
    clearBtn: document.getElementById('clearBtn'),
    copyBtn: document.getElementById('copyBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    
    // Modals
    langModal: document.getElementById('langModal'),
    settingsModal: document.getElementById('settingsModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    modalTitle: document.getElementById('modalTitle'),
    languageList: document.getElementById('languageList'),
    
    // Settings
    apiKeyInput: document.getElementById('apiKeyInput'),
    saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
    
    // Loading & Toast
    loadingOverlay: document.getElementById('loadingOverlay'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    
    // Navigation
    navTabs: document.querySelectorAll('.nav-tab')
};

// Initialize App
function init() {
    updateLanguageDisplay();
    setupEventListeners();
    checkApiKey();
    
    // Show welcome message if no API key
    if (!appState.apiKey) {
        setTimeout(() => {
            showToast('⚠️ Please set your DeepL API key in settings');
        }, 1000);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Language selection
    elements.sourceLangBtn.addEventListener('click', () => openLanguageModal('source'));
    elements.targetLangBtn.addEventListener('click', () => openLanguageModal('target'));
    elements.swapBtn.addEventListener('click', swapLanguages);
    
    // Translation
    elements.translateBtn.addEventListener('click', translateText);
    elements.sourceText.addEventListener('input', handleTextInput);
    
    // Buttons
    elements.clearBtn.addEventListener('click', clearText);
    elements.copyBtn.addEventListener('click', copyTranslation);
    elements.settingsBtn.addEventListener('click', openSettings);
    
    // Modals
    elements.closeModalBtn.addEventListener('click', closeLanguageModal);
    elements.closeSettingsBtn.addEventListener('click', closeSettings);
    elements.langModal.addEventListener('click', (e) => {
        if (e.target === elements.langModal) closeLanguageModal();
    });
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) closeSettings();
    });
    
    // Settings
    elements.saveApiKeyBtn.addEventListener('click', saveApiKey);
    elements.apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveApiKey();
    });
    
    // Navigation tabs
    elements.navTabs.forEach(tab => {
        tab.addEventListener('click', () => handleTabSwitch(tab));
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Check API Key
function checkApiKey() {
    if (appState.apiKey) {
        elements.apiKeyInput.value = appState.apiKey;
    }
}

// Update Language Display
function updateLanguageDisplay() {
    const sourceLang = LANGUAGES.find(l => l.code === appState.sourceLang);
    const targetLang = LANGUAGES.find(l => l.code === appState.targetLang);
    
    if (sourceLang) {
        elements.sourceLangFlag.textContent = sourceLang.flag;
        elements.sourceLangName.textContent = sourceLang.name;
        elements.sourceLangCode.textContent = `(${sourceLang.name})`;
    }
    
    if (targetLang) {
        elements.targetLangFlag.textContent = targetLang.flag;
        elements.targetLangName.textContent = targetLang.name;
        elements.targetLangCode.textContent = `(${targetLang.name})`;
    }
}

// Open Language Modal
function openLanguageModal(type) {
    appState.modalType = type;
    elements.modalTitle.textContent = type === 'source' ? 'Select Source Language' : 'Select Target Language';
    
    // Populate language list
    elements.languageList.innerHTML = '';
    LANGUAGES.forEach(lang => {
        const langItem = document.createElement('button');
        langItem.className = 'language-item w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-all text-left';
        langItem.innerHTML = `
            <span class="text-2xl">${lang.flag}</span>
            <span class="font-semibold text-gray-800">${lang.name}</span>
            ${lang.code === (type === 'source' ? appState.sourceLang : appState.targetLang) ? 
                '<span class="ml-auto text-blue-500">✓</span>' : ''}
        `;
        langItem.addEventListener('click', () => selectLanguage(lang.code));
        elements.languageList.appendChild(langItem);
    });
    
    elements.langModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
}

// Close Language Modal
function closeLanguageModal() {
    elements.langModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    appState.modalType = null;
}

// Select Language
function selectLanguage(code) {
    if (appState.modalType === 'source') {
        if (code === appState.targetLang) {
            showToast('⚠️ Source and target languages cannot be the same');
            return;
        }
        appState.sourceLang = code;
    } else {
        if (code === appState.sourceLang) {
            showToast('⚠️ Source and target languages cannot be the same');
            return;
        }
        appState.targetLang = code;
    }
    
    updateLanguageDisplay();
    closeLanguageModal();
    
    const lang = LANGUAGES.find(l => l.code === code);
    showToast(`✓ Language set to ${lang.name}`);
}

// Swap Languages
function swapLanguages() {
    const tempLang = appState.sourceLang;
    appState.sourceLang = appState.targetLang;
    appState.targetLang = tempLang;
    
    const tempText = appState.sourceText;
    appState.sourceText = appState.translatedText;
    appState.translatedText = tempText;
    
    elements.sourceText.value = appState.sourceText;
    if (appState.translatedText) {
        elements.targetText.innerHTML = `<p class="text-gray-800">${appState.translatedText}</p>`;
        elements.translatedCharCount.textContent = `${appState.translatedText.length} characters`;
    } else {
        elements.targetText.innerHTML = '<p class="text-gray-400 text-center mt-12">Translation will appear here...</p>';
        elements.translatedCharCount.textContent = '';
    }
    
    updateLanguageDisplay();
    updateCharCount();
    showToast('🔄 Languages swapped');
}

// Handle Text Input
function handleTextInput(e) {
    appState.sourceText = e.target.value;
    updateCharCount();
}

// Update Character Count
function updateCharCount() {
    const count = appState.sourceText.length;
    elements.charCount.textContent = `${count} / ${MAX_CHARS}`;
    
    if (count > MAX_CHARS) {
        elements.charCount.style.color = '#ef4444';
        elements.translateBtn.disabled = true;
    } else {
        elements.charCount.style.color = '#6b7280';
        elements.translateBtn.disabled = false;
    }
}

// Clear Text
function clearText() {
    appState.sourceText = '';
    appState.translatedText = '';
    elements.sourceText.value = '';
    elements.targetText.innerHTML = '<p class="text-gray-400 text-center mt-12">Translation will appear here...</p>';
    elements.translatedCharCount.textContent = '';
    updateCharCount();
    showToast('🗑️ Text cleared');
}

// Translate Text (DeepL API Integration)
async function translateText() {
    // Validation
    if (!appState.apiKey) {
        showToast('⚠️ Please set your API key first');
        openSettings();
        return;
    }
    
    if (!appState.sourceText.trim()) {
        showToast('⚠️ Please enter text to translate');
        return;
    }
    
    if (appState.sourceText.length > MAX_CHARS) {
        showToast(`⚠️ Text exceeds ${MAX_CHARS} characters limit`);
        return;
    }
    
    // Start translation
    appState.isTranslating = true;
    elements.loadingOverlay.classList.remove('hidden');
    elements.translateBtn.disabled = true;
    
    try {
        const response = await fetch(`${DEEPL_API_URL}/translate`, {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${appState.apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                text: appState.sourceText,
                source_lang: appState.sourceLang,
                target_lang: appState.targetLang
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.translations && data.translations.length > 0) {
            appState.translatedText = data.translations[0].text;
            displayTranslation();
            showToast('✅ Translation completed!');
        } else {
            throw new Error('No translation received');
        }
        
    } catch (error) {
        console.error('Translation error:', error);
        handleTranslationError(error);
    } finally {
        appState.isTranslating = false;
        elements.loadingOverlay.classList.add('hidden');
        elements.translateBtn.disabled = false;
    }
}

// Display Translation
function displayTranslation() {
    const formattedText = appState.translatedText
        .replace(/\n/g, '<br>')
        .replace(/  /g, '&nbsp;&nbsp;');
    
    elements.targetText.innerHTML = `<p class="text-gray-800 leading-relaxed">${formattedText}</p>`;
    elements.translatedCharCount.textContent = `${appState.translatedText.length} characters`;
}

// Handle Translation Error
function handleTranslationError(error) {
    let message = '❌ Translation failed. Please try again.';
    
    if (error.message.includes('403')) {
        message = '🔑 Invalid API key. Please check your settings.';
    } else if (error.message.includes('456')) {
        message = '📊 API quota exceeded. Check your usage at deepl.com';
    } else if (error.message.includes('429')) {
        message = '⏱️ Too many requests. Please wait a moment.';
    } else if (error.message.includes('400')) {
        message = '⚠️ Invalid request. Check language settings.';
    }
    
    showToast(message, 5000);
}

// Copy Translation
function copyTranslation() {
    if (!appState.translatedText) {
        showToast('⚠️ No translation to copy');
        return;
    }
    
    navigator.clipboard.writeText(appState.translatedText)
        .then(() => {
            showToast('📋 Translation copied to clipboard!');
        })
        .catch(() => {
            showToast('❌ Failed to copy text');
        });
}

// Open Settings
function openSettings() {
    elements.apiKeyInput.value = appState.apiKey;
    elements.settingsModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    setTimeout(() => elements.apiKeyInput.focus(), 100);
}

// Close Settings
function closeSettings() {
    elements.settingsModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
}

// Save API Key
function saveApiKey() {
    const apiKey = elements.apiKeyInput.value.trim();
    
    if (!apiKey) {
        showToast('⚠️ Please enter an API key');
        return;
    }
    
    // Basic validation (DeepL keys are usually UUID format)
    if (apiKey.length < 20) {
        showToast('⚠️ API key seems invalid');
        return;
    }
    
    appState.apiKey = apiKey;
    localStorage.setItem(STORAGE_KEY, apiKey);
    
    closeSettings();
    showToast('✅ API key saved successfully!');
}

// Handle Tab Switch
function handleTabSwitch(clickedTab) {
    // Remove active class from all tabs
    elements.navTabs.forEach(tab => tab.classList.remove('active'));
    
    // Add active class to clicked tab
    clickedTab.classList.add('active');
    
    const tabName = clickedTab.dataset.tab;
    
    if (tabName === 'profile') {
        showToast('👤 Profile feature coming soon!');
        // Switch back to text tab
        setTimeout(() => {
            elements.navTabs[0].classList.add('active');
            clickedTab.classList.remove('active');
        }, 500);
    }
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter: Translate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        translateText();
    }
    
    // Ctrl/Cmd + K: Open settings
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSettings();
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
        if (!elements.langModal.classList.contains('hidden')) {
            closeLanguageModal();
        }
        if (!elements.settingsModal.classList.contains('hidden')) {
            closeSettings();
        }
    }
}

// Show Toast Notification
function showToast(message, duration = 3000) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.remove('hidden');
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
        setTimeout(() => {
            elements.toast.classList.add('hidden');
        }, 300);
    }, duration);
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Service Worker for PWA (optional future enhancement)
if ('serviceWorker' in navigator) {
    // Uncomment when ready to deploy as PWA
    // navigator.serviceWorker.register('/sw.js');
}
