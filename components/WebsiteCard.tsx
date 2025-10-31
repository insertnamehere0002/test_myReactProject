
import React from 'react';
import { Website } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface WebsiteCardProps {
  website: Website;
  onDelete: (id: string) => void;
}

const WebsiteCard: React.FC<WebsiteCardProps> = ({ website, onDelete }) => {
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="group relative bg-slate-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-indigo-500/30 hover:-translate-y-1">
      <div className="relative">
        <img className="w-full h-48 object-cover" src={website.imageUrl} alt={`Screenshot of ${website.name}`} />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300"></div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-white truncate">{website.name}</h3>
        {isValidUrl(website.url) ? (
          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200 mt-1 block truncate text-sm"
          >
            {website.url}
          </a>
        ) : (
          <p className="text-slate-400 mt-1 block truncate text-sm">{website.url}</p>
        )}
      </div>
      <button
        onClick={() => onDelete(website.id)}
        className="absolute top-3 right-3 bg-red-600/70 hover:bg-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110"
        aria-label={`Delete ${website.name}`}
      >
        <TrashIcon />
      </button>
    </div>
  );
};

export default WebsiteCard;
