
import React, { useState } from 'react';
import CopyIcon from './icons/CopyIcon';
import ExternalLinkIcon from './icons/ExternalLinkIcon';

interface UrlCardProps {
  title: string;
  description: string;
  url: string;
}

const UrlCard: React.FC<UrlCardProps> = ({ title, description, url }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-slate-400 mt-1 mb-4">{description}</p>
      <div className="flex items-center bg-slate-900 rounded-md p-2">
        <input
          type="text"
          value={url}
          readOnly
          className="bg-transparent text-slate-300 w-full outline-none font-mono text-sm"
        />
        <div className="flex items-center ml-2 space-x-1">
          <button
            onClick={copyToClipboard}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition"
            title="Copy URL"
          >
            <CopyIcon className="w-5 h-5" />
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition"
            title="Open in new tab"
          >
            <ExternalLinkIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
       {copied && <p className="text-green-400 text-sm mt-2 text-right">Copied to clipboard!</p>}
    </div>
  );
};

export default UrlCard;
