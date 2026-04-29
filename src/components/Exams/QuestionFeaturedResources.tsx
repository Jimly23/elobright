import React from 'react';

// Helper to resolve media URLs
export const resolveMediaUrl = (url: string | null) => {
  if (!url) return "";
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;

  // Get API URL from env, default to local if not set
  const baseUrl = (url.includes('cdn') ? process.env.NEXT_PUBLIC_API_URL_CDN : process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:3001';
  // Remove trailing slash and append leading slash if needed
  return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

interface QuestionFeaturedResourcesProps {
  imageUrl?: string | null;
  narrativeText?: string | null;
}

export default function QuestionFeaturedResources({ imageUrl, narrativeText }: QuestionFeaturedResourcesProps) {
  if (!imageUrl && !narrativeText) return null;

  return (
    <div className="w-full flex flex-col gap-6 mb-6">
      {imageUrl && (
        <div className="w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveMediaUrl(imageUrl)}
            alt="Question reference"
            className="max-w-full h-auto max-h-[400px] object-contain"
          />
        </div>
      )}

      {narrativeText && (
        <div className="w-full bg-blue-50/30 border border-blue-100 p-6 rounded-2xl">
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm md:text-base text-left">
            {narrativeText.split('\n').map((paragraph, idx) => (
              paragraph.trim() ? <p key={idx} className="mb-4 last:mb-0 text-left">{paragraph}</p> : null
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
