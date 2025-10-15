
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { updateUserProfile } from '@/firebase/non-blocking-login';
import { Loader2, CheckCircle } from 'lucide-react';
import { agentImages, AgentImage } from '@/data/agent-images';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  photoURL: z.string().url("Invalid avatar URL."),
});

export function UserProfileForm() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      username: user?.displayName || '',
      photoURL: user?.photoURL || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to update your profile." });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserProfile(user, {
        displayName: values.username,
        photoURL: values.photoURL,
      });
      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not update your profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    return null; // Or a loading state
  }

  return (
    <Card className="glassmorphism border-border/50 bg-dashboard-card max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Your Profile</CardTitle>
        <CardDescription>Customize your username and select your favorite agent avatar.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="YourGamerTag" {...field} className="bg-black text-white border-border/60" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Controller
              control={form.control}
              name="photoURL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Your Avatar</FormLabel>
                   <FormMessage className="pb-2" />
                  <ScrollArea className="h-72 w-full">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 pr-4">
                      {agentImages.map((agent) => (
                        <div
                          key={agent.url}
                          onClick={() => field.onChange(agent.url)}
                          className={cn(
                            "relative aspect-square rounded-lg overflow-hidden cursor-pointer border-4 transition-all duration-300",
                            field.value === agent.url ? 'border-primary shadow-lg shadow-primary/50' : 'border-transparent hover:border-accent'
                          )}
                          style={field.value === agent.url ? { borderColor: `hsl(${agent.color})`, boxShadow: `0 0 15px hsl(${agent.color})` } : {}}
                        >
                          <Image
                            src={agent.url}
                            alt={agent.url}
                            fill
                            className="object-cover"
                          />
                          {field.value === agent.url && (
                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-white" style={{ filter: `drop-shadow(0 0 5px hsl(${agent.color}))`}} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
