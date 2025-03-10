import React from 'react';
import Chat from './components/Chat';
import { GeminiProvider } from './context/GeminiContext';

function App() {
  return (
    <GeminiProvider>
      <div className="flex flex-col h-screen bg-bg-primary text-text-primary">
        <header className="bg-bg-secondary border-b border-bg-tertiary px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-2 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.928 11.607c-.202-.488-.635-.775-1.157-.766h-.87l-5.708-1.159-2.571-5.313c-.212-.451-.67-.737-1.176-.737s-.964.286-1.176.737L6.7 9.682.992 10.84h-.87c-.523-.008-.957.279-1.158.767-.201.488-.079 1.032.322 1.424l4.12 4.129-1.082 6.455c-.078.523.124 1.028.544 1.321.213.148.464.222.714.222.214 0 .429-.051.62-.153L10 21.088l5.799 3.112c.19.102.405.153.619.153.251 0 .502-.74.714-.222.42-.293.622-.798.544-1.321l-1.082-6.455 4.12-4.129c.401-.392.523-.936.322-1.424z" fill="currentColor" />
              </svg>
            </div>
            <h1 className="text-lg font-bold">AI Chat</h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* Settings button */}
            <button className="p-1.5 hover:bg-bg-tertiary rounded-full">
              <svg className="w-5 h-5 text-text-secondary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor" />
              </svg>
            </button>

            {/* Share button */}
            <button className="p-1.5 hover:bg-bg-tertiary rounded-full">
              <svg className="w-5 h-5 text-text-secondary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z" fill="currentColor" />
              </svg>
            </button>

            {/* Help button */}
            <button className="p-1.5 hover:bg-bg-tertiary rounded-full">
              <svg className="w-5 h-5 text-text-secondary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2zm0-10h2v8h-2z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <Chat />
        </main>
      </div>
    </GeminiProvider>
  );
}

export default App; 