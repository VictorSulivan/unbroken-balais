"use client";

import type { MoisStat } from "types/analyse";
import { fmt } from "src/utils/buildMoisStats";


export function GraphiqueMensuel({ mois }: { mois: MoisStat[] }) {
  if (mois.length < 2) {
    return (
      <div className="bg-[#16162a] border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-white/30 uppercase tracking-widest">Évolution par semestre RP</p>
          <RpBadge />
        </div>
        <p className="text-white/20 text-sm py-8 text-center">
          Pas assez de données (2 semestres minimum).
        </p>
      </div>
    );
  }
 
  const W   = 680;
  const H   = 200;
  const PAD = { top: 16, right: 16, bottom: 40, left: 56 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top  - PAD.bottom;
 
  const allValues = mois.flatMap((m) => [m.gains, m.depenses + m.taxes, 0]);
  const maxVal    = Math.max(...allValues, 1);
 
  function xPos(i: number) {
    return PAD.left + (i / (mois.length - 1)) * chartW;
  }
  function yPos(v: number) {
    return PAD.top + chartH - (v / maxVal) * chartH;
  }
 
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    v: maxVal * f,
    y: yPos(maxVal * f),
  }));
 
  // Zone remplie sous la courbe gains
  const gainsPoints = mois.map((m, i) => `${xPos(i)},${yPos(m.gains)}`).join(" ");
  const chargesPoints = mois.map((m, i) => `${xPos(i)},${yPos(m.depenses + m.taxes)}`).join(" ");
  const areaGains =
    `${PAD.left},${PAD.top + chartH} ` + gainsPoints + ` ${xPos(mois.length - 1)},${PAD.top + chartH}`;
  const areaCharges =
    `${PAD.left},${PAD.top + chartH} ` + chargesPoints + ` ${xPos(mois.length - 1)},${PAD.top + chartH}`;
 
  return (
    <div className="bg-[#16162a] border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-white/30 uppercase tracking-widest">
          Évolution par semestre RP
        </p>
        <RpBadge />
      </div>
      <p className="text-[10px] text-white/20 mb-4">
        Chaque colonne = 1 semaine réelle = 1 semestre dans le jeu
      </p>
 
      <div className="flex items-center gap-4 mb-3">
        <Legend color="bg-green-400/60" label="Gains" />
        <Legend color="bg-red-400/50"   label="Charges (dont taxes)" />
      </div>
 
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minWidth: `${Math.max(mois.length * 80, 320)}px` }}
        >
          <defs>
            <linearGradient id="gradGains" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#4ade80" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0"    />
            </linearGradient>
            <linearGradient id="gradCharges" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#f87171" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#f87171" stopOpacity="0"   />
            </linearGradient>
          </defs>
 
          {/* Grille + labels Y */}
          {yTicks.map(({ v, y }) => (
            <g key={v}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
                stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="9"
                fill="rgba(255,255,255,0.25)">
                {v === 0 ? "0" : `$${fmt(v)}`}
              </text>
            </g>
          ))}
 
          {/* Aires */}
          <polygon points={areaGains}   fill="url(#gradGains)"   />
          <polygon points={areaCharges} fill="url(#gradCharges)" />
 
          {/* Lignes */}
          <polyline points={gainsPoints}   fill="none" stroke="#4ade80" strokeWidth="1.5"
            strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={chargesPoints} fill="none" stroke="#f87171" strokeWidth="1.5"
            strokeLinejoin="round" strokeLinecap="round" />
 
          {/* Points + tooltips */}
          {mois.map((m, i) => (
            <g key={`pt-${i}`}>
              <circle cx={xPos(i)} cy={yPos(m.gains)} r="3.5"
                fill="#16162a" stroke="#4ade80" strokeWidth="1.5">
                <title>{`${m.label} — Gains : $${fmt(m.gains)}`}</title>
              </circle>
              <circle cx={xPos(i)} cy={yPos(m.depenses + m.taxes)} r="3.5"
                fill="#16162a" stroke="#f87171" strokeWidth="1.5">
                <title>{`${m.label} — Charges : $${fmt(m.depenses + m.taxes)}`}</title>
              </circle>
            </g>
          ))}
 
          {/* Séparateurs d'années RP (toutes les 2 semaines = 1 an RP) */}
          {mois.map((m, i) => {
            // S2 → prochain est S1 d'une nouvelle année : on trace un séparateur
            const isFinAnnee = m.label.startsWith("S2") && i < mois.length - 1;
            if (!isFinAnnee) return null;
            const x = (xPos(i) + xPos(i + 1)) / 2;
            return (
              <line key={`sep-${i}`} x1={x} x2={x}
                y1={PAD.top} y2={PAD.top + chartH}
                stroke="rgba(168,154,249,0.15)" strokeWidth="1" strokeDasharray="3,3" />
            );
          })}
 
          {/* Labels X (semestres RP) */}
          {mois.map((m, i) => (
            <g key={`lbl-${i}`}>
              <text x={xPos(i)} y={H - 18} textAnchor="middle" fontSize="9"
                fill={m.label.startsWith("S1") ? "rgba(168,154,249,0.7)" : "rgba(255,255,255,0.3)"}>
                {m.label}
              </text>
              {/* Solde net sous le label */}
              <text x={xPos(i)} y={H - 6} textAnchor="middle" fontSize="8"
                fill={m.gains - m.depenses - m.taxes >= 0
                  ? "rgba(74,222,128,0.4)"
                  : "rgba(248,113,113,0.4)"}>
                {m.gains - m.depenses - m.taxes >= 0 ? "+" : ""}
                {fmt(m.gains - m.depenses - m.taxes)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
 
function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-1 rounded-full ${color} inline-block`} />
      <span className="text-xs text-white/30">{label}</span>
    </div>
  );
}
 
function RpBadge() {
  return (
    <span className="text-[10px] text-[#a89af9]/50 border border-[#a89af9]/15 rounded px-1.5 py-0.5">
      Temps RP
    </span>
  );
}