import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, RefreshCw, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotFound: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const darkHumorMessages = [
    "This page disappeared faster than your motivation on a Monday morning.",
    "404: Even this link has more commitment issues than your ex.",
    "This page didn't get lost. It just saw you coming and decided to ghost you.",
    "It's not missing. It's just taking a mental health day... permanently.",
    "This page is like your New Year's resolutions — started strong, ended nowhere.",
    "404: This link folded faster than my gym membership.",
    "This page said it needed space. We think it meant outer space.",
    "Missing page? It probably found a better developer.",
    "This page has the same energy as 'we should hang out sometime' — never happening.",
    "404: The page left to find itself. It's been 3 years.",
    "This page isn't lost. It's on a journey of self-discovery.",
    "If you think this is empty, wait till you see my motivation folder.",
    "This page saw your coding skills and ran away screaming.",
    "Maybe this page will come back... unlike my will to debug at 3 AM.",
    "Error 404: Page went out for milk and never returned.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const generateParticles = setInterval(() => {
      const newParticle = {
        id: Date.now(),
        x: Math.random() * window.innerWidth,
        y: -20,
      };
      setParticles(prev => [...prev.slice(-20), newParticle]);
    }, 300);

    return () => clearInterval(generateParticles);
  }, []);

  const handleNextMessage = () => {
    setMessageIndex((prev) => (prev + 1) % darkHumorMessages.length);
  };

  const glitchVariants = {
    normal: { x: 0, filter: 'none' },
    glitch: { 
      x: [-5, 5, -5, 5, 0],
      filter: [
        'hue-rotate(0deg)',
        'hue-rotate(90deg)',
        'hue-rotate(180deg)',
        'hue-rotate(270deg)',
        'hue-rotate(0deg)'
      ],
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-accent/5">
      {/* Animated Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-destructive/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.6, 0.4],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating Particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            initial={{ x: particle.x, y: particle.y, opacity: 0 }}
            animate={{ 
              y: window.innerHeight + 100,
              opacity: [0, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "linear" }}
          />
        ))}
      </AnimatePresence>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        {/* Animated 404 Number */}
        <motion.div
          className="relative mb-8"
          variants={glitchVariants}
          animate={isGlitching ? "glitch" : "normal"}
        >
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 1
            }}
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 blur-3xl bg-primary/30 animate-pulse" />
            
            {/* Main 404 Text */}
            <h1 className="relative text-[12rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-destructive to-accent leading-none select-none">
              404
            </h1>
            
            {/* Glitch Layers */}
            <h1 className="absolute inset-0 text-[12rem] md:text-[16rem] font-black text-destructive/20 leading-none select-none animate-pulse">
              404
            </h1>
            <h1 className="absolute inset-0 text-[12rem] md:text-[16rem] font-black text-accent/20 leading-none select-none" style={{ transform: 'translate(4px, 4px)' }}>
              404
            </h1>
          </motion.div>

          {/* Floating Sparkles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>
          ))}
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Oops! Page Not <span className="text-transparent bg-clip-text bg-gradient-to-r from-destructive to-primary">Found</span>
          </h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Search className="w-5 h-5 animate-pulse" />
            <p className="text-lg">Looks like this page took a vacation</p>
          </div>
        </motion.div>

        {/* Message Card */}
        <motion.div
          key={messageIndex}
          className="max-w-2xl w-full mb-12"
          initial={{ opacity: 0, scale: 0.9, rotateX: -20 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.9, rotateX: 20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative group">
            {/* Card Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-destructive to-accent rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity" />
            
            {/* Card Content */}
            <div className="relative bg-card border border-border rounded-2xl p-8 backdrop-blur-sm">
              <div className="absolute top-4 left-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-destructive/20 flex items-center justify-center">
                    <span className="text-2xl">💀</span>
                  </div>
                </motion.div>
              </div>

              <p className="text-xl md:text-2xl text-muted-foreground italic leading-relaxed pl-16 pr-4">
                "{darkHumorMessages[messageIndex]}"
              </p>

              <motion.button
                onClick={handleNextMessage}
                className="mt-6 flex items-center gap-2 text-primary hover:text-accent transition-colors font-semibold group/btn ml-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-500" />
                Get another reality check
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-4xl w-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { label: "Error Code", value: "404", color: "from-destructive/20 to-destructive/5" },
            { label: "Status", value: "Lost in Space", color: "from-primary/20 to-primary/5" },
            { label: "Recovery", value: "0.00%", color: "from-accent/20 to-accent/5" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative bg-card border border-border rounded-xl p-6 backdrop-blur-sm">
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link to="/">
            <motion.button
              className="group relative px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Button Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent" />
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Button Content */}
              <div className="relative flex items-center gap-3 text-primary-foreground">
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Take Me Home</span>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </motion.button>
          </Link>

          <motion.button
            onClick={() => window.history.back()}
            className="group relative px-8 py-4 rounded-xl font-semibold text-lg border-2 border-border hover:border-primary transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-3 text-foreground group-hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Go Back</span>
            </div>
          </motion.button>
        </motion.div>

        {/* Fun Facts */}
        <motion.div
          className="mt-16 max-w-2xl w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-sm">🎭 Meanwhile, in an alternate universe...</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground/70">
              <motion.div
                className="p-4 bg-card/50 border border-border rounded-lg backdrop-blur-sm"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--accent), 0.1)" }}
              >
                <p>This page exists and is totally functional</p>
              </motion.div>
              <motion.div
                className="p-4 bg-card/50 border border-border rounded-lg backdrop-blur-sm"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--accent), 0.1)" }}
              >
                <p>Your code works on the first try</p>
              </motion.div>
              <motion.div
                className="p-4 bg-card/50 border border-border rounded-lg backdrop-blur-sm"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--accent), 0.1)" }}
              >
                <p>Bugs fix themselves automatically</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-primary rounded-full"
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;