"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2, Image as ImageIcon, FileText, Send } from "lucide-react";

export default function FeedClient({ initialPosts }: { initialPosts: any[] }) {
    const [posts, setPosts] = useState(initialPosts);
    const [editorContent, setEditorContent] = useState("");
    const loaderRef = useRef(null);

    // Infinite Scrolling Engine using IntersectionObserver
    // In production, this hooks tightly into TanStack Query's `useInfiniteQuery`
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                console.log("Observer Triggered: Fetching page 2 of social feed...");
                // fetchNextPage() logic goes here
            }
        }, { threshold: 1.0 });

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, []);

    const handlePost = () => {
        if(!editorContent) return;
        
        // Optimistic UI update before firing POST request to backend
        const newPost = {
            id: Date.now().toString(),
            author: 'You',
            content: editorContent,
            upvotes: 0,
            time: 'Just now'
        };
        setPosts([newPost, ...posts]);
        setEditorContent("");
    };

    return (
        <div className="space-y-6">
            {/* Lightweight Rich Text Editor Simulation */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <Avatar className="w-10 h-10 border border-white/20"><AvatarFallback className="bg-pink-500/20 text-pink-300">ME</AvatarFallback></Avatar>
                        <div className="flex-1 space-y-3">
                            <Textarea 
                                placeholder="Share updates, links, or media with your cohort..." 
                                value={editorContent}
                                onChange={(e) => setEditorContent(e.target.value)}
                                className="bg-black/20 border-white/10 resize-none focus-visible:ring-pink-500 min-h-[100px]"
                            />
                            <div className="flex justify-between items-center">
                                <div className="flex space-x-2">
                                    <Button size="icon" variant="ghost" className="text-slate-400 hover:text-pink-400"><ImageIcon className="w-5 h-5" /></Button>
                                    <Button size="icon" variant="ghost" className="text-slate-400 hover:text-pink-400"><FileText className="w-5 h-5" /></Button>
                                </div>
                                <Button onClick={handlePost} className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-600/20 border-0">
                                    <Send className="w-4 h-4 mr-2" /> Post
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Rendered Infinite Feed */}
            <div className="space-y-6">
                {posts.map(post => (
                    <Card key={post.id} className="bg-[#13192b] border-white/10 transition-colors hover:border-white/20">
                        <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
                            <Avatar className="w-10 h-10 border border-white/20"><AvatarFallback className="bg-slate-800 text-slate-300">{post.author[0]}</AvatarFallback></Avatar>
                            <div>
                                <h3 className="font-semibold text-slate-200">{post.author}</h3>
                                <p className="text-xs text-slate-500">{post.time}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <p className="text-slate-300 whitespace-pre-wrap">{post.content}</p>
                        </CardContent>
                        <CardFooter className="p-4 border-t border-white/5 flex gap-4">
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-pink-400 hover:bg-pink-500/10">
                                <Heart className="w-4 h-4 mr-2" /> {post.upvotes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/10">
                                <MessageSquare className="w-4 h-4 mr-2" /> Comment
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/10">
                                <Share2 className="w-4 h-4 mr-2" /> Share
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* DOM Element mapped to the Intersection Observer */}
            <div ref={loaderRef} className="h-10 flex items-center justify-center">
                <span className="text-slate-500 text-sm animate-pulse">Scanning backend for older posts...</span>
            </div>
        </div>
    );
}
