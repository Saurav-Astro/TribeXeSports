'use client';
import React, { useState,useEffect } from 'react';
import { motion,AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { LogIn, LogOut, Shield } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { cn } from '@/lib/utils';
import { agentImages, type AgentImage } from '@/data/agent-images';
import Image from 'next/image';

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/tournaments", label: "Tournaments" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/blog", label: "Blog" },
];

export const OdysseyHeader = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [avatarColor, setAvatarColor] = useState<string | null>(null);
    
    const visibleNavLinks = user ? [...navLinks, { href: "/dashboard", label: "Dashboard" }] : navLinks;

    useEffect(() => {
        if (user?.photoURL) {
            const agent = agentImages.find(a => a.url === user.photoURL);
            if (agent) {
                setAvatarColor(agent.color);
            } else {
                setAvatarColor(null);
            }
        } else {
            setAvatarColor(null);
        }
    }, [user]);

    const handleLogout = async () => {
        if(auth) {
            await signOut(auth);
            router.push('/');
        }
    }
    
    return (
        <>
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="px-4 backdrop-blur-3xl bg-black/50 rounded-50 py-4 flex justify-between items-center mb-12"
                >
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.jpg" alt="TribeXeSports Logo" width={40} height={40} />
                     <span className="text-2xl font-bold font-headline">TribeXeSports</span>
                </Link>
                <div className="hidden md:flex items-center space-x-2 relative">
                    {visibleNavLinks.map(link => (
                       <Link href={link.href} key={link.href} className={cn("px-4 py-2 text-sm rounded-md transition-colors hover:text-white relative", pathname === link.href ? "text-white" : "text-zinc-400")}>
                            {link.label}
                            {pathname === link.href && (
                            <motion.div
                                layoutId="nav-underline"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                            />
                            )}
                       </Link>
                    ))}
                </div>
                <div className="flex items-center space-x-4">
                    {isUserLoading ? (
                        <div className="h-10 w-10 bg-zinc-800 rounded-full animate-pulse" />
                    ) : user ? (
                       <>
                        <Link href="/dashboard">
                            <Avatar className="h-10 w-10 border-2 cursor-pointer hover:border-primary transition-colors" style={{borderColor: avatarColor ? `hsl(${avatarColor})` : 'hsl(var(--primary))'}}>
                            <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
                            <AvatarFallback>{user.displayName?.charAt(0) ?? "U"}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <Button onClick={handleLogout} variant="ghost" size="icon"><LogOut/></Button>
                       </>
                    ) : (
                       <>
                         <Link href="/signup" className="hidden md:block px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Register</Link>
                         <Button asChild className="box-glow">
                            <Link href="/login"><LogIn className="mr-2"/> Login</Link>
                        </Button>
                       </>
                    )}
                    <button
                    className="md:hidden p-2 rounded-md focus:outline-none"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                    {mobileMenuOpen ? (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                    </button>
                </div>
            </motion.div>


            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-lg">
                        <div className="flex flex-col items-center justify-center h-full space-y-6 text-lg">
                        <button
                            className="absolute top-6 right-6 p-2"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        {visibleNavLinks.map(link => (
                            <Link key={link.href} href={link.href} className="px-6 py-3 text-2xl" onClick={() => setMobileMenuOpen(false)}>
                                {link.label}
                            </Link>
                        ))}
                        <div className="flex gap-4 pt-8">
                            { !user && (
                                <>
                                <Button asChild size="lg" variant="outline" onClick={() => setMobileMenuOpen(false)}><Link href="/signup">Register</Link></Button>
                                <Button asChild size="lg" onClick={() => setMobileMenuOpen(false)}><Link href="/login">Login</Link></Button>
                                </>
                            )}
                        </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
