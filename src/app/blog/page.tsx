
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Rss } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

type Blog = {
  id: string;
  title: string;
  content: string; // Excerpt or full content
  authorId: string;
  publicationDate: Timestamp;
  imageUrl: string;
  imageHint: string;
  category: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

function BlogPostCard({ post }: { post: Blog }) {
    return (
      <motion.div variants={itemVariants}>
        <Link href={`/blog/${post.id}`} key={post.id} className="group block h-full">
            <Card className="h-full flex flex-col glassmorphism overflow-hidden transition-all duration-300 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-2">
              <div className="relative h-56">
                {post.imageUrl && (
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    data-ai-hint={post.imageHint}
                  />
                )}
                 <div className="absolute top-4 right-4">
                    <Badge variant="default" className="bg-primary/80 backdrop-blur-sm text-primary-foreground box-glow">{post.category}</Badge>
                 </div>
              </div>
              <CardContent className="p-6 flex-grow">
                <p className="text-sm text-foreground/60 mb-2">{format(post.publicationDate.toDate(), 'MMMM d, yyyy')}</p>
                <h3 className="text-xl font-bold font-headline mb-2">{post.title}</h3>
                <p className="text-foreground/70 line-clamp-3">{post.content}</p>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <div className="flex items-center text-accent font-semibold">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </CardFooter>
            </Card>
          </Link>
        </motion.div>
    )
}

function LoadingSkeleton() {
    return (
        <>
            {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="h-full flex flex-col glassmorphism overflow-hidden">
                     <Skeleton className="h-56 w-full" />
                    <CardContent className="p-6 flex-grow">
                        <Skeleton className="h-4 w-24 mb-4" />
                        <Skeleton className="h-6 w-full mb-2" />
                        <Skeleton className="h-6 w-3/4" />
                         <Skeleton className="h-4 w-full mt-4" />
                         <Skeleton className="h-4 w-full mt-2" />
                         <Skeleton className="h-4 w-5/6 mt-2" />
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                         <Skeleton className="h-6 w-28" />
                    </CardFooter>
                </Card>
            ))}
        </>
    )
}


export default function BlogPage() {
  const firestore = useFirestore();
  const blogsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'blogs'), orderBy('publicationDate', 'desc')) : null,
    [firestore]
  );
  const { data: blogPosts, isLoading } = useCollection<Blog>(blogsQuery);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline text-glow">
          TribeXeSports Blog
        </h1>
        <p className="mt-4 text-md sm:text-lg text-foreground/70 max-w-2xl mx-auto">
          Your source for eSports news, analysis, and culture.
        </p>
      </motion.div>
      <motion.div 
         variants={containerVariants}
         initial="hidden"
         animate="visible"
         className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      >
        {isLoading ? (
            <LoadingSkeleton />
        ) : blogPosts && blogPosts.length > 0 ? (
            blogPosts.map((post) => <BlogPostCard key={post.id} post={post} />)
        ) : (
            <div className="col-span-full text-center py-20">
                <Rss className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h2 className="text-2xl font-headline">No Posts Yet</h2>
                <p className="text-muted-foreground mt-2">Check back soon for the latest articles!</p>
            </div>
        )}
      </motion.div>
    </div>
  );
}
