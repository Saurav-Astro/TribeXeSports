'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, Timestamp, doc, deleteDoc } from "firebase/firestore";
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import Link from "next/link";
import Image from "next/image";

type Blog = {
  id: string;
  title: string;
  category: string;
  publicationDate: Timestamp;
  imageUrl: string;
};


export function PostManagement() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const postsQuery = useMemoFirebase(() => 
        firestore ? query(collection(firestore, 'blogs'), orderBy('publicationDate', 'desc')) : null, 
        [firestore]
    );
    const { data: posts, isLoading } = useCollection<Blog>(postsQuery);


    const handleDeletePost = async (postId: string) => {
        if (!firestore) return;
        const postRef = doc(firestore, 'blogs', postId);
        try {
            await deleteDoc(postRef);
            toast({
                title: "Post Deleted",
                description: "The blog post has been successfully deleted."
            });
        } catch (error) {
             console.error("Error deleting post: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not delete the post."
            });
        }
    };

    return (
        <Card className="glassmorphism border-border/50 bg-dashboard-card">
            <CardHeader>
                <CardTitle>Manage Blog Posts</CardTitle>
                <CardDescription>View, edit, and delete all published articles.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                            <TableHead>Post Title</TableHead>
                            <TableHead className="hidden md:table-cell">Category</TableHead>
                            <TableHead className="hidden lg:table-cell">Published Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i} className="border-border/50">
                                <TableCell><div className="flex items-center gap-4"><Skeleton className="h-10 w-16 rounded-md" /><Skeleton className="h-5 w-48" /></div></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                        {posts?.map((post) => {
                             return (
                                <TableRow key={post.id} className="border-border/50">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-4">
                                            <Image src={post.imageUrl} alt={post.title} width={64} height={40} className="rounded-md object-cover h-10"/>
                                            <span>{post.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell"><Badge variant="outline">{post.category}</Badge></TableCell>
                                    <TableCell className="hidden lg:table-cell font-mono text-sm text-muted-foreground">
                                        {format(post.publicationDate.toDate(), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="glassmorphism">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                     <DropdownMenuItem asChild>
                                                        <Link href={`/blog/${post.id}`}>View Post</Link>
                                                    </DropdownMenuItem>
                                                     <DropdownMenuItem disabled>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit (Coming Soon)
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                     <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-destructive focus:bg-destructive/20 focus:text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Post
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AlertDialogContent className="glassmorphism">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the
                                                        post "{post.title}".
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeletePost(post.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                                        Yes, delete post
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                             );
                        })}
                         {!isLoading && posts?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No posts found. Create one to get started!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
