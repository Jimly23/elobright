import React from 'react';

const brands = [
  { name: 'Wildcrafted', logo: '🌐' },
  { name: 'Codecraft_', logo: '🔲' },
  { name: 'Nietzsche', logo: '☀️' },
  { name: 'ImgCompress', logo: '✨' },
  { name: 'Renaissance', logo: 'FR' },
  { name: 'Renaissance', logo: 'FR' },
  { name: 'Convergence', logo: '❄️' },
  { name: 'Epicurious', logo: '🥞' },
];

export default function TrustSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        {/* Title */}
        <h2 className="text-center text-xl md:text-2xl font-medium text-slate-800 mb-12">
          Trusted by leading developers and enterprises
        </h2>

        {/* Logo Grid Container */}
        <div className="relative border-x border-dashed border-gray-200">
          {/* Garis Horizontal Atas */}
          <div className="absolute top-0 left-0 w-full border-t border-dashed border-gray-200" />
          
          <div className="grid grid-cols-2 md:grid-cols-4">
            {brands.map((brand, index) => (
              <div
                key={index}
                className={`
                  group flex items-center justify-center p-8 h-32 
                  border-b border-r border-dashed border-gray-200
                  transition-colors hover:bg-slate-50/50
                  /* Menghapus border kanan pada kolom terakhir di desktop (4 kolom) */
                  ${(index + 1) % 4 === 0 ? 'md:border-r-0' : ''}
                  /* Menghapus border kanan pada kolom terakhir di mobile (2 kolom) */
                  ${(index + 1) % 2 === 0 ? 'border-r-0 md:border-r' : ''}
                `}
              >
                <div className="flex items-center gap-2 grayscale opacity-50 group-hover:opacity-100 group-hover:grayscale-0 transition-all">
                  <span className="text-2xl">{brand.logo}</span>
                  <span className="text-lg font-bold text-slate-700 tracking-tight">
                    {brand.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Decorative Corner Dots (Optional, untuk menambah estetika dashed) */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-gray-200 rounded-full" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-gray-200 rounded-full" />
        </div>
      </div>
    </section>
  );
}