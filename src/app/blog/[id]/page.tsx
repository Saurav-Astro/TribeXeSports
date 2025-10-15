'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, Timestamp } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, Clock, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

type Blog = {
  id: string;
  title: string;
  content: string;
  authorId: string; // We can expand on this later to show author details
  publicationDate: Timestamp;
  imageUrl: string;
  imageHint: string;
  category: string;
};

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 animate-pulse">
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-5 w-1/2 mb-8" />
        <Skeleton className="h-72 w-full rounded-3xl mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <br />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      </div>
    </div>
  );
}

function PostDetails({ post }: { post: Blog }) {
  const publicationDate = post.publicationDate.toDate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 md:py-12"
    >
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-glow mb-4">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-foreground/70 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(publicationDate, 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{format(publicationDate, 'p')}</span>
            </div>
          </div>
        </header>

        <div className="relative h-72 md:h-[450px] rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-primary/10">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            data-ai-hint={post.imageHint}
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        <Card className="glassmorphism">
          <CardContent className="p-6 md:p-10">
            <div
              className="prose prose-lg max-w-none text-foreground/90 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export default function BlogPostPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();

  const blogDocRef = useMemoFirebase(
    () => (firestore && id ? doc(firestore, 'blogs', id) : null),
    [firestore, id]
  );

  const { data: post, isLoading, error } = useDoc<Blog>(blogDocRef);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-20 text-destructive">
        Error: Could not load the post. Please try again later.
      </div>
    );
  }

  if (!post) {
    return <div className="text-center py-20 text-2xl font-headline">Blog post not found.</div>;
  }

  return <PostDetails post={post} />;
}
