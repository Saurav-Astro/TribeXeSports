import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const blogPosts = [
  {
    title: "Mastering the Art of Clutch Plays",
    excerpt: "Dive deep into the mindset and mechanics behind winning crucial rounds when the pressure is on.",
    image: PlaceHolderImages.find(p => p.id === 'blog-1'),
    link: "/blog"
  },
  {
    title: "The Latest Gaming Rigs of 2024",
    excerpt: "A comprehensive review of the most powerful and efficient hardware to elevate your gameplay.",
    image: PlaceHolderImages.find(p => p.id === 'blog-2'),
    link: "/blog"
  },
  {
    title: "VCT Madrid Recap: A Tournament for the Ages",
    excerpt: "Relive the most epic moments, upsets, and triumphs from the latest Valorant Champions Tour event.",
    image: PlaceHolderImages.find(p => p.id === 'blog-3'),
    link: "/blog"
  }
];

export function BlogHighlight() {
  return (
    <section className="container mx-auto px-4 py-8 md:py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline text-glow">
          Latest from the Comms
        </h2>
        <p className="mt-4 text-md sm:text-lg text-foreground/70 max-w-2xl mx-auto">
          Get the latest news, strats, and insights from the world of eSports.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post, index) => (
          <Link href={post.link} key={index} className="group block">
            <Card className="h-full glassmorphism overflow-hidden transition-all duration-300 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-2">
              <div className="relative h-56">
                {post.image && (
                  <Image
                    src={post.image.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    data-ai-hint={post.image.imageHint}
                  />
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold font-headline mb-2">{post.title}</h3>
                <p className="text-foreground/70 mb-4">{post.excerpt}</p>
                <div className="flex items-center text-accent font-semibold">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-12 text-center">
          <Button asChild size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground box-glow-accent">
            <Link href="/blog">
              View All Posts
            </Link>
          </Button>
      </div>
    </section>
  );
}
