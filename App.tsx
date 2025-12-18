
import React, { useState, useEffect, useRef } from 'react';
import { Website } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import WebsiteCard from './components/WebsiteCard';
import AddWebsiteModal from './components/AddWebsiteModal';
import { PlusIcon } from './components/icons/PlusIcon';
import './index.css';

const App: React.FC = () => {
  const categories = ['게임', '음악', '미술'];
  const [websites, setWebsites] = useLocalStorage<Website[]>('my-websites', [
    {
      id: '1',
      name: 'ArtStation',
      url: 'https://www.artstation.com/',
      imageUrl: 'https://picsum.photos/seed/1/600/400',
      category: '미술',
    },
    {
      id: '2',
      name: 'Spotify',
      url: 'https://open.spotify.com/',
      imageUrl: 'https://picsum.photos/seed/2/600/400',
      category: '음악',
    },
    {
      id: '3',
      name: 'Steam',
      url: '/test_myReactProject/sakuya-temporal-log/',
      imageUrl: 'https://picsum.photos/seed/3/600/400',
      category: '게임',
    },
     {
      id: '4',
      name: 'Behance',
      url: 'https://www.behance.net/',
      imageUrl: 'https://picsum.photos/seed/4/600/400',
      category: '미술',
    }
    ,
    
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [embeddedUrl, setEmbeddedUrl] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState('All');

  // Listen for navigation messages from embedded iframe so internal links
  // open inside the same modal instead of navigating the top window.
  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      const data = ev.data;
      if (!data || data.type !== 'navigate') return;
      const href: string = data.href;
      if (!href) return;

      // If iframe sends a full pathname, prefer that. Normalize to our
      // Vite base so iframe stays served from public folder.
      let target = href;
      if (target.startsWith('/test_myReactProject/')) {
        // already good
      } else if (target.startsWith('/sakuya-temporal-log/')) {
        target = '/test_myReactProject' + target;
      } else if (target.startsWith('/')) {
        target = '/test_myReactProject/sakuya-temporal-log' + target;
      } else {
        // relative path from inside embedded site — append to its base
        target = '/test_myReactProject/sakuya-temporal-log/' + target;
      }

      setEmbeddedUrl(target);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // When iframe loads, attach a delegated click handler inside the iframe
  // document so clicks on internal links open inside the modal (same iframe)
  const attachIframeInterceptor = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe) return;
      const doc = iframe.contentDocument;
      if (!doc) return;

      const handler = (e: Event) => {
        try {
          const target = (e.target as Element);
          const a = (target && (target as any).closest) ? (target as any).closest('a') : null;
          if (!a) return;
          const href = (a as HTMLAnchorElement).href;
          if (!href) return;
          const url = new URL(href, doc.baseURI);
          if (url.origin !== window.location.origin) return; // external
          e.preventDefault();

          // send the pathname+search+hash to parent handler logic by
          // calling the same normalization we use for postMessage.
          const path = url.pathname + url.search + url.hash;
          let targetPath = path;
          if (targetPath.startsWith('/test_myReactProject/')) {
            // already good
          } else if (targetPath.startsWith('/sakuya-temporal-log/')) {
            targetPath = '/test_myReactProject' + targetPath;
          } else if (targetPath.startsWith('/')) {
            targetPath = '/test_myReactProject/sakuya-temporal-log' + targetPath;
          } else {
            targetPath = '/test_myReactProject/sakuya-temporal-log/' + targetPath;
          }

          setEmbeddedUrl(targetPath);
        } catch (err) {
          /* ignore */
        }
      };

      // store handler for later cleanup
      (iframe as any).__clickInterceptor = handler;
      doc.addEventListener('click', handler, true);
    } catch (err) {
      // cross-origin or not ready — ignore
    }
  };

  // cleanup interceptor when modal closes
  useEffect(() => {
    if (embeddedUrl) return; // only cleanup when closed
    try {
      const iframe = iframeRef.current;
      if (!iframe) return;
      const handler = (iframe as any).__clickInterceptor;
      const doc = iframe.contentDocument;
      if (doc && handler) doc.removeEventListener('click', handler, true);
      delete (iframe as any).__clickInterceptor;
    } catch (err) {
      // ignore
    }
  }, [embeddedUrl]);

  const handleOpenEmbedded = (url: string) => {
    // Serve from Vite's public folder
    setEmbeddedUrl('/test_myReactProject/sakuya-temporal-log/');
  };

  const handleAddWebsite = (name: string, url: string, category: string) => {
    const newWebsite: Website = {
      id: new Date().getTime().toString(),
      name,
      url,
      imageUrl: `https://picsum.photos/seed/${new Date().getTime()}/600/400`,
      category,
    };
    setWebsites([...websites, newWebsite]);
    setIsModalOpen(false);
  };

  const handleDeleteWebsite = (id: string) => {
    setWebsites(websites.filter(website => website.id !== id));
  };

  const filteredWebsites = websites.filter(website =>
    currentCategory === 'All' || website.category === currentCategory
  );

    return (
    <div className="app-container">
      {/* Embedded URL Modal */}
      {embeddedUrl && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEmbeddedUrl(null)}>
          <div className="bg-slate-900 rounded-lg w-full h-5/6 max-w-6xl relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setEmbeddedUrl(null)}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg z-10 transition-colors duration-200"
            >
              Close
            </button>
            <iframe
              ref={iframeRef}
              onLoad={attachIframeInterceptor}
              src={embeddedUrl}
              title="Embedded Site"
              className="w-full h-full rounded-lg border-none"
            />
          </div>
        </div>
      )}
      <AddWebsiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddWebsite}
        categories={categories}
      />
      <div className="content-wrapper">
        <header className="app-header">
          <div>
            <h1 className="main-title">My Websites</h1>
            <p className="subtitle">A personal collection of your projects and favorite sites.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="add-button"
          >
            <PlusIcon className="add-button-icon" />
            Add New
          </button>
        </header>

        <nav className="category-nav">
          <ul className="category-list">
            {['All', ...categories].map(category => (
              <li key={category} className="category-list-item">
                <button
                  onClick={() => setCurrentCategory(category)}
                  className={`category-button ${
                    currentCategory === category ? 'active' : ''
                  }`}
                >
                  {category === 'All' ? '전체' : category}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main>
          {filteredWebsites.length > 0 ? (
            <div className="website-grid">
              {filteredWebsites.map(website => (
                <WebsiteCard
                  key={website.id}
                  website={website}
                  onDelete={handleDeleteWebsite}
                  onOpen={handleOpenEmbedded}
                />
              ))}
            </div>
          ) : (
            <div className="no-websites-message">
              <h2 className="no-websites-title">No websites in this category!</h2>
              <p className="no-websites-text">Try selecting another category or adding a new website.</p>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} 웹사이트라이탄두리치킨. All Rights Reserved.</p>
          <p className="footer-address">주소: 쿠퍼티노 애플 링</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
