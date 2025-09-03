
// PWA Session Management Utilities
class PWASessionManager {
  constructor() {
    this.storageKeys = [
      'user-store',
      'shipment-store',
      'auth-token',
      'refresh-token',
      'user-preferences',
      'language',
      'theme'
    ];
  }

  // Clear all application data
  async clearAllData() {
    try {
      // Clear localStorage
      this.storageKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Clear all localStorage items that might be related to the app
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('reptile-') || key.startsWith('user-') || key.startsWith('auth-')) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear cookies
      this.clearAllCookies();

      // Clear IndexedDB databases
      await this.clearIndexedDB();

      // Clear service worker caches
      await this.clearServiceWorkerCaches();

      console.log('All session data cleared successfully');
    } catch (error) {
      console.error('Error clearing session data:', error);
    }
  }

  // Clear all cookies
  clearAllCookies() {
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
    });
  }

  // Clear IndexedDB databases
  async clearIndexedDB() {
    try {
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases.map(db => {
            return new Promise((resolve, reject) => {
              const deleteReq = indexedDB.deleteDatabase(db.name);
              deleteReq.onsuccess = () => resolve();
              deleteReq.onerror = () => reject(deleteReq.error);
              deleteReq.onblocked = () => reject(new Error('Database deletion blocked'));
            });
          })
        );
      }
    } catch (error) {
      console.error('Error clearing IndexedDB:', error);
    }
  }

  // Clear service worker caches
  async clearServiceWorkerCaches() {
    try {
      if ('serviceWorker' in navigator && 'caches' in window) {
        // Send message to service worker to clear caches
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CLEAR_ALL_CACHES'
          });
        }

        // Also clear caches from main thread
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }
    } catch (error) {
      console.error('Error clearing service worker caches:', error);
    }
  }

  // Register service worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('Service Worker registered successfully:', registration);
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'CACHE_CLEARED') {
            console.log('Service worker caches cleared');
          }
        });
        
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Check if app is running as PWA
  isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
  }

  // Force reload the app (useful after clearing data)
  forceReload() {
    if (this.isPWA()) {
      // In PWA mode, we need to force a complete reload
      window.location.href = window.location.origin;
    } else {
      window.location.reload(true);
    }
  }
}

export default new PWASessionManager();
