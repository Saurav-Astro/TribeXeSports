
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const formSchema = z.object({
  name: z.string().min(5, "Tournament name must be at least 5 characters."),
  game: z.string().min(1, "Please select a game."),
  prize: z.coerce.number().min(0, "Prize pool must be a positive number."),
  participants: z.coerce.number().min(2, "A tournament must have at least 2 participants."),
  startDate: z.date({ required_error: "A start date is required." }),
  endDate: z.date({ required_error: "An end date is required." }),
  description: z.string().optional(),
  photo: z.any().refine((files) => files?.length > 0, 'A photo is required.'),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after the start date.",
  path: ["endDate"],
});

export function CreateTournamentForm() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      game: "",
      prize: 0,
      participants: 16,
    },
  });

  const photoRef = form.register("photo");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to create a tournament." });
        return;
    }
    
    setIsSubmitting(true);

    try {
        const imageFile = values.photo[0];
        const formData = new FormData();
        formData.append('file', imageFile);

        const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload image');
        }

        const { url: imageUrl } = await uploadResponse.json();

        const tournamentsCollection = collection(firestore, 'tournaments');
        await addDoc(tournamentsCollection, {
            name: values.name,
            game: values.game,
            prize: values.prize,
            participants: values.participants,
            startDate: Timestamp.fromDate(values.startDate),
            endDate: Timestamp.fromDate(values.endDate),
            description: values.description || '',
            imageUrl: imageUrl,
            organizerId: user.uid,
            createdAt: Timestamp.now(),
        });
        
        toast({
            title: "Tournament Created!",
            description: `The "${values.name}" tournament has been successfully created.`,
        });
        form.reset();

    } catch (error: any) {
        console.error("Error creating tournament:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Could not create tournament.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card className="glassmorphism border-border/50 bg-dashboard-card">
      <CardHeader>
        <CardTitle>Create a New Tournament</CardTitle>
        <CardDescription>Fill out the details below to launch a new event.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tournament Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Valorant Champions Tour" {...field} className="bg-black text-white border-border/60" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormField
                  control={form.control}
                  name="game"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger className="bg-black text-white border-border/60">
                                <SelectValue placeholder="Select a game" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glassmorphism">
                                <SelectItem value="Valorant">Valorant</SelectItem>
                                <SelectItem value="Apex Legends">Apex Legends</SelectItem>
                                <SelectItem value="CS:GO">CS:GO</SelectItem>
                                <SelectItem value="League of Legends">League of Legends</SelectItem>
                                <SelectItem value="Rocket League">Rocket League</SelectItem>
                            </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="prize"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Prize Pool (INR)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="8300000" {...field} className="bg-black text-white border-border/60"/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                control={form.control}
                name="participants"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Max Participants</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="16" {...field} className="bg-black text-white border-border/60"/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tournament Photo</FormLabel>
                    <FormControl>
                        <Input type="file" {...photoRef} className="bg-black text-white border-border/60 file:text-foreground/80"/>
                    </FormControl>
                     <FormDescription>
                        Upload a banner image for the tournament page.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal bg-black text-white border-border/60 hover:bg-black/80",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 glassmorphism" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date() }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal bg-black text-white border-border/60 hover:bg-black/80",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 glassmorphism" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < (form.getValues("startDate") || new Date())}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                )}
                />
            </div>

             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the tournament, its format, rules, etc." {...field} className="bg-black text-white border-border/60 min-h-32" />
                  </FormControl>
                  <FormDescription>
                    This will be shown on the public tournament page.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating...' : 'Create Tournament'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
