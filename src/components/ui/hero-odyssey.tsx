
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const HeroSection: React.FC = () => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="relative w-full text-white overflow-hidden min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-30 flex flex-col items-center text-center max-w-4xl mx-auto"
        >
            <motion.div variants={itemVariants}>
                <motion.h1
                    className="text-5xl md:text-7xl font-bold mb-4 text-glow bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent"
                >
                   The Future of eSports is Here
                </motion.h1>
            </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-gray-300 mb-9 max-w-2xl text-lg"
          >
            Join TribeXeSports, the ultimate platform for competitive gaming. Discover tournaments, track your progress, and connect with a community of dedicated players.
          </motion.p>


          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-4"
          >
             <Button asChild size="lg" className="box-glow">
                <Link href="/tournaments">
                    Explore Tournaments <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground box-glow-accent">
                <Link href="/signup">
                    Join the Tribe
                </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
