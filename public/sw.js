self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  await caches.delete('offline-cache');
  await self.registration.unregister();
  await self.clients.claim();
})()));
