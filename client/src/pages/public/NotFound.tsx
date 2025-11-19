import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import './NotFound.css';

const NotFound: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const darkHumorMessages = [
    "This page disappeared faster than your clothes when someone says they live alone.",
    "404: Even this link has more commitment issues than your situationship.",
    "This page didn't get lost. It just saw you coming and decided to stay under the covers.",
    "It's not missing. It's hiding after a night full of questionable decisions.",
    "This page is like you on a date — looks fine at first, then suddenly refuses to show up.",
    "404: This link folded faster than you do when someone whispers 'come closer.'",
    "This page didn't break. It just needed some 'me time' after all those late-night clicks.",
    "Missing page? More like it sneaked out for a 'quick break' and never came back.",
    "This page is giving the same energy as your ex: promising, tempting, and then absolutely nothing.",
    "404: The page left to explore positions — I mean locations — elsewhere.",
    "This page said it needed space. Probably the kind you don't use safely.",
    "It's gone. Probably with someone who actually knows how to handle a URL.",
    "404: This link has more red flags than your dating history.",
    "This page isn't lost. It's busy entertaining someone with better bandwidth.",
    "It ran off the moment things got serious. Sounds familiar, right?",
    "404: Even this page isn't ready for that kind of interaction.",
    "This page saw your search history and noped out immediately.",
    "If you think this is empty, you should see your love life.",
    "This page has the same energy as a risky text you shouldn't have sent.",
    "Maybe this page will come back… unlike the ones who left your messages on seen."
  ];

  const randomMessage = darkHumorMessages[messageIndex];

  const handleNextMessage = () => {
    setMessageIndex((prev) => (prev + 1) % darkHumorMessages.length);
  };

  return (
    <div className="notfound-container">
      {/* Animated Background Elements */}
      <div className="notfound-background">
        <div className="blob blob-primary"></div>
        <div className="blob blob-destructive"></div>
        <div className="blob blob-accent"></div>
      </div>

      {/* Floating Emoji Particles */}
      <div className="emoji emoji-skull">💀</div>
      <div className="emoji emoji-fire">🔥</div>
      <div className="emoji emoji-coffin">⚰️</div>
      <div className="emoji emoji-ghost">👻</div>

      {/* Content */}
      <div className="notfound-content">
        {/* Large 404 Text with Glow */}
        <div className="notfound-heading fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="text-404-container">
            <div className="glow-effect"></div>
            <h1 className="text-404">404</h1>
            <div className="shimmer-effect"></div>
          </div>
        </div>

        {/* Main Message */}
        <div className="notfound-title fade-in-up" style={{ animationDelay: '0.35s' }}>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Error: Page Not <span className="text-destructive">Existing</span>
          </h2>
        </div>

        {/* Dark Humor Message with Animation */}
        <div className="notfound-message fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="message-content">
            <p className="text-xl md:text-2xl text-muted-foreground italic max-w-2xl mx-auto font-light leading-relaxed">
              "{randomMessage}"
            </p>
          </div>

          {/* Next Message Button */}
          <button
            onClick={handleNextMessage}
            className="mt-4 text-sm text-primary hover:text-accent transition-colors underline cursor-pointer hover:scale-105 active:scale-95 inline-block"
          >
            Click for another existential crisis →
          </button>
        </div>

        {/* Error Details Card */}
        <div className="notfound-card fade-in-up" style={{ animationDelay: '0.65s' }}>
          <div className="card-content fade-in" style={{ animationDelay: '1.15s' }}>
            <div className="error-detail">
              <span className="error-dot error-dot-destructive">●</span>
              <div className="text-left">
                <p className="text-primary font-bold">Error Code:</p>
                <p className="text-muted-foreground text-sm font-mono">UNIVERSE_404_ENTITY_VOID</p>
              </div>
            </div>
            <div className="error-detail">
              <span className="error-dot error-dot-primary">●</span>
              <div className="text-left">
                <p className="text-primary font-bold">Status:</p>
                <p className="text-muted-foreground text-sm">Permanently deleted from existence</p>
              </div>
            </div>
            <div className="error-detail">
              <span className="error-dot error-dot-accent">●</span>
              <div className="text-left">
                <p className="text-primary font-bold">Recovery Chance:</p>
                <p className="text-muted-foreground text-sm">Less than your chances of winning the lottery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="notfound-buttons fade-in-up" style={{ animationDelay: '0.8s' }}>
          <Link
            to="/"
            className="btn btn-primary"
          >
            <Home size={24} className="animate-bounce-x" />
            <span>Return to Reality</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary"
          >
            <ArrowLeft size={24} />
            Undo This Mistake
          </button>
        </div>

        {/* Sound Toggle */}
        <div className="notfound-sound fade-in-up" style={{ animationDelay: '0.95s' }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
          >
            {soundEnabled ? (
              <Volume2 size={18} />
            ) : (
              <VolumeX size={18} />
            )}
            {soundEnabled ? 'Sound On' : 'Sound Off'}
          </button>
        </div>

        {/* Easter Eggs & Fun Facts */}
        <div className="notfound-facts fade-in-up" style={{ animationDelay: '1.1s' }}>
          <div className="text-muted-foreground text-sm hover:scale-105 transition-transform">
            <p className="mb-2">🎭 Fun Facts About This Page:</p>
            <div className="space-y-1 text-xs text-muted-foreground/70">
              <p>• It has better attendance than most developers</p>
              <p>• It's the only thing that runs faster than our code</p>
              <p>• NASA couldn't find this page with their satellites</p>
            </div>
          </div>
        </div>

        {/* Animated Border */}
        <div className="notfound-border"></div>
      </div>

      {/* Matrix-like falling text effect */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="matrix-text"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${i * 2}s`,
          }}
        >
          {['404', 'ERROR', 'NULL', 'VOID', 'GONE'][i]}
        </div>
      ))}
    </div>
  );
};

export default NotFound;