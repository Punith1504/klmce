'use client';
import { useEffect } from 'react';
export function RetireOfflineCache() {
  useEffect(()=>{
    // Remove only this ERP's old worker/cache, never caches belonging to another app.
    if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(registrations=>{
      for(const registration of registrations) {
        const url=registration.active?.scriptURL || registration.waiting?.scriptURL || '';
        if (new URL(url || location.href).pathname==='/sw.js') void registration.unregister();
      }
    }).catch(()=>{});
    if ('caches' in window) caches.keys().then(names=>Promise.all(names.filter(name=>name==='offline-cache').map(name=>caches.delete(name)))).catch(()=>{});
  },[]);
  return null;
}
