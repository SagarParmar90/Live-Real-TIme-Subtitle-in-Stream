
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const createSession = () => {
    const sessionId = Math.random().toString(36).substring(2, 10);
    navigate(`/control/${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F1F5F9] flex flex-col items-center justify-center p-4">
      <header className="absolute top-0 left-0 w-full p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">SubAura</h1>
        <nav className="flex gap-4">
          <a href="#" className="hover:text-[#6366F1]">About</a>
          <a href="#" className="hover:text-[#6366F1]">Docs</a>
        </nav>
      </header>
      
      <main className="text-center">
        <h2 className="text-5xl md:text-7xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          Real-time Subtitles
        </h2>
        <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Generate professional, animated subtitles for your live streams. Zero setup, OBS ready, and completely free.
        </p>
        <button
          onClick={createSession}
          className="bg-[#6366F1] hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg shadow-indigo-500/50"
        >
          Create Free Session
        </button>
      </main>
      
      <section className="mt-20 w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Free Forever</h3>
            <p className="text-slate-400">No hidden costs, no subscriptions. High-quality subtitling for everyone.</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Multi-Language</h3>
            <p className="text-slate-400">Supports English, Hindi, and Gujarati with natural code-mixing.</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">OBS Ready</h3>
            <p className="text-slate-400">Just copy the link and add it as a Browser Source in OBS. It's that simple.</p>
          </div>
        </div>
      </section>

      <footer className="absolute bottom-0 w-full p-4 text-center text-slate-500">
        <p>Built with Gemini AI | <a href="#" className="hover:text-indigo-400">GitHub</a></p>
      </footer>
    </div>
  );
};

export default HomePage;
