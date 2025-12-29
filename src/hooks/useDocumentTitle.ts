import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export const useDocumentTitle = () => {
  const settings = useStore((state) => state.settings);

  // Update document title
  useEffect(() => {
    const name = settings.restaurantName || 'Sajilo Orders';
    const subName = settings.restaurantSubName;
    
    document.title = subName ? `${name} - ${subName}` : name;
  }, [settings.restaurantName, settings.restaurantSubName]);

  // Update favicon dynamically
  useEffect(() => {
    if (settings.logo) {
      // Update or create favicon link
      let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      let appleTouchIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
      
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      
      if (!appleTouchIcon) {
        appleTouchIcon = document.createElement('link');
        appleTouchIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleTouchIcon);
      }
      
      favicon.href = settings.logo;
      appleTouchIcon.href = settings.logo;
    }
  }, [settings.logo]);
};
