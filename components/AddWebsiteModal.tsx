
import React, { useState, useEffect } from 'react';

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, url: string, category: string) => void;
  categories: string[];
}

const AddWebsiteModal: React.FC<AddWebsiteModalProps> = ({ isOpen, onClose, onSave, categories }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setUrl('');
      setCategory(categories[0] || '');
    }
  }, [isOpen, categories]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (name.trim() && url.trim() && category) {
      onSave(name, url, category);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Add a New Website</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="website-name" className="block text-sm font-medium text-slate-300 mb-1">
                Website Name
              </label>
              <input
                type="text"
                id="website-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-700 text-white rounded-md border border-slate-600 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="e.g., My Awesome Project"
                required
              />
            </div>
            <div>
              <label htmlFor="website-url" className="block text-sm font-medium text-slate-300 mb-1">
                URL
              </label>
              <input
                type="text"
                id="website-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-700 text-white rounded-md border border-slate-600 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="https://example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="website-category" className="block text-sm font-medium text-slate-300 mb-1">
                Category
              </label>
              <select
                id="website-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-700 text-white rounded-md border border-slate-600 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition disabled:bg-indigo-800 disabled:cursor-not-allowed"
              disabled={!name.trim() || !url.trim() || !category}
            >
              Save Website
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWebsiteModal;
