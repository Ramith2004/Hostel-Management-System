import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ArrowLeft, Volume2, VolumeX } from 'lucide-react';

const NotFound: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const darkHumorMessages = [
  "This page disappeared faster than your clothes when someone says they live alone.",
  "404: Even this link has more commitment issues than your situationship.",
  "This page didn’t get lost. It just saw you coming and decided to stay under the covers.",
  "It’s not missing. It’s hiding after a night full of questionable decisions.",
  "This page is like you on a date — looks fine at first, then suddenly refuses to show up.",
  "404: This link folded faster than you do when someone whispers 'come closer.'",
  "This page didn’t break. It just needed some 'me time' after all those late-night clicks.",
  "Missing page? More like it sneaked out for a ‘quick break’ and never came back.",
  "This page is giving the same energy as your ex: promising, tempting, and then absolutely nothing.",
  "404: The page left to explore positions — I mean locations — elsewhere.",
  "This page said it needed space. Probably the kind you don’t use safely.",
  "It’s gone. Probably with someone who actually knows how to handle a URL.",
  "404: This link has more red flags than your dating history.",
  "This page isn’t lost. It’s busy entertaining someone with better bandwidth.",
  "It ran off the moment things got serious. Sounds familiar, right?",
  "404: Even this page isn’t ready for that kind of interaction.",
  "This page saw your search history and noped out immediately.",
  "If you think this is empty, you should see your love life.",
  "This page has the same energy as a risky text you shouldn’t have sent.",
  "Maybe this page will come back… unlike the ones who left your messages on seen."
];


  const randomMessage = darkHumorMessages[messageIndex];

  const handleNextMessage = () => {
    setMessageIndex((prev) => (prev + 1) % darkHumorMessages.length);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.23, 1, 0.320, 1] },
    },
  };

  const floatingVariants = {
    float: {
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary gradient blob */}
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ top: '10%', left: '-10%' }}
        />

        {/* Destructive gradient blob */}
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-destructive/20 to-primary/20 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ bottom: '10%', right: '-10%' }}
        />

        {/* Additional accent blob */}
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-accent/10 to-destructive/10 blur-3xl"
          animate={{
            x: [100, -100, 100],
            y: [-100, 100, -100],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />
      </div>

      {/* Floating Emoji Particles */}
      <motion.div
        className="absolute top-20 right-20 text-7xl opacity-30"
        variants={floatingVariants}
        animate="float"
      >
        💀
      </motion.div>

      <motion.div
        className="absolute bottom-32 left-10 text-8xl opacity-20"
        animate={{
          y: [0, -30, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        🔥
      </motion.div>

      <motion.div
        className="absolute top-1/3 left-20 text-6xl opacity-25"
        animate={{
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        ⚰️
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 right-1/4 text-7xl opacity-20"
        animate={{
          rotate: [360, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        👻
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative max-w-3xl w-full text-center z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Large 404 Text with Glow */}
        <motion.div variants={itemVariants}>
          <div className="relative mb-8">
            {/* Outer glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-destructive via-primary to-accent opacity-20 blur-3xl -z-10 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Main 404 */}
            <motion.h1
              className="text-9xl md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-r from-destructive via-primary to-accent leading-none drop-shadow-2xl"
              animate={{
                y: [0, -15, 0],
                textShadow: [
                  '0 0 20px rgba(239, 68, 68, 0.5)',
                  '0 0 40px rgba(139, 92, 246, 0.5)',
                  '0 0 20px rgba(239, 68, 68, 0.5)',
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              404
            </motion.h1>

            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0"
              animate={{
                opacity: [0, 1, 0],
                x: [-100, 100, -100],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                filter: 'blur(20px)',
              }}
            />
          </div>
        </motion.div>

        {/* Main Message */}
        <motion.div variants={itemVariants}>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Error: Page Not <span className="text-destructive">Existing</span>
          </h2>
        </motion.div>

        {/* Dark Humor Message with Animation */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={messageIndex}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xl md:text-2xl text-muted-foreground italic max-w-2xl mx-auto font-light leading-relaxed">
                "{randomMessage}"
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Next Message Button */}
          <motion.button
            onClick={handleNextMessage}
            className="mt-4 text-sm text-primary hover:text-accent transition-colors underline cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Click for another existential crisis →
          </motion.button>
        </motion.div>

        {/* Error Details Card */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-card/80 to-card/40 border border-primary/20 rounded-2xl p-8 mb-8 backdrop-blur-lg hover:border-primary/40 transition-all duration-300"
        >
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="flex items-start gap-3">
              <span className="text-destructive font-bold text-lg">●</span>
              <div className="text-left">
                <p className="text-primary font-bold">Error Code:</p>
                <p className="text-muted-foreground text-sm font-mono">UNIVERSE_404_ENTITY_VOID</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary font-bold text-lg">●</span>
              <div className="text-left">
                <p className="text-primary font-bold">Status:</p>
                <p className="text-muted-foreground text-sm">Permanently deleted from existence</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-accent font-bold text-lg">●</span>
              <div className="text-left">
                <p className="text-primary font-bold">Recovery Chance:</p>
                <p className="text-muted-foreground text-sm">Less than your chances of winning the lottery</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <Link
            to="/"
            className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-4 rounded-xl font-bold overflow-hidden hover:shadow-2xl transition-all duration-300 text-lg"
          >
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Home size={24} />
            </motion.div>
            <span>Return to Reality</span>
            <motion.div
              className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left -z-10"
              whileHover={{ scaleX: 1 }}
            />
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group relative inline-flex items-center justify-center gap-2 bg-card/80 text-card-foreground border-2 border-border px-8 py-4 rounded-xl font-bold hover:bg-accent hover:border-accent hover:text-accent-foreground transition-all duration-300 text-lg backdrop-blur-sm"
          >
            <ArrowLeft size={24} />
            Undo This Mistake
          </button>
        </motion.div>

        {/* Sound Toggle */}
        <motion.button
          variants={itemVariants}
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
        >
          {soundEnabled ? (
            <Volume2 size={18} />
          ) : (
            <VolumeX size={18} />
          )}
          {soundEnabled ? 'Sound On' : 'Sound Off'}
        </motion.button>

        {/* Easter Eggs & Fun Facts */}
        <motion.div
          variants={itemVariants}
          className="mt-12 space-y-4"
        >
          <motion.div
            className="text-muted-foreground text-sm"
            whileHover={{ scale: 1.05 }}
          >
            <p className="mb-2">🎭 Fun Facts About This Page:</p>
            <div className="space-y-1 text-xs text-muted-foreground/70">
              <p>• It has better attendance than most developers</p>
              <p>• It's the only thing that runs faster than our code</p>
              <p>• NASA couldn't find this page with their satellites</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Animated Border */}
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-destructive opacity-20 rounded-2xl blur -z-10"
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Matrix-like falling text effect */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-foreground/5 text-2xl font-mono pointer-events-none"
          animate={{
            y: ['0vh', '100vh'],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 2,
          }}
          style={{
            left: `${Math.random() * 100}%`,
          }}
        >
          {['404', 'ERROR', 'NULL', 'VOID', 'GONE'][i]}
        </motion.div>
      ))}
    </div>
  );
};

export default NotFound;