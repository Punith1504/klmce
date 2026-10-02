import React from 'react';
import FeedClient from './FeedClient';

// React Server Component (RSC) Data Fetching
async function getInitialPosts() {
    // In production, this securely hits the internal network directly, 
    // retrieving the first page of posts before shipping HTML to the client for blazing fast LCP.
    // const res = await fetch('http://api:8000/api/v1/social/feed', { cache: 'no-store' });
    
    return [
        { id: '1', author: 'Dr. Ramesh (HOD CSE)', content: 'Welcome to the Fall Semester! We have completely overhauled the Cloud Computing Lab infrastructure.', upvotes: 24, time: '2h ago' },
        { id: '2', author: 'Tech Club', content: 'Hackathon registrations close at midnight. Build something amazing!', upvotes: 112, time: '5h ago' }
    ];
}

export default async function CampusFeedPage() {
    // Fetch critical initial data on the server
    const initialPosts = await getInitialPosts();

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white">
            <div className="max-w-3xl mx-auto py-8 px-4">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                        Campus Social Hub
                    </h1>
                    <p className="text-slate-400">Cryptographically restricted to your specific academic cohort.</p>
                </header>
                
                {/* Hydrate the Client Component with Server-Rendered Initial Data */}
                <FeedClient initialPosts={initialPosts} />
            </div>
        </div>
    );
}
