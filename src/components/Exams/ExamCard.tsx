import React, { ReactNode } from 'react';

interface ExamCardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string; 
  headerClassName?: string; 
  contentClassName?: string;
}

export default function ExamCard({
  title,
  subtitle,
  children,
  className = "max-w-3xl md:max-h-[90vh]", // default sizing
  headerClassName = "h-28 md:h-36 pb-4 md:pb-6", // default header sizing
  contentClassName = "p-6 md:p-8", // default content padding
}: ExamCardProps) {
  return (
    <div className={`relative z-10 w-full bg-white/40 backdrop-blur-xl border-none md:border border-white/60 rounded-none md:rounded-[28px] shadow-none md:shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden flex flex-col h-full ${className}`}>
      
      {/* Card Header: Sky Image & Text */}
      {(title || subtitle) && (
        <div className={`bg-gradient-to-b from-blue-200/50 to-transparent border-b border-white/50 relative flex flex-col items-center justify-end shrink-0 ${headerClassName}`}>
          <div
            className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/clouds.png')]"
            style={{ backgroundRepeat: 'repeat-x', backgroundPosition: 'center' }}
          />
          {title && (
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 relative z-10 leading-tight tracking-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-slate-600 text-xs md:text-sm font-medium mt-1 md:mt-2 relative z-10">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Card Content Area */}
      <div className={`overflow-y-auto custom-scrollbar flex-1 flex flex-col ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}
