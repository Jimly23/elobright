import React from 'react';

const brands = [
  { name: 'Wildcrafted', logo: 'WC' },
  { name: 'Codecraft_', logo: 'CC' },
  { name: 'Nietzsche', logo: 'NI' },
  { name: 'ImgCompress', logo: 'IC' },
  { name: 'Renaissance', logo: 'FR' },
  { name: 'Convergence', logo: 'CV' },
  { name: 'Epicurious', logo: 'EP' },
];

function BrandRow({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="trust-marquee-group" aria-hidden={hidden || undefined}>
      {brands.map((brand) => (
        <div
          key={brand.name}
          className="group flex h-24 w-56 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_14px_36px_rgba(37,99,235,0.10)]"
        >
          <div className="flex items-center gap-3 grayscale opacity-55 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600">
              {brand.logo}
            </span>
            <span className="text-base font-bold tracking-tight text-slate-700">
              {brand.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TrustSection() {
  return (
    <section className="overflow-hidden bg-white py-20">
      <div className="mx-auto mb-10 max-w-5xl px-4">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
          Our trusted partners
        </p>
        <h2 className="text-center text-xl font-medium text-slate-800 md:text-2xl">
          Trusted by leading developers and enterprises
        </h2>
      </div>

      <div className="trust-marquee relative" aria-label="Trusted companies">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-32" />
        <div className="trust-marquee-track">
          <BrandRow />
          <BrandRow hidden />
        </div>
      </div>
    </section>
  );
}
