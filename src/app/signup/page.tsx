
"use client";
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuth, useUser } from "@/firebase";
import { initiateGoogleSignIn, signUpWithEmail } from "@/firebase/non-blocking-login";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { agentImages, type AgentImage } from '@/data/agent-images';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="24px"
    height="24px"
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.556,44,29.86,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

const CardContentArea = ({ accentColor }: { accentColor: string }) => {
  const auth = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  
  const isAdminEmail = email === "tribexesports@gmail.com";

  useEffect(() => {
    if (isAdminEmail) {
      setUsername("Admin");
    }
  }, [isAdminEmail]);

  const handleEmailSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    
    const finalUsername = isAdminEmail ? 'Admin' : username;
    const finalPassword = isAdminEmail ? 'tribexesports@' : password;

    try {
      await signUpWithEmail(auth, email, finalPassword, finalUsername);
       toast({
        title: "Account Created!",
        description: "Welcome to TribeXeSports!",
      });
      // The useEffect in the parent will handle the redirect to dashboard
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message || "An unknown error occurred.",
      });
    }
  };
  
  const handleGoogleSignIn = () => {
    if (auth) {
        initiateGoogleSignIn(auth);
    }
  };

  return (
    <>
      <form className="grid gap-4" onSubmit={handleEmailSignup}>
        {!isAdminEmail && (
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="YourGamerTag" required className="bg-zinc-900/60 border-zinc-800 h-11 text-base" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="your@email.com" required className="bg-zinc-900/60 border-zinc-800 h-11 text-base" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
         {!isAdminEmail && (
            <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" required className="bg-zinc-900/60 border-zinc-800 h-11 text-base" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
        )}
        <Button type="submit" className="w-full h-12 mt-2 text-lg font-bold transition-all duration-300" style={{backgroundColor: `hsl(${accentColor})`, textShadow: `0 0 15px hsl(${accentColor} / 0.8)`}}>
          Create Account
        </Button>
      </form>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-700" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-zinc-400">Or continue with</span></div>
      </div>
      <div>
        <Button variant="outline" className="w-full h-12 text-lg" onClick={handleGoogleSignIn}><GoogleIcon className="mr-2" /> Google</Button>
      </div>
      <div className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="underline font-semibold" style={{color: `hsl(${accentColor})`}}>
          Login
        </Link>
      </div>
    </>
  );
};


export default function SignupPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [currentAgent, setCurrentAgent] = useState<AgentImage | null>(null);

  useEffect(() => {
    // Select a random agent on mount and set up an interval
    const intervalId = setInterval(() => {
      setCurrentAgent(agentImages[Math.floor(Math.random() * agentImages.length)]);
    }, 5000);
    
    // Set initial agent
    setCurrentAgent(agentImages[Math.floor(Math.random() * agentImages.length)]);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);

  if (!currentAgent) {
    return (
        <div className="w-full flex-1 flex items-center justify-center bg-transparent">
            <Card className="w-full max-w-md glassmorphism">
                <CardHeader className="text-center">
                    <CardTitle className="text-4xl font-headline">Create Account</CardTitle>
                    <CardDescription>Your eSports journey starts here.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="animate-pulse space-y-4">
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-zinc-700 rounded"></div>
                            <div className="h-11 w-full bg-zinc-800 rounded"></div>
                        </div>
                         <div className="space-y-2">
                            <div className="h-4 w-24 bg-zinc-700 rounded"></div>
                            <div className="h-11 w-full bg-zinc-800 rounded"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-zinc-700 rounded"></div>
                            <div className="h-11 w-full bg-zinc-800 rounded"></div>
                        </div>
                        <div className="h-12 w-full bg-zinc-700 rounded mt-2"></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
      <div className="w-full flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md glassmorphism" style={{borderColor: `hsl(${currentAgent.color} / 0.4)`, boxShadow: `0 0 25px -5px hsl(${currentAgent.color} / 0.1), 0 0 40px -15px hsl(${currentAgent.color} / 0.2)`}}>
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-headline">Create Account</CardTitle>
              <CardDescription>Your eSports journey starts here.</CardDescription>
            </CardHeader>
            <CardContent>
              <CardContentArea accentColor={currentAgent.color} />
            </CardContent>
          </Card>
      </div>
  );
}
