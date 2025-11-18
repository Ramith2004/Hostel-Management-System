import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="bg-gradient-to-r from-primary to-accent rounded-3xl p-12 md:p-16 text-center border border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Ready to Transform Your Hostel?
          </motion.h2>

          <motion.p
            className="text-lg text-primary-foreground/90 mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Join thousands of hostel managers who are already streamlining their operations with HostelX
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Link
              to="/register"
              className="group relative inline-flex items-center justify-center gap-2 bg-card text-card-foreground px-8 py-4 rounded-xl font-semibold overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Your Free Trial
                <ArrowRight size={20} />
              </span>
            </Link>
            <button className="px-8 py-4 rounded-xl font-semibold border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300">
              Schedule a Demo
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;