import React, { lazy, Suspense, memo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Lazy load pages dengan prefetch untuk mengurangi initial bundle size
const DocumentTranslate = lazy(() => import(/* webpackChunkName: "document" */ './pages/DocumentTranslate'));
const TextTranslate = lazy(() => import(/* webpackChunkName: "text" */ './pages/TextTranslate'));

function App() {
  return (
    <ErrorBoundary>
      <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-600 font-medium">Memuat halaman...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<DocumentTranslate />} />
            <Route path="/text" element={<TextTranslate />} />
          </Routes>
        </Suspense>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 mt-16">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-sm text-gray-600">
              <p className="font-medium">© 2025 Translate Hub • Powered by DeepL API</p>
              <p className="mt-2 text-xs text-gray-500">100% Client-Side • Privasi Terjaga • Format Tetap Akurat</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
