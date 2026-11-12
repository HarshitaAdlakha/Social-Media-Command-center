import React from "react";

interface WindowFrameProps {
  title: string;
  badge?: string;
  accent?: boolean;
  mintBody?: boolean;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  title,
  badge,
  accent = false,
  mintBody = false,
  headerRight,
  children,
  className = "",
}) => {
  return (
    <div
      className={`border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex flex-col ${
        mintBody ? "bg-[#77FCA4]" : "bg-white"
      } text-[#111111] ${className}`}
    >
      <div
        className={`h-7 px-2.5 border-b-2 border-[#111111] flex items-center justify-between gap-2 select-none ${
          mintBody ? "bg-white" : accent ? "bg-[#FFC0D0]" : "bg-[#FFC0D0]"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="w-2.5 h-2.5 border border-[#111111] bg-white shrink-0" />
          <div className="hidden sm:block flex-1 mac-titlebar-stripes opacity-55" />
          <span className="font-mono text-[10px] font-extrabold tracking-wider uppercase text-[#111111] whitespace-nowrap truncate px-1">
            {title}
          </span>
          <div className="hidden sm:block flex-1 mac-titlebar-stripes opacity-55" />
          {badge && (
            <span className="font-mono text-[9px] font-bold bg-[#111111] text-[#F78DA7] px-1.5 py-0.5 whitespace-nowrap shrink-0">
              {badge}
            </span>
          )}
        </div>
        {headerRight && (
          <div className="flex items-center gap-1.5 shrink-0">{headerRight}</div>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
};
