import React, { Component, ErrorInfo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink as RouterNavLink } from 'react-router-dom';
import { ThemeProvider } from './shared/context/ThemeContext';
import { GeminiServiceProvider } from './features/gemini/context/GeminiServiceContext';
import { ChatProvider } from './features/chat/context/ChatContext';
import { AppLayout } from './features/chat';
import FormatExampleMessage from './features/chat/components/FormatExampleMessage';
import DependencyTest from './features/chat/components/DependencyTest';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './shared/components';

// Main layout component with header, sidebar and content area
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {children}
      </div>
    </div>
  );
};

// Main header component
const MainHeader = () => {
  // We're using useTheme but not actually using the variables yet
  // const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="bg-[#0E0E0F] border-b border-[#222] py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <svg width="24" height="24" viewBox="0 0 36 36" fill="none" stroke="white" strokeWidth="2">
            <circle cx="18" cy="18" r="16" fill="transparent"/>
            <path d="M18 10L28 24H8L18 10Z" fill="transparent"/>
          </svg>
          <span className="text-white text-lg font-medium ml-2">Gemi</span>
        </div>
        
        <nav className="flex space-x-4">
          <NavLink to="/">Chat</NavLink>
          <NavLink to="/format-examples">Format Examples</NavLink>
          <NavLink to="/dependency-test">Dependency Test</NavLink>
        </nav>
        
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

// Error boundary component
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1d1e20] rounded-lg shadow-lg p-6 border border-[#333]">
            <h2 className="text-xl font-bold mb-4 text-red-500">Something went wrong</h2>
            <p className="mb-4">The application encountered an error. Please try refreshing the page.</p>
            {this.state.error && (
              <div className="bg-[#252525] p-3 rounded text-sm font-mono text-gray-300 overflow-auto">
                {this.state.error.toString()}
              </div>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// App component
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GeminiServiceProvider>
          <ChatProvider>
            <Router>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <MainLayout>
                      <PageTransition>
                        <AppLayout />
                      </PageTransition>
                    </MainLayout>
                  } 
                />
                <Route 
                  path="/format-examples" 
                  element={
                    <>
                      <MainHeader />
                      <MainLayout>
                        <PageTransition>
                          <div className="w-full h-full overflow-auto bg-black p-6">
                            <FormatExampleMessage />
                          </div>
                        </PageTransition>
                      </MainLayout>
                    </>
                  } 
                />
                <Route 
                  path="/dependency-test" 
                  element={
                    <>
                      <MainHeader />
                      <MainLayout>
                        <PageTransition>
                          <div className="w-full h-full overflow-auto bg-black p-6">
                            <DependencyTest />
                          </div>
                        </PageTransition>
                      </MainLayout>
                    </>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </ChatProvider>
        </GeminiServiceProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// NavLink component
const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <RouterNavLink
    to={to}
    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
  >
    {children}
  </RouterNavLink>
);

// Page transition component
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <AnimatePresence mode="wait">
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

export default App; 