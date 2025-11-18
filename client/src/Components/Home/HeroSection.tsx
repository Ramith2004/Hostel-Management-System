import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' as const },
    },
  };

  const quotes = [
    "Effortless Management, Happy Guests",
    "Your Hostel, Simplified",
    "Smart Living Starts Here",
    "Management Made Simple",
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <section className="relative h-screen bg-background overflow-hidden flex items-center justify-center">
      {/* Premium Animated Background Patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, 100, -50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ top: '-10%', left: '-15%' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-accent/20 to-transparent blur-3xl"
          animate={{
            x: [0, -100, 50, 0],
            y: [0, -100, 50, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ bottom: '-10%', right: '-15%' }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-br from-primary/20 via-accent/20 to-transparent blur-3xl"
          animate={{
            x: [0, 50, -100, 0],
            y: [0, -50, 100, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />

        {/* Geometric Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Glowing Lines */}
        <motion.div
          className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent blur-sm"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-0 right-1/4 w-1 h-full bg-gradient-to-b from-transparent via-accent/10 to-transparent blur-sm"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4.5, repeat: Infinity }}
        />

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30"
            animate={{
              x: [0, Math.cos(i) * 200, 0],
              y: [0, Math.sin(i) * 200, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
            }}
          />
        ))}
      </div>

      {/* Content - Centered */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Heading */}
          <motion.div variants={itemVariants}>
            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Welcome to{' '}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
                HostelX
              </span>
            </motion.h1>

            {/* Decorative Line Under Heading */}
            <motion.div
              className="flex items-center justify-center gap-4 mt-8"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Left Decorative Line */}
              <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full" />
              
              {/* Center Dot */}
              <motion.div
                className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-accent"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Right Decorative Line */}
              <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent rounded-full" />
            </motion.div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Streamline your hostel operations with our intelligent management system. From guest check-ins to room availability, everything at your fingertips.
          </motion.p>

          {/* Attractive Quote Section */}
          <motion.div
            className="flex items-center justify-center gap-3 my-6"
            variants={itemVariants}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-primary"
            >
              <Quote size={24} />
            </motion.div>
            <p className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent italic">
              {randomQuote}
            </p>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-accent"
            >
              <Quote size={24} className="transform scale-x-[-1]" />
            </motion.div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10"
            variants={itemVariants}
          >
            <Link
              to="/register"
              className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-10 py-4 rounded-xl font-semibold overflow-hidden hover:shadow-2xl transition-all duration-300 w-full sm:w-auto transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Started
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ArrowRight size={20} />
                </motion.div>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-accent/60 to-primary/60 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left opacity-0 group-hover:opacity-100" />
            </Link>

            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-card text-card-foreground border-2 border-primary/40 px-10 py-4 rounded-xl font-semibold hover:bg-accent/10 hover:border-accent transition-all duration-300 w-full sm:w-auto backdrop-blur-sm relative z-10"
              >
                Sign In
              </Link>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl -z-10 blur-lg"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>

          {/* Animated Line Under Buttons */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent origin-center"
          />

          {/* Statistics */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 pt-8 border-t border-border/30"
            variants={itemVariants}
          >
            {[
              { number: '1000+', label: 'Happy Hostels' },
              { number: '50K+', label: 'Guests Managed' },
              { number: '99.9%', label: 'Uptime' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="space-y-2 group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  {stat.number}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center p-2">
          <motion.div
            className="w-1 h-2 bg-gradient-to-b from-primary to-accent rounded-full"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;