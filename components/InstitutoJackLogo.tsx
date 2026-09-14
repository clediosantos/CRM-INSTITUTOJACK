'use client';

import React from 'react';

interface InstitutoJackLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'seal' | 'horizontal' | 'icon';
  showSlogan?: boolean;
  lightBackground?: boolean;
}

export const InstitutoJackLogo: React.FC<InstitutoJackLogoProps> = ({
  className = '',
  size = 52,
  variant = 'horizontal',
  showSlogan = false,
  lightBackground = false,
}) => {
  // If rendering icon/avatar only:
  if (variant === 'icon') {
    return (
      <div
        className={`relative flex items-center justify-center rounded-2xl bg-white p-1 border border-stone-200 shadow-sm shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 1000 600" fill="none" className="w-full h-full object-contain">
          {/* INSTITUTO */}
          <text
            x="275"
            y="82"
            fontFamily="'Montserrat', sans-serif"
            fontSize="72"
            fontWeight="700"
            letterSpacing="12"
            fill="#8CC63F"
          >
            INSTITUTO
          </text>
          {/* J */}
          <path
            d="M75 14 L265 14 C265 14 263 32 245 35 C205 38 196 65 196 110 L196 355 C196 425 158 480 82 480 C18 480 0 425 0 380 C0 350 20 330 45 330 C68 330 84 348 84 372 C84 398 70 412 52 415 C62 432 85 440 108 440 C145 440 162 405 162 345 L162 108 C162 65 152 38 112 35 C95 32 93 14 75 14 Z"
            fill="#0A0A0A"
          />
          {/* a */}
          <g transform="translate(225, 110)">
            <path
              d="M218 80 C205 70 178 64 148 64 C88 64 25 105 25 198 C25 292 90 338 152 338 C185 338 208 322 220 305 L220 332 L254 332 L254 135 C254 90 236 74 218 80 Z M150 298 C105 298 70 262 70 200 C70 138 105 102 150 102 C195 102 220 138 220 198 C220 260 195 298 150 298 Z"
              fill="#0A0A0A"
            />
            <path
              d="M142 64 C205 64 254 98 254 158 L220 158 C220 120 185 98 142 98 C115 98 90 108 76 122 L55 96 C78 75 110 64 142 64 Z"
              fill="#0A0A0A"
            />
          </g>
          {/* c */}
          <g transform="translate(470, 110)">
            <path
              d="M230 148 L256 125 C232 90 195 64 138 64 C58 64 0 126 0 202 C0 280 58 338 142 338 C202 338 242 305 264 265 L225 240 C210 268 180 292 140 292 C90 292 48 255 48 202 C48 146 90 108 140 108 C182 108 212 128 230 148 Z"
              fill="#0A0A0A"
            />
          </g>
          {/* wave */}
          <path
            d="M25 500 Q 130 455 240 472 Q 355 490 440 518 Q 470 522 492 516 Q 494 513 490 512 Q 390 488 285 464 Q 165 440 25 500 Z"
            fill="#8CC63F"
          />
          {/* Scissor / K */}
          <path d="M778 2 L782 220 L776 345 L764 345 L778 2 Z" fill="#8CC63F" />
          <path d="M778 2 L802 245 L782 345 L776 345 Z" fill="#9CD849" />
          <path d="M764 278 L724 375 L678 418 L640 448 L658 468 L695 432 L744 382 L772 345 Z" fill="#8CC63F" />
          <path d="M814 260 L945 42 C975 6 996 0 1000 0 C1000 0 970 45 918 122 L836 242 Z" fill="#0A0A0A" />
          <path d="M814 260 Q 860 300 905 370 Q 945 435 960 450 L918 450 Q 880 395 832 315 Z" fill="#0A0A0A" />
          <circle cx="778" cy="345" r="7" fill="#8CC63F" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="645" cy="510" r="32" stroke="#8CC63F" strokeWidth="18" fill="none" />
          <circle cx="810" cy="535" r="35" stroke="#8CC63F" strokeWidth="18" fill="none" />
        </svg>
      </div>
    );
  }

  // Full Logo display (used in Banners, Welcome Screens, Large Header)
  if (variant === 'seal') {
    return (
      <div className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white shadow-lg border border-stone-200 ${className}`}>
        <svg
          viewBox="0 0 1000 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          style={{ maxWidth: size, maxHeight: typeof size === 'number' ? size * 0.6 : size }}
        >
          {/* INSTITUTO in light green */}
          <text
            x="275"
            y="82"
            fontFamily="'Montserrat', 'Arial', sans-serif"
            fontSize="64"
            fontWeight="600"
            letterSpacing="14"
            fill="#8CC63F"
          >
            INSTITUTO
          </text>

          {/* Letter J */}
          <path
            d="M75 14 L265 14 C265 14 263 32 245 35 C205 38 196 65 196 110 L196 355 C196 425 158 480 82 480 C18 480 0 425 0 380 C0 350 20 330 45 330 C68 330 84 348 84 372 C84 398 70 412 52 415 C62 432 85 440 108 440 C145 440 162 405 162 345 L162 108 C162 65 152 38 112 35 C95 32 93 14 75 14 Z"
            fill="#080808"
          />
          {/* Gloss overlay on J */}
          <path
            d="M162 140 Q 185 145 196 148 L196 110 C196 85 190 60 178 45 Q 165 95 162 140 Z"
            fill="white"
            opacity="0.22"
          />

          {/* Letter a */}
          <g transform="translate(225, 110)">
            <path
              d="M218 80 C205 70 178 64 148 64 C88 64 25 105 25 198 C25 292 90 338 152 338 C185 338 208 322 220 305 L220 332 L254 332 L254 135 C254 90 236 74 218 80 Z M150 298 C105 298 70 262 70 200 C70 138 105 102 150 102 C195 102 220 138 220 198 C220 260 195 298 150 298 Z"
              fill="#080808"
            />
            <path
              d="M142 64 C205 64 254 98 254 158 L220 158 C220 120 185 98 142 98 C115 98 90 108 76 122 L55 96 C78 75 110 64 142 64 Z"
              fill="#080808"
            />
            <path
              d="M72 175 Q 145 148 220 168 L220 150 Q 145 130 72 152 Z"
              fill="white"
              opacity="0.18"
            />
          </g>

          {/* Letter c */}
          <g transform="translate(470, 110)">
            <path
              d="M230 148 L256 125 C232 90 195 64 138 64 C58 64 0 126 0 202 C0 280 58 338 142 338 C202 338 242 305 264 265 L225 240 C210 268 180 292 140 292 C90 292 48 255 48 202 C48 146 90 108 140 108 C182 108 212 128 230 148 Z"
              fill="#080808"
            />
            <path
              d="M12 175 Q 75 148 150 152 L155 135 Q 75 132 12 158 Z"
              fill="white"
              opacity="0.18"
            />
          </g>

          {/* Dynamic Light Green Wave */}
          <path
            d="M25 500 Q 130 455 240 472 Q 355 490 440 518 Q 470 522 492 516 Q 494 513 490 512 Q 390 488 285 464 Q 165 440 25 500 Z"
            fill="#8CC63F"
          />

          {/* Scissor / K combination */}
          {/* Top Blade */}
          <path d="M778 2 L782 220 L776 345 L764 345 L778 2 Z" fill="#8CC63F" />
          <path d="M778 2 L802 245 L782 345 L776 345 Z" fill="#9BD848" />

          {/* Lower Diagonal Blade */}
          <path d="M764 278 L724 375 L678 418 L640 448 L658 468 L695 432 L744 382 L772 345 Z" fill="#8CC63F" />

          {/* Black K Arms */}
          <path d="M814 260 L945 42 C975 6 996 0 1000 0 C1000 0 970 45 918 122 L836 242 Z" fill="#080808" />
          <path d="M814 260 Q 860 300 905 370 Q 945 435 960 450 L918 450 Q 880 395 832 315 Z" fill="#080808" />

          {/* Pivot Screw */}
          <circle cx="778" cy="345" r="7" fill="#8CC63F" stroke="#FFFFFF" strokeWidth="2" />

          {/* Scissor Finger Loops in light green (#8CC63F) */}
          <g transform="translate(520, 395)">
            <path d="M244 -50 L204 23 L162 60 L145 52 L120 72 L124 84 L142 80 L165 92 L182 72 Z" fill="#8CC63F" />
            <path
              d="M170 82 C196 94 204 126 188 155 C172 184 140 196 114 182 C88 168 80 138 96 108 C112 79 144 68 170 82 Z M158 102 C140 92 118 100 107 120 C96 140 102 162 120 171 C138 180 160 173 171 152 C182 132 176 111 158 102 Z"
              fill="#8CC63F"
            />
            <path d="M86 112 C74 116 54 118 40 126 C36 130 38 138 46 138 C56 138 72 132 82 128 Z" fill="#8CC63F" />
          </g>

          <g transform="translate(750, 420)">
            <path d="M26 -75 L28 40 L45 40 L45 -75 Z" fill="#8CC63F" />
            <path
              d="M60 55 C93 55 120 82 120 115 C120 148 93 175 60 175 C27 175 0 148 0 115 C0 82 27 55 60 55 Z M60 75 C38 75 20 93 20 115 C20 137 38 155 60 155 C82 155 100 137 100 115 C100 93 82 75 60 75 Z"
              fill="#8CC63F"
            />
          </g>
        </svg>
        {showSlogan && (
          <div className="mt-2 text-center">
            <span className="text-xs font-semibold text-stone-600 tracking-wider uppercase font-sans">
              Cuidado que transforma, beleza que realça.
            </span>
          </div>
        )}
      </div>
    );
  }

  // Horizontal variant (default) - Placed cleanly in Navbar, Header, and Cards
  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* Crisp White Badge framing the exact uploaded logo */}
      <div className="bg-white px-2.5 py-1.5 rounded-xl shadow-md border border-white/60 flex items-center justify-center shrink-0 hover:scale-102 transition">
        <svg
          viewBox="0 0 1000 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-auto shrink-0"
          style={{ width: typeof size === 'number' ? size * 1.65 : size }}
        >
          {/* INSTITUTO */}
          <text
            x="275"
            y="82"
            fontFamily="'Montserrat', 'Arial', sans-serif"
            fontSize="68"
            fontWeight="600"
            letterSpacing="14"
            fill="#8CC63F"
          >
            INSTITUTO
          </text>

          {/* J */}
          <path
            d="M75 14 L265 14 C265 14 263 32 245 35 C205 38 196 65 196 110 L196 355 C196 425 158 480 82 480 C18 480 0 425 0 380 C0 350 20 330 45 330 C68 330 84 348 84 372 C84 398 70 412 52 415 C62 432 85 440 108 440 C145 440 162 405 162 345 L162 108 C162 65 152 38 112 35 C95 32 93 14 75 14 Z"
            fill="#080808"
          />

          {/* a */}
          <g transform="translate(225, 110)">
            <path
              d="M218 80 C205 70 178 64 148 64 C88 64 25 105 25 198 C25 292 90 338 152 338 C185 338 208 322 220 305 L220 332 L254 332 L254 135 C254 90 236 74 218 80 Z M150 298 C105 298 70 262 70 200 C70 138 105 102 150 102 C195 102 220 138 220 198 C220 260 195 298 150 298 Z"
              fill="#080808"
            />
            <path
              d="M142 64 C205 64 254 98 254 158 L220 158 C220 120 185 98 142 98 C115 98 90 108 76 122 L55 96 C78 75 110 64 142 64 Z"
              fill="#080808"
            />
          </g>

          {/* c */}
          <g transform="translate(470, 110)">
            <path
              d="M230 148 L256 125 C232 90 195 64 138 64 C58 64 0 126 0 202 C0 280 58 338 142 338 C202 338 242 305 264 265 L225 240 C210 268 180 292 140 292 C90 292 48 255 48 202 C48 146 90 108 140 108 C182 108 212 128 230 148 Z"
              fill="#080808"
            />
          </g>

          {/* Swoosh Wave */}
          <path
            d="M25 500 Q 130 455 240 472 Q 355 490 440 518 Q 470 522 492 516 Q 494 513 490 512 Q 390 488 285 464 Q 165 440 25 500 Z"
            fill="#8CC63F"
          />

          {/* Shears K */}
          <path d="M778 2 L782 220 L776 345 L764 345 L778 2 Z" fill="#8CC63F" />
          <path d="M778 2 L802 245 L782 345 L776 345 Z" fill="#9BD848" />
          <path d="M764 278 L724 375 L678 418 L640 448 L658 468 L695 432 L744 382 L772 345 Z" fill="#8CC63F" />
          <path d="M814 260 L945 42 C975 6 996 0 1000 0 C1000 0 970 45 918 122 L836 242 Z" fill="#080808" />
          <path d="M814 260 Q 860 300 905 370 Q 945 435 960 450 L918 450 Q 880 395 832 315 Z" fill="#080808" />
          <circle cx="778" cy="345" r="7" fill="#8CC63F" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="645" cy="510" r="32" stroke="#8CC63F" strokeWidth="18" fill="none" />
          <circle cx="810" cy="535" r="35" stroke="#8CC63F" strokeWidth="18" fill="none" />
        </svg>
      </div>

      {/* Brand Typography labels */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] tracking-[0.24em] font-bold uppercase font-sans ${lightBackground ? 'text-[#659B28]' : 'text-lime-300'}`}>
            CRM & GESTÃO DA BELEZA
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-serif tracking-wide text-lg sm:text-xl font-extrabold leading-none ${lightBackground ? 'text-stone-900' : 'text-white'}`}>
            Instituto Jack
          </span>
          <span className={`text-[9.5px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold hidden sm:inline-block ${
            lightBackground 
              ? 'bg-[#EBF7DA] text-[#4F7D1B] border border-[#8CC63F]/40' 
              : 'bg-white/20 text-white border border-white/40'
          }`}>
            Oficial
          </span>
        </div>
        {showSlogan && (
          <p className={`text-[10.5px] tracking-wide font-medium mt-0.5 hidden md:block ${lightBackground ? 'text-stone-500' : 'text-emerald-100'}`}>
            Cuidado que transforma, beleza que realça.
          </p>
        )}
      </div>
    </div>
  );
};
