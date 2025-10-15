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
import { Loader2 } from 'lucide-react';
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
  title: z.string().min(5, "Post title must be at least 5 characters."),
  category: z.string().min(1, "Please select a category."),
  content: z.string().min(20, "Post content must be at least 20 characters."),
  photo: z.any().refine((files) => files?.length > 0, 'A banner image is required.'),
});

export function CreatePostForm() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      content: "",
    },
  });

  const photoRef = form.register("photo");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to create a post." });
        return;
    }
    
    setIsSubmitting(true);

    try {
        const imageFile = values.photo[0];
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('folder', 'blog_banners'); // Specify a folder for blog images

        const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload image');
        }

        const { url: imageUrl } = await uploadResponse.json();

        const blogsCollection = collection(firestore, 'blogs');
        await addDoc(blogsCollection, {
            title: values.title,
            category: values.category,
            content: values.content,
            imageUrl: imageUrl,
            imageHint: 'blog ' + values.category.toLowerCase(),
            authorId: user.uid,
            publicationDate: Timestamp.now(),
        });
        
        toast({
            title: "Post Created!",
            description: `The post "${values.title}" has been successfully published.`,
        });
        form.reset();

    } catch (error: any) {
        console.error("Error creating post:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Could not create post.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card className="glassmorphism border-border/50 bg-dashboard-card">
      <CardHeader>
        <CardTitle>Create a New Blog Post</CardTitle>
        <CardDescription>Fill out the details below to publish a new article.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mastering the Art of Clutch Plays" {...field} className="bg-black text-white border-border/60" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                          <SelectTrigger className="bg-black text-white border-border/60">
                              <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glassmorphism">
                              <SelectItem value="Guides">Guides</SelectItem>
                              <SelectItem value="News">News</SelectItem>
                              <SelectItem value="Analysis">Analysis</SelectItem>
                              <SelectItem value="Community">Community</SelectItem>
                              <SelectItem value="Updates">Updates</SelectItem>
                          </SelectContent>
                      </Select>
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
                    <FormLabel>Banner Image</FormLabel>
                    <FormControl>
                        <Input type="file" accept="image/*" {...photoRef} className="bg-black text-white border-border/60 file:text-foreground/80"/>
                    </FormControl>
                     <FormDescription>
                        This image will appear at the top of your blog post.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
              />

             <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write your blog post here. You can use simple HTML for formatting like <strong>, <ul>, etc." {...field} className="bg-black text-white border-border/60 min-h-64" />
                  </FormControl>
                  <FormDescription>
                    The content supports basic HTML tags for formatting.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Publishing...' : 'Publish Post'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
