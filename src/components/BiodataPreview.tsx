import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Printer, ArrowLeft, ChevronRight } from 'lucide-react';

interface BiodataPreviewProps {
  formData: any;
  biodataOutput: any;
  onBack: () => void;
  isLight?: boolean;
}

// ─── Shared constants ─────────────────────────────────────────────────────────

const RASI_TAMIL_NAMES = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி',
  'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்',
];

const CELL_RASI: Record<string, number> = {
  '0,0': 12, '1,0': 1, '2,0': 2, '3,0': 3,
  '0,1': 11,                    '3,1': 4,
  '0,2': 10,                    '3,2': 5,
  '0,3':  9, '1,3': 8, '2,3': 7, '3,3': 6,
};

const RASI_TO_CELL: Record<number, string> = Object.fromEntries(
  Object.entries(CELL_RASI).map(([k, v]) => [v, k])
) as any;

// ─── Shared kattam cell builder ───────────────────────────────────────────────

function buildKattamCells(planetsJson: any) {
  if (!planetsJson) return {} as Record<string, any[]>;
  const cellMap: Record<string, any[]> = {};
  Object.values(planetsJson).forEach((p: any) => {
    if (typeof p !== 'object' || p.rasi_no == null) return;
    const key = RASI_TO_CELL[p.rasi_no];
    if (!key) return;
    if (!cellMap[key]) cellMap[key] = [];
    cellMap[key].push({ name: p.name, retro: p.retro, full_name: p.full_name });
  });
  return cellMap;
}

function isLagnaCell(planets: any, col: number, row: number) {
  const rasi = CELL_RASI[`${col},${row}`];
  return Object.values(planets || {}).some(
    (p: any) => p?.full_name === 'Ascendant' && p?.rasi_no === rasi
  );
}

// ─── Shared HTML kattam builder — TABLE-based for mobile print reliability ────
// FIX: kt-top uses TABLE layout instead of flex (flex collapses in Android print)

function buildKattamHtml(planets: any, label: string, cellPx = 58) {
  if (!planets) return '';
  const cellMap = buildKattamCells(planets);

  const ktCell = (col: number, row: number) => {
    const rasiNo = CELL_RASI[`${col},${row}`];
    const pList  = cellMap[`${col},${row}`] || [];
    const hasL   = isLagnaCell(planets, col, row);
    const planets_html = pList.map((p: any) =>
      `<span class="kt-planet">${p.retro ? `${p.name}(R)` : p.name}</span>`
    ).join('');
    return `
      <td class="kt-cell" width="${cellPx}" height="${cellPx}">
        <table class="kt-top-table" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td class="kt-rasi-no">${rasiNo}</td>
            ${hasL ? '<td class="kt-lagna" align="right">L</td>' : '<td></td>'}
          </tr>
        </table>
        <div class="kt-planets">${planets_html}</div>
        <div class="kt-tamil">${RASI_TAMIL_NAMES[rasiNo - 1]}</div>
      </td>`;
  };

  const w = cellPx * 4;
  return `
    <div class="kattam-wrap">
      <div class="kattam-label">${label}</div>
      <table class="kattam-table" width="${w}" cellspacing="0" cellpadding="0">
        <tr>
          ${ktCell(0,0)}${ktCell(1,0)}${ktCell(2,0)}${ktCell(3,0)}
        </tr>
        <tr>
          ${ktCell(0,1)}
          <td class="kt-cell kt-center" rowspan="2" colspan="2" width="${cellPx*2}" height="${cellPx*2}">${label}</td>
          ${ktCell(3,1)}
        </tr>
        <tr>
          ${ktCell(0,2)}
          ${ktCell(3,2)}
        </tr>
        <tr>
          ${ktCell(0,3)}${ktCell(1,3)}${ktCell(2,3)}${ktCell(3,3)}
        </tr>
      </table>
    </div>`;
}

// ─── Shared kattam CSS ────────────────────────────────────────────────────────
// FIX: .kt-top removed (replaced by .kt-top-table in HTML)
// FIX: removed flex from .kattam-wrap; added max-width:100%

const KATTAM_CSS = `
  .kattam-wrap { display: inline-block; vertical-align: top; max-width: 100%; }
  .kattam-label { font-size: 11px; font-weight: 800; text-align: center; color: #8b5c00; letter-spacing: 1px; margin-bottom: 4px; text-transform: uppercase; }
  .kattam-table { border-collapse: collapse; border: 1px solid #c8980f; table-layout: fixed; max-width: 100%; }
  .kt-top-table { border-collapse: collapse; width: 100%; margin-bottom: 2px; }
  .kt-cell { border: 0.5px solid #e8d5aa; padding: 3px; vertical-align: top; font-size: 8px; }
  .kt-center { text-align: center; vertical-align: middle; font-size: 9px; font-weight: 800; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; background: #f9f4e8; }
  .kt-rasi-no { color: #999; font-weight: 700; font-family: monospace; font-size: 7px; text-align: left; padding: 0; }
  .kt-lagna { color: #c0392b; font-weight: 800; border: 0.5px solid #c0392b55; border-radius: 2px; padding: 0 2px; font-size: 7px; text-align: right; white-space: nowrap; }
  .kt-planets { text-align: center; line-height: 1.3; min-height: 16px; }
  .kt-planet { display: inline; background: #7c3aed15; color: #6d28d9; font-weight: 700; padding: 0 1px; border-radius: 2px; font-size: 7.5px; }
  .kt-tamil { text-align: center; color: #8b5c00; font-size: 7px; margin-top: 2px; }
`;

// ─── Model 4 colored kattam CSS ──────────────────────────────────────────────
const KATTAM_CSS_M4 = `
  .kattam-wrap { display: inline-block; vertical-align: top; max-width: 100%; }
  .kattam-label { font-size: 11px; font-weight: 800; text-align: center; color: #8b5c00; letter-spacing: 1px; margin-bottom: 4px; text-transform: uppercase; }
  .kattam-table { border-collapse: collapse; border: 2px solid #e8a000; table-layout: fixed; max-width: 100%; }
  .kt-top-table { border-collapse: collapse; width: 100%; margin-bottom: 2px; }
  .kt-cell { border: 1px solid #f0c030; padding: 3px; vertical-align: top; font-size: 8px; background: #fffde8; }
  .kt-center { text-align: center; vertical-align: middle; font-size: 10px; font-weight: 900; color: #c0392b; text-transform: uppercase; letter-spacing: 1px; background: #fff9d6; border: 1px solid #f0c030; }
  .kt-rasi-no { color: #888; font-weight: 700; font-family: monospace; font-size: 7px; text-align: left; padding: 0; }
  .kt-lagna { color: #c0392b; font-weight: 800; border: 0.5px solid #c0392b55; border-radius: 2px; padding: 0 2px; font-size: 7px; text-align: right; white-space: nowrap; }
  .kt-planets { text-align: center; line-height: 1.3; min-height: 16px; }
  .kt-planet { display: inline; color: #1a3fa0; font-weight: 800; padding: 0 1px; font-size: 7.5px; }
  .kt-tamil { text-align: center; color: #8b5c00; font-size: 7px; margin-top: 2px; }
`;

// ─── Shared section-wrap CSS (table-based, no flex) ──────────────────────────
// FIX: display:table replaces display:flex for print reliability on Android

const SECTION_WRAP_CSS_M1 = `
  .section-wrap { display: table; width: 100%; margin: 10px 0 6px; border-collapse: collapse; }
  .section-wrap span { display: table-cell; font-size: 11px; font-weight: 800; color: #8b5c00; letter-spacing: 1.5px; white-space: nowrap; padding: 0 8px; width: 1%; }
  .section-line { display: table-cell; vertical-align: middle; }
  .section-line::after { content: ''; display: block; height: 1px; background: #c8980f; }
  .section-cell { padding: 0; }
`;

const SECTION_WRAP_CSS_M2 = `
  .section-wrap { display: table; width: 100%; margin: 12px 0 8px; border-collapse: collapse; }
  .section-wrap span { display: table-cell; font-size: 13px; font-weight: 800; color: #8b5c00; letter-spacing: 1.5px; white-space: nowrap; padding: 0 10px; width: 1%; }
  .section-line { display: table-cell; vertical-align: middle; }
  .section-line::after { content: ''; display: block; height: 1px; background: #c8980f; }
  .section-cell { padding: 0; }
`;

const SECTION_WRAP_CSS_M3 = `
  .section-wrap { display: table; width: 100%; margin: 10px 0 6px; border-collapse: collapse; }
  .section-wrap span { display: table-cell; font-size: 11px; font-weight: 800; color: #8b5c00; letter-spacing: 1.5px; white-space: nowrap; padding: 0 8px; width: 1%; }
  .section-line { display: table-cell; vertical-align: middle; }
  .section-line::after { content: ''; display: block; height: 1px; background: #c8980f; }
  .section-cell { padding: 0; }
`;

// ─── In-app kattam component (React, theme-aware) ────────────────────────────

function LocalKattam({ planets, label, isLight = false }: { planets: any; label: string; isLight?: boolean }) {
  const cellMap = buildKattamCells(planets);
  return (
    <div className="w-full overflow-x-auto">
      <div
        className={`min-w-[260px] max-w-[320px] mx-auto border rounded-xl overflow-hidden shadow-2xl p-3 transition-all ${
          isLight
            ? 'bg-white border-amber-500/30 shadow-amber-500/5'
            : 'bg-slate-950 border-violet-500/20'
        }`}
      >
        <h4 className={`text-xs font-bold text-center mb-2.5 uppercase tracking-wider ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>{label}</h4>
        <div className={`grid grid-cols-4 grid-rows-4 gap-0.5 rounded-lg overflow-hidden border ${isLight ? 'bg-amber-500/20 border-amber-500/30' : 'bg-gray-800/20 border-transparent'}`}>
          {Array.from({ length: 4 }).map((_, rIdx) =>
            Array.from({ length: 4 }).map((_, cIdx) => {
              const isCenter = (rIdx === 1 || rIdx === 2) && (cIdx === 1 || cIdx === 2);
              if (isCenter) {
                if (rIdx === 1 && cIdx === 1)
                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`col-span-2 row-span-2 border flex items-center justify-center p-2 text-center ${
                        isLight
                          ? 'bg-gradient-to-br from-amber-100/70 to-orange-100/50 border-amber-500/25'
                          : 'bg-slate-900/60 border-violet-500/10'
                      }`}
                    >
                      <span className={`text-[11px] font-serif font-extrabold uppercase tracking-widest ${isLight ? 'text-amber-900' : 'text-violet-400'}`}>{label}</span>
                    </div>
                  );
                return null;
              }
              const rasiNo = CELL_RASI[`${cIdx},${rIdx}`];
              const pList  = cellMap[`${cIdx},${rIdx}`] || [];
              const hasL   = isLagnaCell(planets, cIdx, rIdx);
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`border p-1 flex flex-col justify-between min-h-[62px] transition-colors ${
                    isLight
                      ? 'bg-white/95 border-amber-500/15 hover:bg-amber-50/50'
                      : 'bg-slate-950/90 border-violet-500/10'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[8px] font-bold font-mono ${isLight ? 'text-amber-900/70' : 'text-gray-600'}`}>{rasiNo}</span>
                    {hasL && (
                      <span
                        className={`text-[8px] px-1 rounded border font-extrabold leading-none ${
                          isLight
                            ? 'bg-red-100 border-red-300 text-red-700'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        L
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-0.5 justify-center items-center my-auto">
                    {pList.map((p, i) => (
                      <span
                        key={i}
                        className={`text-[7.5px] px-1 rounded font-extrabold leading-none ${
                          isLight
                            ? 'bg-violet-100 text-violet-800 border border-violet-200/60'
                            : 'bg-violet-500/10 text-violet-300'
                        }`}
                      >
                        {p.retro ? `${p.name}(R)` : p.name}
                      </span>
                    ))}
                  </div>
                  <span className={`text-[8px] text-center block font-serif leading-none truncate ${isLight ? 'text-amber-800 font-medium' : 'text-gray-500'}`}>{RASI_TAMIL_NAMES[rasiNo - 1]}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODEL 1 — Photo on side, compact layout
// ══════════════════════════════════════════════════════════════════════════════

function buildModel1Html(d: any, isTamil: boolean) {

  const cell = (label: string, value: string) => {
    if (!value) return '';
    return `
      <tr>
        <td class="cell-label">${label}</td>
        <td class="cell-colon">:</td>
        <td class="cell-value">${value}</td>
      </tr>`;
  };

  const cell2 = (l1: string, v1: string, l2: string, v2: string) => {
    const left  = v1 ? `<td class="cell-label">${l1}</td><td class="cell-colon">:</td><td class="cell-value">${v1}</td>` : `<td colspan="3"></td>`;
    const right = v2 ? `<td class="cell-label">${l2}</td><td class="cell-colon">:</td><td class="cell-value">${v2}</td>` : `<td colspan="3"></td>`;
    if (!v1 && !v2) return '';
    return `<tr>${left}${right}</tr>`;
  };

  const section = (title: string) => `
    <tr class="section-row">
      <td colspan="6" class="section-cell">
        <div class="section-wrap">
          <div class="section-line"></div>
          <span>${title}</span>
          <div class="section-line"></div>
        </div>
      </td>
    </tr>`;

  const propertyDetails = d.propertyType
    ? `${d.propertyType}${d.propertyLocation ? ', ' + d.propertyLocation : ''}`
    : '';

  const kundliSection = d.kundliData ? `
    ${section(isTamil ? 'ஜோதிட விவரங்கள்' : 'ASTROLOGICAL DETAILS')}
    ${cell2('Moon Rasi', `${d.kundliData.rasi}${d.kundliData.rasiLord ? ' (Lord: ' + d.kundliData.rasiLord + ')' : ''}`,
            'Nakshatra', `${d.kundliData.nakshatra}${d.kundliData.nakshatraPada ? ' Pada ' + d.kundliData.nakshatraPada : ''}`)}
    ${cell('Ascendant', `${d.kundliData.ascendantSign}${d.kundliData.ascendantNakshatra ? ' / ' + d.kundliData.ascendantNakshatra : ''}`)}
  ` : '';

  // FIX: charts laid out via <table> instead of inline-block inside a div
  const chartsSection = (d.rasiChart || d.navamsaChart) ? `
    <tr><td colspan="6" class="section-cell charts-section">
      <div class="section-wrap"><div class="section-line"></div><span>${isTamil ? 'ஜோதிட சக்கரங்கள்' : 'DIVISIONAL CHARTS'}</span><div class="section-line"></div></div>
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="text-align:center;vertical-align:top;padding:4px 8px 4px 0;">
            ${d.rasiChart    ? buildKattamHtml(d.rasiChart,    isTamil ? 'ராசி (D1)'   : 'Rasi Chart (D1)',   56) : ''}
          </td>
          <td style="text-align:center;vertical-align:top;padding:4px 0 4px 8px;">
            ${d.navamsaChart ? buildKattamHtml(d.navamsaChart, isTamil ? 'அம்சம் (D9)' : 'Navamsa Chart (D9)', 56) : ''}
          </td>
        </tr>
      </table>
    </td></tr>` : '';

  const dashaSection = d.dasha ? `
    <tr><td colspan="6" class="section-cell dasha-section">
      <div class="section-wrap"><div class="section-line"></div><span>${isTamil ? 'தசா புக்தி விவரங்கள்' : 'DASHA INFO'}</span><div class="section-line"></div></div>
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          ${d.dasha.birth ? `
          <td class="dasha-box">
            <div class="dasha-title" style="color:#c8980f">Birth Dasha</div>
            <div class="dasha-label">MAHADASHA</div>
            <div class="dasha-value" style="color:#c8980f">${d.dasha.birth.mahadasha ?? ''}</div>
            <div class="dasha-sub">Dasha Bhukthi End Date</div>
            <div class="dasha-date">${d.dasha.birth.date ?? ''}</div>
          </td>` : ''}
          ${d.dasha.current ? `
          <td class="dasha-box">
            <div class="dasha-title" style="color:#7c3aed">Current Dasha</div>
            <div class="dasha-label">MAHADASHA</div>
            <div class="dasha-value" style="color:#7c3aed">${d.dasha.current.mahadasha ?? ''}</div>
            <div class="dasha-sub">Dasha Bhukthi End Date</div>
            <div class="dasha-date">${d.dasha.current.date ?? ''}</div>
          </td>` : ''}
        </tr>
      </table>
    </td></tr>` : '';

  const expectationSection = `
    <tr><td colspan="6" class="section-cell">
      <div class="section-wrap"><div class="section-line"></div><span>${isTamil ? 'எதிர்பார்ப்புகள்' : 'EXPECTATION'}</span><div class="section-line"></div></div>
      ${d.expectation
        ? `<p class="expect-text">${d.expectation}</p>`
        : `<div class="blank-line"></div><div class="blank-line"></div>`}
      ${d.notes ? `
        <div class="section-wrap"><div class="section-line"></div><span>${isTamil ? 'குறிப்புகள்' : 'NOTES'}</span><div class="section-line"></div></div>
        <p class="expect-text">${d.notes}</p>` : ''}
    </td></tr>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; word-wrap: break-word; overflow-wrap: break-word; }

    /* FIX: @page margin 0 — prevents double-margin on mobile (page margin + body padding) */
    @page { margin: 0; size: A4 portrait; }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body { font-family: Georgia, serif; background: #fffdf5; font-size: 12px; color: #1a1000; }

    /* FIX: scale down on very narrow mobile screens so kattam fits without overflow */
    @media screen and (max-width: 420px) {
      body { font-size: 11px; }
    }

    @media print {
      html, body { margin: 0 !important; padding: 0 !important; }
    }

    .card {
      border: 5px solid #c8980f;
      /* FIX: padding replaces @page margin for spacing */
      padding: 12px 10px;
      background: #fffdf5;
      max-width: 100%;
      overflow-x: hidden;
    }
    .top-line, .bottom-line { height: 2px; background: #e8c06a; margin: 0 20px 10px; }
    .bottom-line { margin-top: 10px; margin-bottom: 0; }

    h1.title { text-align: center; font-size: 20px; font-weight: 800; color: #c8980f; letter-spacing: 3px; margin: 6px 0 4px; }
    .reg-no { display: block; text-align: center; font-size: 10px; color: #8b5c00; letter-spacing: 1px; margin-bottom: 6px; }

    /* FIX: section-wrap uses display:table — no flex (flex collapses in Android Chrome print) */
    ${SECTION_WRAP_CSS_M1}

    /* Photo + personal block */
    .personal-table { width: 100%; border-collapse: collapse; }
    .photo-td { width: 115px; vertical-align: top; padding-right: 10px; padding-top: 22px; }
    .photo-box { width: 110px; border: 2px solid #c8980f; border-radius: 4px; overflow: hidden; }
    .photo-box img { width: 110px; height: 130px; object-fit: cover; display: block; }
    .photo-placeholder { width: 110px; height: 130px; background: #f5e8c8; text-align: center; vertical-align: middle; font-size: 11px; color: #c8980f; }
    .details-td { vertical-align: top; }

    /* Main data table */
    .data-table { width: 100%; border-collapse: collapse; }
    .cell-label { color: #5a3e00; font-weight: 700; font-size: 11px; padding: 4px 4px 4px 6px; border-bottom: 0.5px solid #e8d5aa; white-space: nowrap; width: 22%; }
    .cell-colon { color: #8b5c00; padding: 4px 2px; border-bottom: 0.5px solid #e8d5aa; width: 1%; white-space: nowrap; }
    .cell-value { color: #1a1000; padding: 4px 6px 4px 4px; border-bottom: 0.5px solid #e8d5aa; width: 27%; word-break: break-word; }

    /* Kattam */
    ${KATTAM_CSS}
	
	.charts-section { break-inside: avoid; page-break-inside: avoid; }
	.dasha-section {
	  break-inside: avoid;
	  page-break-inside: avoid;
	}

    /* Dasha */
    .dasha-box { border: 1.5px solid #c8980f55; border-radius: 8px; padding: 10px; text-align: center; background: rgba(200,152,15,0.04); width: 48%; vertical-align: top; }
    .dasha-title { font-size: 12px; font-weight: 800; text-align: left; margin-bottom: 6px; }
    .dasha-label { font-size: 10px; color: #5a3e00; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
    .dasha-value { font-size: 16px; font-weight: 800; margin-bottom: 6px; }
    .dasha-sub { font-size: 10px; color: #5a3e00; font-weight: 600; margin-bottom: 3px; }
    .dasha-date { font-size: 11px; color: #c0392b; font-style: italic; font-weight: 700; }

    .expect-text { font-size: 13px; color: #1a1000; line-height: 1.6; margin: 4px 0 8px; word-break: break-word; }
    .blank-line { width: 100%; height: 1px; background: #c8980f; opacity: 0.4; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="top-line"></div>
    <h1 class="title">${isTamil ? 'விவர பத்திரிகை' : 'BIODATA'}</h1>
    ${d.registrationNo ? `<span class="reg-no">Reg No: ${d.registrationNo}</span>` : ''}

    <!-- Personal block: photo LEFT, data RIGHT -->
    <table class="personal-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="photo-td">
          <div class="photo-box">
            ${d.photo
              ? `<img src="${d.photo}" />`
              : `<table width="110" height="130"><tr><td class="photo-placeholder">👤<br/>Photo Not<br/>Provided</td></tr></table>`}
          </div>
        </td>
        <td class="details-td">
          <div class="section-wrap"><div class="section-line"></div><span>${isTamil ? 'தனிப்பட்ட விவரங்கள்' : 'PERSONAL DETAILS'}</span><div class="section-line"></div></div>
          <table class="data-table" cellspacing="0" cellpadding="0">
            ${cell2(isTamil ? 'பெயர்' : 'Name', d.name, isTamil ? 'பாலினம்' : 'Gender', d.gender)}
            ${cell2(isTamil ? 'பிறந்த தேதி' : 'Date of Birth', d.dob, isTamil ? 'பிறந்த நேரம்' : 'Time of Birth', d.tob)}
            ${cell2(isTamil ? 'பிறந்த இடம்' : 'Birth Place', d.birthPlace, isTamil ? 'மதம்' : 'Religion', d.religion)}
            ${cell2(isTamil ? 'ஜாதி' : 'Caste', d.caste, isTamil ? 'உயரம்' : 'Height', d.height)}
            ${cell2(isTamil ? 'எடை' : 'Weight', d.weight, isTamil ? 'நிறம்' : 'Complexion', d.complexion)}
            ${cell2(isTamil ? 'திருமண நிலை' : 'Marital Status', d.maritalStatus, isTamil ? 'பூர்வீகம்' : 'Native Place', d.nativePlace)}
          </table>
        </td>
      </tr>
    </table>

    <!-- Rest of sections -->
    <table class="data-table" cellspacing="0" cellpadding="0" style="margin-top:6px">
      ${section(isTamil ? 'கல்வி மற்றும் வேலை' : 'PROFESSIONAL & EDUCATION')}
      ${cell2(isTamil ? 'கல்வி' : 'Education', d.education, isTamil ? 'வேலை' : 'Occupation', d.occupation)}
      ${cell(isTamil ? 'சம்பளம்' : 'Monthly Income', d.salary)}

      ${section(isTamil ? 'குடும்ப விவரங்கள்' : 'FAMILY DETAILS')}
      ${cell2(isTamil ? 'தந்தை பெயர்' : "Father's Name", d.fatherName, isTamil ? 'தாய் பெயர்' : "Mother's Name", d.motherName)}
      ${cell2(isTamil ? 'தந்தை தொழில்' : "Father's Job", d.fatherOccupation, isTamil ? 'தாய் தொழில்' : "Mother's Job", d.motherOccupation)}
      ${cell2(isTamil ? 'சகோதரர்கள்' : 'Siblings', d.siblings, isTamil ? 'பூர்வீகம்' : 'Native Place', d.nativePlace)}
      ${cell2(isTamil ? 'சொத்து விவரங்கள்' : 'Property Details', propertyDetails, isTamil ? 'தொடர்பு எண்' : 'Contact No.', d.phone)}
      ${cell(isTamil ? 'முகவரி' : 'Address', d.address)}

      ${kundliSection}
      ${chartsSection}
      ${expectationSection}
      ${dashaSection}
    </table>

    <div class="bottom-line"></div>
  </div>
</body>
</html>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// MODEL 2 — Photo on top, wide elegant layout
// ══════════════════════════════════════════════════════════════════════════════

function buildModel2Html(d: any, isTamil: boolean) {

  const row = (label: string, value: string) => {
    if (!value) return '';
    return `
      <tr>
        <td class="row-label" colspan="3">${label}</td>
        <td class="row-colon">:</td>
        <td class="row-value" colspan="3">${value}</td>
      </tr>`;
  };

  const row2 = (l1: string, v1: string, l2: string, v2: string) => {
    if (!v1 && !v2) return '';
    const left  = v1 ? `<td class="row-label">${l1}</td><td class="row-colon">:</td><td class="row-value half-val">${v1}</td>` : `<td colspan="3"></td>`;
    const right = v2 ? `<td class="row-label">${l2}</td><td class="row-colon">:</td><td class="row-value half-val">${v2}</td>` : `<td colspan="3"></td>`;
    return `<tr>${left}${right}</tr>`;
  };

  const section = (title: string) => `
    <tr class="section-row">
      <td colspan="6" class="section-cell">
        <div class="section-wrap">
          <div class="section-line"></div>
          <span>${title}</span>
          <div class="section-line"></div>
        </div>
      </td>
    </tr>`;

  const propertyDetails = d.propertyType
    ? `${d.propertyType}${d.propertyLocation ? ', ' + d.propertyLocation : ''}`
    : '';

  const kundliSection = d.kundliData ? `
    ${section(isTamil ? 'ஜோதிட விவரங்கள்' : 'ASTROLOGICAL DETAILS')}
    ${row2('Moon Rasi', `${d.kundliData.rasi}${d.kundliData.rasiLord ? ' (Lord: ' + d.kundliData.rasiLord + ')' : ''}`,
           'Nakshatra', `${d.kundliData.nakshatra}${d.kundliData.nakshatraPada ? ' Pada ' + d.kundliData.nakshatraPada : ''}`)}
    ${row('Ascendant', `${d.kundliData.ascendantSign}${d.kundliData.ascendantNakshatra ? ' / ' + d.kundliData.ascendantNakshatra : ''}`)}
  ` : '';

  // FIX: charts side-by-side via <table> instead of inline-block divs
  const chartsSection = (d.rasiChart || d.navamsaChart) ? `
    <tr><td colspan="6" class="section-cell charts-section">
      <div class="section-wrap"><div class="section-line"></div><span>${isTamil ? 'ஜோதிட சக்கரங்கள்' : 'DIVISIONAL CHARTS'}</span><div class="section-line"></div></div>
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="text-align:center;vertical-align:top;padding:5px 10px 5px 0;">
            ${d.rasiChart    ? buildKattamHtml(d.rasiChart,    isTamil ? 'ராசி (D1)'   : 'Rasi Chart (D1)',   60) : ''}
          </td>
          <td style="text-align:center;vertical-align:top;padding:5px 0 5px 10px;">
            ${d.navamsaChart ? buildKattamHtml(d.navamsaChart, isTamil ? 'அம்சம் (D9)' : 'Navamsa Chart (D9)', 60) : ''}
          </td>
        </tr>
      </table>
    </td></tr>` : '';

  const dashaSection = d.dasha ? `
    <tr><td colspan="6" class="section-cell dasha-section">
      <div class="section-wrap"><div class="section-line"></div><span>${isTamil ? 'தசா புக்தி விவரங்கள்' : 'DASHA INFO'}</span><div class="section-line"></div></div>
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          ${d.dasha.birth ? `
          <td class="dasha-box">
            <div class="dasha-title" style="color:#c8980f">Birth Dasha</div>
            <div class="dasha-label2">MAHADASHA</div>
            <div class="dasha-value2" style="color:#c8980f">${d.dasha.birth.mahadasha ?? ''}</div>
            <div class="dasha-sub2">Dasha Bhukthi End Date</div>
            <div class="dasha-date2">${d.dasha.birth.date ?? ''}</div>
          </td>` : ''}
          ${d.dasha.current ? `
          <td class="dasha-box">
            <div class="dasha-title" style="color:#7c3aed">Current Dasha</div>
            <div class="dasha-label2">MAHADASHA</div>
            <div class="dasha-value2" style="color:#7c3aed">${d.dasha.current.mahadasha ?? ''}</div>
            <div class="dasha-sub2">Dasha Bhukthi End Date</div>
            <div class="dasha-date2">${d.dasha.current.date ?? ''}</div>
          </td>` : ''}
        </tr>
      </table>
    </td></tr>` : '';

  const expectationSection = (d.expectation || d.notes) ? `
    <tr><td colspan="6" class="section-cell">
      ${d.expectation ? `
        <div class="section-wrap"><div class="section-line"></div><span>${isTamil ? 'எதிர்பார்ப்புகள்' : 'EXPECTATION'}</span><div class="section-line"></div></div>
        <p class="expect-text">${d.expectation}</p>` : ''}
      ${d.notes ? `
        <div class="section-wrap"><div class="section-line"></div><span>${isTamil ? 'குறிப்புகள்' : 'NOTES'}</span><div class="section-line"></div></div>
        <p class="expect-text">${d.notes}</p>` : ''}
    </td></tr>` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; word-wrap: break-word; overflow-wrap: break-word; }

    /* FIX: @page margin 0 — prevents double-margin on mobile */
    @page { margin: 0; size: A4 portrait; }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body { font-family: Georgia, serif; background: #fffdf5; font-size: 13px; color: #1a1000; }

    @media print {
      html, body { margin: 0 !important; padding: 0 !important; }
    }

    .card {
      border: 5px solid #c8980f;
      /* FIX: card padding replaces @page margin for content breathing room */
      padding: 16px 12px;
      background: #fffdf5;
      max-width: 100%;
      overflow-x: hidden;
    }
    .top-line, .bottom-line { height: 2px; background: #e8c06a; margin: 0 20px 12px; }
    .bottom-line { margin-top: 12px; margin-bottom: 0; }

    h1.title { text-align: center; font-size: 22px; font-weight: 800; color: #c8980f; letter-spacing: 3px; margin: 8px 0 4px; }
    .reg-no { display: block; text-align: center; font-size: 10px; color: #8b5c00; letter-spacing: 1px; margin-bottom: 8px; }

    /* Photo centered on top */
    .photo-center { text-align: center; margin-bottom: 16px; }
    .photo-box2 { display: inline-block; width: 130px; height: 155px; border: 2.5px solid #c8980f; border-radius: 6px; overflow: hidden; vertical-align: top; }
    .photo-box2 img { width: 130px; height: 155px; object-fit: cover; display: block; }
    .photo-placeholder2 { width: 130px; height: 155px; background: #f5e8c8; text-align: center; vertical-align: middle; font-size: 12px; color: #c8980f; display: table-cell; }

    /* FIX: section-wrap uses display:table — no flex */
    ${SECTION_WRAP_CSS_M2}

    /* Data table rows */
    .data-table { width: 100%; border-collapse: collapse; }
    .row-label { color: #5a3e00; font-weight: 700; font-size: 12px; padding: 5px 4px 5px 6px; border-bottom: 0.5px solid #e8d5aa; white-space: nowrap; width: 22%; }
    .row-colon { color: #8b5c00; padding: 5px 3px; border-bottom: 0.5px solid #e8d5aa; width: 1%; white-space: nowrap; }
    .row-value { color: #1a1000; padding: 5px 6px 5px 3px; border-bottom: 0.5px solid #e8d5aa; word-break: break-word; }
    .half-val { width: 27%; }

    /* Charts */
    .charts-section { break-inside: avoid; page-break-inside: avoid; }
	.dasha-section {
	  break-inside: avoid;
	  page-break-inside: avoid;
	}

    /* Kattam */
    ${KATTAM_CSS}

    /* Dasha */
    .dasha-box { border: 1.5px solid #c8980f55; border-radius: 8px; padding: 12px; text-align: center; background: rgba(200,152,15,0.04); width: 48%; vertical-align: top; }
    .dasha-title { font-size: 13px; font-weight: 800; text-align: left; margin-bottom: 8px; }
    .dasha-label2 { font-size: 11px; color: #5a3e00; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .dasha-value2 { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
    .dasha-sub2 { font-size: 11px; color: #5a3e00; font-weight: 600; margin-bottom: 4px; }
    .dasha-date2 { font-size: 12px; color: #c0392b; font-style: italic; font-weight: 700; }

    .expect-text { font-size: 13px; color: #1a1000; line-height: 1.7; margin: 6px 0 10px; word-break: break-word; }
  </style>
</head>
<body>
  <div class="card">
    <div class="top-line"></div>
    <h1 class="title">${isTamil ? 'விவர பத்திரிகை' : 'BIODATA'}</h1>
    ${d.registrationNo ? `<span class="reg-no">Reg No: ${d.registrationNo}</span>` : ''}

    <!-- Photo centered top -->
    <div class="photo-center">
      ${d.photo
        ? `<div class="photo-box2"><img src="${d.photo}" /></div>`
        : `<div class="photo-box2"><table width="130" height="155"><tr><td class="photo-placeholder2">👤<br/>Photo Not Provided</td></tr></table></div>`}
    </div>

    <!-- All content in master data table -->
    <table class="data-table" cellspacing="0" cellpadding="0">
      ${section(isTamil ? 'தனிப்பட்ட விவரங்கள்' : 'PERSONAL DETAILS')}
      ${row2(isTamil ? 'பெயர்' : 'Name', d.name, isTamil ? 'பாலினம்' : 'Gender', d.gender)}
      ${row2(isTamil ? 'பிறந்த தேதி' : 'Date of Birth', d.dob, isTamil ? 'பிறந்த நேரம்' : 'Time of Birth', d.tob)}
      ${row(isTamil ? 'பிறந்த இடம்' : 'Birth Place', d.birthPlace)}
      ${row2(isTamil ? 'மதம்' : 'Religion', d.religion, isTamil ? 'ஜாதி' : 'Caste', d.caste)}
      ${row2(isTamil ? 'உயரம்' : 'Height', d.height, isTamil ? 'எடை' : 'Weight', d.weight)}
      ${row2(isTamil ? 'நிறம்' : 'Complexion', d.complexion, isTamil ? 'திருமண நிலை' : 'Marital Status', d.maritalStatus)}
      ${row(isTamil ? 'பூர்வீகம்' : 'Native Place', d.nativePlace)}

      ${section(isTamil ? 'கல்வி மற்றும் வேலை' : 'PROFESSIONAL & EDUCATION')}
      ${row2(isTamil ? 'கல்வி' : 'Education', d.education, isTamil ? 'வேலை' : 'Occupation', d.occupation)}
      ${row(isTamil ? 'சம்பளம்' : 'Monthly Income', d.salary)}

      ${section(isTamil ? 'குடும்ப விவரங்கள்' : 'FAMILY DETAILS')}
      ${row2(isTamil ? 'தந்தை பெயர்' : "Father's Name", d.fatherName, isTamil ? 'தாய் பெயர்' : "Mother's Name", d.motherName)}
      ${row2(isTamil ? 'தந்தை தொழில்' : "Father's Job", d.fatherOccupation, isTamil ? 'தாய் தொழில்' : "Mother's Job", d.motherOccupation)}
      ${row(isTamil ? 'சகோதரர்கள்' : 'Siblings', d.siblings)}
      ${row(isTamil ? 'சொத்து விவரங்கள்' : 'Property Details', propertyDetails)}
      ${row2(isTamil ? 'தொடர்பு எண்' : 'Contact No.', d.phone, isTamil ? 'முகவரி' : 'Address', d.address)}

      ${kundliSection}
      ${chartsSection}
      ${expectationSection}
      ${dashaSection}
    </table>

    <div class="bottom-line"></div>
  </div>
</body>
</html>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// MODEL 3 — Software report style
// ══════════════════════════════════════════════════════════════════════════════

function buildModel3Html(d: any, isTamil: boolean) {

  const infoRow = (label: string, value: string) => {
    if (!value) return '';
    return `
      <tr>
        <td class="info-label">${label}</td>
        <td class="info-colon">:</td>
        <td class="info-value">${value}</td>
      </tr>`;
  };

  const appName    = d.businessName || 'AstroAyan';
  const appLoc     = d.businessLocation || '';
  const supportBits = [d.website, d.supportPhone].filter(Boolean).join(' / ');
  const footerLine = `Software By ${appName} customer support${supportBits ? `: ${supportBits}` : ''}`;

  const compatList: string[] = Array.isArray(d.kundliData?.compatibleNakshatras)
    ? d.kundliData.compatibleNakshatras
    : (typeof d.kundliData?.compatibleNakshatras === 'string'
        ? d.kundliData.compatibleNakshatras.split(',').map((s: string) => s.trim()).filter(Boolean)
        : []);

  const compatSection = compatList.length ? `
    <div class="compat-box">
      <div class="compat-title">${isTamil ? 'பொருந்தும் நட்சத்திரங்கள்' : 'COMPATIBLE NAKSHATRAS'}</div>
      <div class="compat-list">${compatList.join(', ')}</div>
    </div>` : '';

  const dashaLine1 = d.dasha?.birth
    ? `${isTamil ? 'திசை இருப்பு' : 'Dasha Balance'}: ${d.dasha.birth.mahadasha ?? ''}${d.dasha.birth.date ? ` (${isTamil ? 'வரை' : 'until'} ${d.dasha.birth.date})` : ''}`
    : '';
  const dashaLine2 = d.dasha?.current
    ? `${isTamil ? 'நடப்பு திசை' : 'Current Dasha'}: ${d.dasha.current.mahadasha ?? ''}${d.dasha.current.date ? ` (${isTamil ? 'வரை' : 'until'} ${d.dasha.current.date})` : ''}`
    : '';

  const dashaStrip = (dashaLine1 || dashaLine2) ? `
    <div class="dasha-strip">
      ${dashaLine1 ? `<div>${dashaLine1}</div>` : ''}
      ${dashaLine2 ? `<div>${dashaLine2}</div>` : ''}
    </div>` : '';

  const gotram = [d.caste, d.gotram].filter(Boolean).join(' / ');
  const kulam  = [d.kulam, d.kothram].filter(Boolean).join(' / ');
  const complexionHeight = [d.complexion, d.height].filter(Boolean).join(' / ');
  const rasiNakshatra = [d.kundliData?.nakshatra, d.kundliData?.rasi].filter(Boolean).join(' / ');
  const subpirappu = d.siblings || '';

  const notesArr = [d.expectation, d.notes].filter(Boolean);

  // FIX: charts laid out via <table> instead of display:flex (flex collapses in Android print)
  const chartsSection = (d.rasiChart || d.navamsaChart) ? `
    <table class="charts-row3-table" cellspacing="0" cellpadding="0" width="100%">
      <tr>
        <td style="text-align:center;vertical-align:middle;padding:4px 6px 4px 0;">
          ${d.rasiChart ? buildKattamHtml(d.rasiChart, isTamil ? 'ராசி' : 'RASI', 56) : ''}
        </td>
        <td class="charts-divider3"></td>
        <td style="text-align:center;vertical-align:middle;padding:4px 0 4px 6px;">
          ${d.navamsaChart ? buildKattamHtml(d.navamsaChart, isTamil ? 'அம்சம்' : 'AMSAM', 56) : ''}
        </td>
      </tr>
    </table>` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; word-wrap: break-word; overflow-wrap: break-word; }

    /* FIX: @page margin 0 — prevents double-margin on mobile */
    @page { margin: 0; size: A4 portrait; }

    html, body {
      height: 100%;
      margin: 0 !important;
      padding: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fdf6e3; font-size: 12px; color: #222; }

    @media print {
      html, body { margin: 0 !important; padding: 0 !important; height: 100%; }
    }

    .card3 {
      border: 4px solid #f0c030;
      border-radius: 14px;
      /* FIX: card padding replaces @page margin */
      padding: 16px 18px;
      background: #fffdf7;
      max-width: 100%;
      overflow-x: hidden;
      /* FIX: stretch to occupy the full printable page. Uses height:100%
         (via the html/body/#content height:100% chain) rather than flex,
         since flex collapses in Android print — same reasoning as the
         table-based kattam/section-wrap fixes above. min-height is a
         screen/desktop-print fallback in case the height chain breaks. */
      height: 100%;
      min-height: 100vh;
      box-sizing: border-box;
    }
    @media print {
      .card3 { height: 100%; min-height: 277mm; }
    }
    /* FIX: table-based full-height layout — header/footer auto-size,
       middle row (height=100% via HTML attribute) absorbs remaining
       space. This is the classic table sticky-footer technique and is
       far more reliable than flex across Android print engines. */
    .card3-table { width: 100%; height: 100%; border-collapse: collapse; }
    .card3-top-cell { vertical-align: top; }
    .card3-body-cell { vertical-align: middle; padding: 8px 0; }
    .card3-footer-cell { vertical-align: bottom; }

    .header3 { text-align: center; padding-bottom: 8px; }
    .header3 .app-name { font-size: 19px; font-weight: 800; color: #1a3fa0; }
    .header3 .app-loc  { font-size: 13px; font-weight: 700; color: #1a3fa0; margin-top: 2px; }
    .header3 .app-support { font-size: 10.5px; color: #555; margin-top: 3px; }

    .compat-box { border: 1.5px dashed #2e9e4f; background: #f2fbf3; border-radius: 8px; padding: 8px 12px; margin: 10px 0; text-align: center; }
    .compat-title { font-size: 11px; font-weight: 800; color: #1f7a37; text-decoration: underline; margin-bottom: 4px; }
    .compat-list { font-size: 11.5px; color: #1f4d2b; line-height: 1.5; }

    .dasha-strip { border: 1.5px solid #7fa8e8; background: #eef4ff; border-radius: 8px; padding: 8px 12px; margin: 10px 0; text-align: center; font-size: 11.5px; color: #1a3fa0; font-weight: 700; line-height: 1.6; }

    .main-table3 { width: 100%; border-collapse: collapse; margin-top: 6px; }
    .info-td { vertical-align: top; }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-label { color: #333; font-weight: 700; font-size: 11.5px; padding: 3px 4px 3px 0; white-space: nowrap; width: 30%; vertical-align: top; }
    .info-colon { color: #333; padding: 3px 4px; width: 1%; vertical-align: top; }
    .info-value { color: #111; padding: 3px 0; vertical-align: top; }

    .photo-td3 { width: 130px; vertical-align: top; padding-left: 14px; }
    .photo-box3 { width: 125px; border: 2px solid #f0c030; border-radius: 6px; overflow: hidden; }
    .photo-box3 img { width: 125px; height: 148px; object-fit: cover; display: block; }
    .photo-placeholder3 { width: 125px; height: 148px; background: #f5e8c8; text-align: center; vertical-align: middle; font-size: 11px; color: #c8980f; }

    .notes-text3 { color: #c0392b; font-weight: 800; font-style: italic; font-size: 13px; line-height: 1.5; margin-top: 2px; }

    .phone-row3 { font-size: 13px; font-weight: 800; color: #111; margin-top: 8px; }

    /* FIX: charts-row3 is now a plain <table> via chartsSection HTML — no flex needed */
    .charts-row3-table { width: 100%; border-collapse: collapse; margin: 16px 0 4px; }
    .charts-divider3 { text-align: center; vertical-align: middle; font-size: 26px; width: 36px; white-space: nowrap; }

    /* FIX: section-wrap uses display:table — no flex */
    ${SECTION_WRAP_CSS_M3}

    /* Kattam */
    ${KATTAM_CSS}

    .footer3 { text-align: center; font-size: 10px; color: #555; border-top: 1px solid #f0c030; padding-top: 6px; }
  </style>
</head>
<body>
  <div class="card3">
    <table class="card3-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="card3-top-cell">
          <div class="header3">
            <div class="app-name">${isTamil ? 'மென்பொருள் வழங்குனர்' : 'Software By'} ${appName}</div>
            ${appLoc ? `<div class="app-loc">${appLoc}</div>` : ''}
            ${supportBits ? `<div class="app-support">${supportBits}</div>` : ''}
          </div>
          ${compatSection}
          ${dashaStrip}
        </td>
      </tr>
      <tr height="100%">
        <td class="card3-body-cell">
          <table class="main-table3" cellspacing="0" cellpadding="0">
            <tr>
              <td class="info-td">
                <table class="info-table" cellspacing="0" cellpadding="0">
                  ${infoRow(isTamil ? 'பெயர்' : 'Name', d.name)}
                  ${infoRow(isTamil ? 'பிறந்த தேதி' : 'DOB / Time', [d.dob, d.tob].filter(Boolean).join('   '))}
                  ${infoRow(isTamil ? 'கல்வி' : 'Education', d.education)}
                  ${infoRow(isTamil ? 'வேலை / வருமானம்' : 'Occupation / Income', [d.occupation, d.salary].filter(Boolean).join(' / '))}
                  ${infoRow(isTamil ? 'ஜாதி / பிரிவு' : 'Caste / Sub-caste', gotram)}
                  ${infoRow(isTamil ? 'குலம் / கோத்திரம்' : 'Kulam / Gothram', kulam)}
                  ${infoRow(isTamil ? 'திருமண நிலை' : 'Marital Status', d.maritalStatus)}
                  ${infoRow(isTamil ? 'நட்சத்திரம் / ராசி' : 'Star / Rasi', rasiNakshatra)}
                  ${infoRow(isTamil ? 'லக்னம்' : 'Lagnam', d.kundliData?.ascendantSign)}
                  ${infoRow(isTamil ? 'நிறம் / உயரம்' : 'Complexion / Height', complexionHeight)}
                  ${infoRow(isTamil ? 'தந்தை பெயர்' : "Father's Name", d.fatherName)}
                  ${infoRow(isTamil ? 'தாயார் பெயர்' : "Mother's Name", d.motherName)}
                  ${infoRow(isTamil ? 'தந்தை தொழில்' : "Father's Job", d.fatherOccupation)}
                  ${infoRow(isTamil ? 'தாயார் தொழில்' : "Mother's Job", d.motherOccupation)}
                  ${infoRow(isTamil ? 'உடன்பிறப்பு' : 'Siblings', subpirappu)}
                  ${infoRow(isTamil ? 'முகவரி' : 'Address', d.address)}
                  ${infoRow(isTamil ? 'எதிர்பார்ப்பு' : 'Expectation', d.expectation)}
                  ${infoRow(isTamil ? 'குறிப்பு' : 'Notes', d.notes)}
                  ${infoRow(isTamil ? 'போன்' : 'Phone', d.phone)}
                </table>
              </td>
              <td class="photo-td3">
                <div class="photo-box3">
                  ${d.photo
                    ? `<img src="${d.photo}" />`
                    : `<table width="125" height="148"><tr><td class="photo-placeholder3">👤<br/>Photo Not<br/>Provided</td></tr></table>`}
                </div>
              </td>
            </tr>
          </table>
          ${chartsSection}
        </td>
      </tr>
      <tr>
        <td class="card3-footer-cell">
          <div class="footer3">${footerLine}</div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// Template picker modal
// ══════════════════════════════════════════════════════════════════════════════

type TemplateModel = 1 | 2 | 3;

function TemplatePicker({ isTamil, onSelect, onBack }: {
  isTamil: boolean;
  onSelect: (m: TemplateModel) => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 max-w-3xl mx-auto py-12">
      <div className="text-center space-y-2">
        <div className="text-3xl">🪬</div>
        <h2 className="text-xl font-serif font-black text-amber-400 uppercase tracking-widest">
          {isTamil ? 'வடிவமைப்பை தேர்ந்தெடுக்கவும்' : 'Choose a Biodata Layout'}
        </h2>
        <p className="text-xs text-gray-500">
          {isTamil ? 'இரண்டு மாதிரிகளில் ஒன்றை தேர்வு செய்யவும்' : 'Select one of two designs for your biodata'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
        {/* Model 1 card */}
        <button
          onClick={() => onSelect(1)}
          className="group relative rounded-2xl border-2 border-gray-700 hover:border-amber-500 bg-slate-900/60 hover:bg-slate-800/80 transition-all duration-200 overflow-hidden text-left p-0 cursor-pointer"
        >
          <div className="bg-[#fffdf5] rounded-t-xl mx-2 mt-2 p-3 border border-amber-500/30">
            <div className="text-center text-[9px] font-black text-amber-700 tracking-widest uppercase mb-2">BIODATA</div>
            <div className="flex gap-2 items-start">
              <div className="w-8 h-10 bg-amber-100 border border-amber-400/40 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-[10px]">👤</span>
              </div>
              <div className="flex-1 space-y-1">
                {[70, 50, 85, 60, 75, 55].map((w, i) => (
                  <div key={i} className="h-1 rounded bg-amber-200/60" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {[90, 70, 80].map((w, i) => (
                <div key={i} className="h-0.5 rounded bg-amber-200/40" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
          <div className="p-4 pt-3 flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-black text-white">
                {isTamil ? 'மாதிரி 1' : 'Layout 1'}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                {isTamil ? 'புகைப்படம் இடதுபுறம், விவரங்கள் அருகில் — சுருக்கமான வடிவம்' : 'Photo left, details alongside — compact & traditional'}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform flex-shrink-0 mt-0.5" />
          </div>
        </button>

        {/* Model 2 card */}
        <button
          onClick={() => onSelect(2)}
          className="group relative rounded-2xl border-2 border-gray-700 hover:border-amber-500 bg-slate-900/60 hover:bg-slate-800/80 transition-all duration-200 overflow-hidden text-left p-0 cursor-pointer"
        >
          <div className="bg-[#fffdf5] rounded-t-xl mx-2 mt-2 p-3 border border-amber-500/30">
            <div className="text-center text-[9px] font-black text-amber-700 tracking-widest uppercase mb-2">BIODATA</div>
            <div className="flex justify-center mb-2">
              <div className="w-8 h-10 bg-amber-100 border border-amber-400/40 rounded flex items-center justify-center">
                <span className="text-[10px]">👤</span>
              </div>
            </div>
            <div className="space-y-1">
              {[100, 100, 100, 80, 90].map((w, i) => (
                <div key={i} className="h-0.5 rounded bg-amber-200/60" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
          <div className="p-4 pt-3 flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-black text-white">
                {isTamil ? 'மாதிரி 2' : 'Layout 2'}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                {isTamil ? 'புகைப்படம் மேலே, பரந்த வரிசைகளில் விவரங்கள் — நவீன வடிவம்' : 'Photo centered at top, wide row layout — spacious & modern'}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform flex-shrink-0 mt-0.5" />
          </div>
        </button>

        {/* Model 3 card */}
        <button
          onClick={() => onSelect(3)}
          className="group relative rounded-2xl border-2 border-gray-700 hover:border-amber-500 bg-slate-900/60 hover:bg-slate-800/80 transition-all duration-200 overflow-hidden text-left p-0 cursor-pointer"
        >
          <div className="bg-[#fffdf5] rounded-t-xl mx-2 mt-2 p-3 border border-amber-500/30">
            <div className="border border-dashed border-green-600/50 rounded px-1 py-0.5 mb-1.5">
              <div className="h-0.5 rounded bg-green-500/40 w-3/4 mx-auto" />
            </div>
            <div className="border border-blue-400/40 rounded px-1 py-0.5 mb-1.5 bg-blue-50/40">
              <div className="h-0.5 rounded bg-blue-500/40 w-2/3 mx-auto" />
            </div>
            <div className="flex gap-2 items-start">
              <div className="flex-1 space-y-1">
                {[70, 50, 85, 60, 55].map((w, i) => (
                  <div key={i} className="h-1 rounded bg-amber-200/60" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="w-7 h-9 bg-amber-100 border border-amber-400/40 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-[9px]">👤</span>
              </div>
            </div>
          </div>
          <div className="p-4 pt-3 flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-black text-white">
                {isTamil ? 'மாதிரி 3' : 'Layout 3'}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                {isTamil ? 'திசை பட்டை, வலதுபுறம் புகைப்படம் — அறிக்கை வடிவம்' : 'Dasha strips, photo on right — detailed report style'}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform flex-shrink-0 mt-0.5" />
          </div>
        </button>
      </div>

      <button
        onClick={onBack}
        className="flex items-center gap-2 border border-gray-700 hover:bg-slate-800 text-gray-400 text-xs font-bold px-4 py-2 rounded-lg transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isTamil ? 'மீண்டும் திருத்த' : 'Back to Edit'}</span>
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main export — BiodataPreview
// ══════════════════════════════════════════════════════════════════════════════

export default function BiodataPreview({ formData, biodataOutput, onBack, isLight = false }: BiodataPreviewProps) {
  const { t, isTamil } = useTranslation();
  const [selectedModel, setSelectedModel] = useState<TemplateModel | null>(null);

  const d = {
    ...formData,
    dasha:        biodataOutput?.dashaData    || null,
    rasiChart:    biodataOutput?.rasiChart    || null,
    navamsaChart: biodataOutput?.navamsaChart || null,
    kundliData:   biodataOutput?.kundliData   || null,
  };

  if (!selectedModel) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <TemplatePicker isTamil={isTamil} onSelect={setSelectedModel} onBack={onBack} />
      </div>
    );
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(isTamil
        ? 'பாப்-அப் தடுக்கப்பட்டது. இந்த தளத்திற்கு பாப்-அப்களை அனுமதிக்கவும்.'
        : 'Popup blocked. Please allow popups for this site.');
      return;
    }

    const bodyHtml = selectedModel === 1
      ? buildModel1Html(d, isTamil)
      : selectedModel === 2
      ? buildModel2Html(d, isTamil)
      : buildModel3Html(d, isTamil);

    // FIX: wrapper shell gets its own mobile viewport + print media reset
    // FIX: @media screen narrow → scale content down so it fits without horizontal scroll
    // FIX: @media print → undo scale, hide toolbar, reset margins
    const wrappedHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #f0f0f0; }

    #toolbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
      background: #1a1a2e;
      display: table; width: 100%;
      padding: 10px 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }
    .tb-inner { display: table-row; }
    .tb-title { display: table-cell; color: #FFD700; font-family: sans-serif; font-size: 15px; font-weight: 700; vertical-align: middle; }
    .tb-btns  { display: table-cell; vertical-align: middle; text-align: right; white-space: nowrap; }
    #toolbar button {
      border: none; border-radius: 8px; padding: 8px 18px;
      font-size: 14px; font-weight: 700; cursor: pointer;
      font-family: sans-serif; margin-left: 8px;
    }
    .btn-print { background: #FFD700; color: #1a1a2e; }
    .btn-close  { background: #444; color: #fff; }

    #content { margin-top: 56px; padding: 8px; }

    /* FIX: scale content to fit narrow mobile screens without horizontal overflow */
    @media screen and (max-width: 480px) {
      #content {
        padding: 4px;
        transform-origin: top left;
        transform: scale(0.72);
        width: 139%;   /* compensate: 100 / 0.72 ≈ 139 */
      }
    }
    @media screen and (max-width: 380px) {
      #content {
        padding: 2px;
        transform-origin: top left;
        transform: scale(0.60);
        width: 167%;   /* compensate: 100 / 0.60 ≈ 167 */
      }
    }

    /* FIX: print — undo scale, hide toolbar, no margins */
    @media print {
      #toolbar { display: none !important; }
      html, body { height: 100% !important; }
      #content {
        margin-top: 0 !important;
        padding: 0 !important;
        transform: none !important;
        width: 100% !important;
        height: 100% !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      html, body { background: white !important; }
    }
  </style>
</head>
<body>
  <div id="toolbar">
    <div class="tb-inner">
      <span class="tb-title">${isTamil ? 'விவர பத்திரிகை' : 'Biodata Preview'}</span>
      <span class="tb-btns">
        <button class="btn-print" onclick="window.print()">${isTamil ? 'அச்சிடு' : 'Print'}</button>
        <button class="btn-close"  onclick="window.close()">${isTamil ? 'மூடு' : 'Close'}</button>
      </span>
    </div>
  </div>
  <div id="content">${bodyHtml}</div>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(wrappedHTML);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.focus(); printWindow.print(); };
  };

  const row = (label: string, value: string) => {
    if (!value) return null;
    return (
      <div
        className={`flex py-2 border-b text-xs min-w-0 transition-colors ${
          isLight ? 'border-amber-500/15' : 'border-gray-800/40'
        }`}
      >
        <span
          className={`w-28 shrink-0 font-semibold uppercase tracking-wider ${
            isLight ? 'text-[#7A695A]' : 'text-gray-400'
          }`}
        >
          {label}
        </span>
        <span
          className={`flex-1 font-medium pl-2 break-words min-w-0 ${
            isLight ? 'text-[#2C241E]' : 'text-white'
          }`}
        >
          {value}
        </span>
      </div>
    );
  };

  const sectionTitle = (tamilText: string, englishText: string) => (
    <h3
      className={`text-xs font-black uppercase tracking-widest border-b pb-1.5 mb-2 ${
        isLight
          ? 'text-amber-800 border-amber-500/25'
          : 'text-amber-500 border-gray-800'
      }`}
    >
      {isTamil ? tamilText : englishText}
    </h3>
  );

  return (
    <div className={`space-y-6 mx-auto pb-12 ${selectedModel === 3 ? 'max-w-6xl' : 'max-w-4xl'}`}>

      {/* Action bar */}
      <div
        className={`flex flex-col sm:flex-row justify-between items-center gap-3 rounded-xl p-4 shadow-xl transition-all ${
          isLight
            ? 'bg-white/90 border border-amber-500/20 shadow-amber-500/5'
            : 'bg-slate-900/40 border border-gray-800 backdrop-blur-md'
        }`}
      >
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSelectedModel(null)}
            className={`flex items-center gap-2 border text-xs font-bold px-3 py-2 rounded-lg transition-all ${
              isLight
                ? 'bg-amber-50/80 border-amber-500/30 text-[#5C4F43] hover:bg-amber-100 hover:text-[#1E120A]'
                : 'border-gray-800 hover:bg-slate-800 text-gray-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isTamil ? 'வடிவமைப்பு மாற்று' : 'Change Layout'}</span>
          </button>
          <button
            onClick={onBack}
            className={`flex items-center gap-2 border text-xs font-bold px-3 py-2 rounded-lg transition-all ${
              isLight
                ? 'bg-amber-50/80 border-amber-500/30 text-[#5C4F43] hover:bg-amber-100 hover:text-[#1E120A]'
                : 'border-gray-800 hover:bg-slate-800 text-gray-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isTamil ? 'மீண்டும் திருத்த' : 'Back to Edit'}</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-[10px] font-mono uppercase tracking-widest hidden sm:block ${
              isLight ? 'text-amber-700/70' : 'text-amber-500/70'
            }`}
          >
            {selectedModel === 1
              ? (isTamil ? 'மாதிரி 1 — பக்க புகைப்படம்' : 'Layout 1 — Photo Side')
              : selectedModel === 2
              ? (isTamil ? 'மாதிரி 2 — மேல் புகைப்படம்' : 'Layout 2 — Photo Top')
              : (isTamil ? 'மாதிரி 3 — மென்பொருள் அறிக்கை' : 'Layout 3 — Software Report')}
          </span>
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>{isTamil ? 'அச்சிடு / PDF சேமி' : 'Print / Save PDF'}</span>
          </button>
        </div>
      </div>

      {/* In-app themed preview */}
      <div
        className={`border-4 rounded-2xl p-4 md:p-8 space-y-6 relative overflow-hidden transition-all flex flex-col ${
          selectedModel === 3 ? 'min-h-[1100px]' : ''
        } ${
          isLight
            ? 'bg-[#FFFDF7] border-amber-500/50 shadow-xl text-[#2C241E]'
            : 'bg-slate-950 border-amber-500/40 shadow-2xl text-white'
        }`}
      >
        <div className={`absolute top-2 left-2   text-lg select-none ${isLight ? 'text-amber-500/40' : 'text-amber-500/20'}`}>✦</div>
        <div className={`absolute top-2 right-2  text-lg select-none ${isLight ? 'text-amber-500/40' : 'text-amber-500/20'}`}>✦</div>
        <div className={`absolute bottom-2 left-2  text-lg select-none ${isLight ? 'text-amber-500/40' : 'text-amber-500/20'}`}>✦</div>
        <div className={`absolute bottom-2 right-2 text-lg select-none ${isLight ? 'text-amber-500/40' : 'text-amber-500/20'}`}>✦</div>

        {selectedModel === 3 ? (
          <div className="text-center space-y-1">
            <h1 className={`text-xl font-serif font-black tracking-wide ${isLight ? 'text-blue-900' : 'text-amber-400'}`}>
              {isTamil ? 'மென்பொருள் வழங்குனர்' : 'Software By'} {d.businessName || 'AstroAyan'}
            </h1>
            {d.businessLocation && (
              <div className={`text-sm font-bold ${isLight ? 'text-blue-900' : 'text-amber-400'}`}>{d.businessLocation}</div>
            )}
            {(d.website || d.supportPhone) && (
              <div className={`text-[11px] ${isLight ? 'text-[#7A695A]' : 'text-gray-400'}`}>
                {[d.website, d.supportPhone].filter(Boolean).join(' / ')}
              </div>
            )}
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
          </div>
        ) : (
          <div className="text-center space-y-1">
            <div className="text-red-500 text-xl font-bold">🕉</div>
            <h1 className={`text-xl font-serif font-black uppercase tracking-widest ${isLight ? 'text-amber-800' : 'text-amber-500'}`}>
              {isTamil ? 'விவர பத்திரிகை' : 'Matrimonial Biodata'}
            </h1>
            {d.registrationNo && (
              <span className={`text-[10px] uppercase tracking-widest font-mono block ${isLight ? 'text-[#8B5C00]' : 'text-gray-500'}`}>Reg No: {d.registrationNo}</span>
            )}
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
          </div>
        )}

        {/* MODEL 1: Photo LEFT + details RIGHT */}
        {selectedModel === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-36 h-44 rounded-xl border-2 overflow-hidden shadow-md flex items-center justify-center ${
                  isLight ? 'border-amber-500/30 bg-amber-50/70' : 'border-amber-500/20 bg-slate-900'
                }`}
              >
                {d.photo ? <img src={d.photo} alt="Profile" className="w-full h-full object-cover" />
                  : (
                    <div className={`text-center text-xs flex flex-col items-center gap-1.5 ${isLight ? 'text-amber-800' : 'text-gray-600'}`}>
                      <span className="text-3xl">👤</span><span>Photo Not Provided</span>
                    </div>
                  )}
              </div>
            </div>
            <div className="md:col-span-2 space-y-1 min-w-0">
              {sectionTitle('தனிப்பட்ட விவரங்கள்', 'Personal Information')}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 min-w-0">
                {row(isTamil ? 'பெயர்'         : 'Full Name',      d.name)}
                {row(isTamil ? 'பாலினம்'       : 'Gender',         d.gender)}
                {row(isTamil ? 'பிறந்த தேதி'  : 'Date of Birth',  d.dob)}
                {row(isTamil ? 'பிறந்த நேரம்' : 'Time of Birth',  d.tob)}
                {row(isTamil ? 'பிறந்த இடம்'  : 'Birth Place',    d.birthPlace)}
                {row(isTamil ? 'மதம்'          : 'Religion',       d.religion)}
                {row(isTamil ? 'ஜாதி'          : 'Caste',          d.caste)}
                {row(isTamil ? 'உயரம்'         : 'Height',         d.height)}
                {row(isTamil ? 'எடை'           : 'Weight',         d.weight)}
                {row(isTamil ? 'நிறம்'         : 'Complexion',     d.complexion)}
                {row(isTamil ? 'திருமண நிலை'  : 'Marital Status', d.maritalStatus)}
                {row(isTamil ? 'பூர்வீகம்'    : 'Native Place',   d.nativePlace)}
              </div>
            </div>
          </div>
        )}

        {/* MODEL 2: Photo TOP */}
        {selectedModel === 2 && (
          <>
            <div className="flex justify-center pt-2">
              <div
                className={`w-36 h-44 rounded-xl border-2 overflow-hidden shadow-md flex items-center justify-center ${
                  isLight ? 'border-amber-500/30 bg-amber-50/70' : 'border-amber-500/20 bg-slate-900'
                }`}
              >
                {d.photo ? <img src={d.photo} alt="Profile" className="w-full h-full object-cover" />
                  : (
                    <div className={`text-center text-xs flex flex-col items-center gap-1.5 ${isLight ? 'text-amber-800' : 'text-gray-600'}`}>
                      <span className="text-3xl">👤</span><span>Photo Not Provided</span>
                    </div>
                  )}
              </div>
            </div>
            <div className="space-y-1 min-w-0">
              {sectionTitle('தனிப்பட்ட விவரங்கள்', 'Personal Information')}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 min-w-0">
                {row(isTamil ? 'பெயர்'         : 'Full Name',      d.name)}
                {row(isTamil ? 'பாலினம்'       : 'Gender',         d.gender)}
                {row(isTamil ? 'பிறந்த தேதி'  : 'Date of Birth',  d.dob)}
                {row(isTamil ? 'பிறந்த நேரம்' : 'Time of Birth',  d.tob)}
                {row(isTamil ? 'பிறந்த இடம்'  : 'Birth Place',    d.birthPlace)}
                {row(isTamil ? 'மதம்'          : 'Religion',       d.religion)}
                {row(isTamil ? 'ஜாதி'          : 'Caste',          d.caste)}
                {row(isTamil ? 'உயரம்'         : 'Height',         d.height)}
                {row(isTamil ? 'எடை'           : 'Weight',         d.weight)}
                {row(isTamil ? 'நிறம்'         : 'Complexion',     d.complexion)}
                {row(isTamil ? 'திருமண நிலை'  : 'Marital Status', d.maritalStatus)}
                {row(isTamil ? 'பூர்வீகம்'    : 'Native Place',   d.nativePlace)}
              </div>
            </div>
          </>
        )}

        {/* MODEL 3: Software report — compat/dasha strips, details LEFT + photo RIGHT */}
        {selectedModel === 3 && (
          <>
            <div className="text-center space-y-2 pt-2">
              {d.kundliData?.compatibleNakshatras && (
                <div
                  className={`inline-block border border-dashed rounded-lg px-4 py-2 text-[10px] font-semibold ${
                    isLight ? 'border-green-500/50 bg-green-500/10 text-green-700' : 'border-green-500/40 bg-green-500/5 text-green-400'
                  }`}
                >
                  {isTamil ? 'பொருந்தும் நட்சத்திரங்கள்' : 'Compatible Nakshatras'}:{' '}
                  {Array.isArray(d.kundliData.compatibleNakshatras)
                    ? d.kundliData.compatibleNakshatras.join(', ')
                    : d.kundliData.compatibleNakshatras}
                </div>
              )}
              {(d.dasha?.birth || d.dasha?.current) && (
                <div
                  className={`border rounded-lg px-4 py-2 text-[10px] font-semibold space-y-0.5 ${
                    isLight ? 'border-blue-500/40 bg-blue-500/10 text-blue-800' : 'border-blue-500/30 bg-blue-500/5 text-blue-300'
                  }`}
                >
                  {d.dasha?.birth && <div>{isTamil ? 'திசை இருப்பு' : 'Dasha Balance'}: {d.dasha.birth.mahadasha} {d.dasha.birth.date ? `(${isTamil ? 'வரை' : 'until'} ${d.dasha.birth.date})` : ''}</div>}
                  {d.dasha?.current && <div>{isTamil ? 'நடப்பு திசை' : 'Current Dasha'}: {d.dasha.current.mahadasha} {d.dasha.current.date ? `(${isTamil ? 'வரை' : 'until'} ${d.dasha.current.date})` : ''}</div>}
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-6 pt-2 items-start">
              <div className="flex-1 w-full space-y-1 min-w-0">
                {sectionTitle('தனிப்பட்ட விவரங்கள்', 'Personal Information')}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 min-w-0">
                  {row(isTamil ? 'பெயர்'            : 'Name',                 d.name)}
                  {row(isTamil ? 'பிறந்த தேதி'     : 'DOB / Time',           [d.dob, d.tob].filter(Boolean).join('  '))}
                  {row(isTamil ? 'கல்வி'            : 'Education',            d.education)}
                  {row(isTamil ? 'வேலை / வருமானம்' : 'Occupation / Income',  [d.occupation, d.salary].filter(Boolean).join(' / '))}
                  {row(isTamil ? 'ஜாதி / பிரிவு'   : 'Caste / Sub-caste',    [d.caste, d.gotram].filter(Boolean).join(' / '))}
                  {row(isTamil ? 'குலம் / கோத்திரம்' : 'Kulam / Gothram',   [d.kulam, d.kothram].filter(Boolean).join(' / '))}
                  {row(isTamil ? 'திருமண நிலை'     : 'Marital Status',       d.maritalStatus)}
                  {row(isTamil ? 'நட்சத்திரம் / ராசி' : 'Star / Rasi',      [d.kundliData?.nakshatra, d.kundliData?.rasi].filter(Boolean).join(' / '))}
                  {row(isTamil ? 'லக்னம்'           : 'Lagnam',               d.kundliData?.ascendantSign)}
                  {row(isTamil ? 'நிறம் / உயரம்'   : 'Complexion / Height',  [d.complexion, d.height].filter(Boolean).join(' / '))}
                  {row(isTamil ? 'தந்தை பெயர்'     : "Father's Name",        d.fatherName)}
                  {row(isTamil ? 'தாயார் பெயர்'    : "Mother's Name",        d.motherName)}
                  {row(isTamil ? 'தந்தை தொழில்'    : "Father's Job",         d.fatherOccupation)}
                  {row(isTamil ? 'தாயார் தொழில்'   : "Mother's Job",         d.motherOccupation)}
                  {row(isTamil ? 'உடன்பிறப்பு'     : 'Siblings',             d.siblings)}
                  {row(isTamil ? 'முகவரி'           : 'Address',              d.address)}
                  {row(isTamil ? 'எதிர்பார்ப்பு'   : 'Expectation',          d.expectation)}
                  {row(isTamil ? 'குறிப்பு'         : 'Notes',                d.notes)}
                  {row(isTamil ? 'போன்'             : 'Phone',                d.phone)}
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-col items-center self-start">
                <div
                  className={`w-32 h-40 rounded-xl border-2 overflow-hidden shadow-md flex items-center justify-center ${
                    isLight ? 'border-amber-500/30 bg-amber-50/70' : 'border-amber-500/20 bg-slate-900'
                  }`}
                >
                  {d.photo ? <img src={d.photo} alt="Profile" className="w-full h-full object-cover" />
                    : (
                      <div className={`text-center text-xs flex flex-col items-center gap-1.5 ${isLight ? 'text-amber-800' : 'text-gray-600'}`}>
                        <span className="text-3xl">👤</span><span>Photo Not Provided</span>
                      </div>
                    )}
                </div>
              </div>
            </div>

          </>
        )}

        {/* Sections common to models 1 & 2 */}
        {selectedModel !== 3 && (
        <div className="space-y-1 pt-2 min-w-0">
          {sectionTitle('கல்வி மற்றும் வேலை', 'Professional & Education')}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 min-w-0">
            {row(isTamil ? 'கல்வி'   : 'Education',      d.education)}
            {row(isTamil ? 'வேலை'    : 'Occupation',     d.occupation)}
            {row(isTamil ? 'சம்பளம்' : 'Monthly Income', d.salary)}
          </div>
        </div>
        )}

        {selectedModel !== 3 && (
        <div className="space-y-1 pt-2 min-w-0">
          {sectionTitle('குடும்ப விவரங்கள்', 'Family Details')}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 min-w-0">
            {row(isTamil ? 'தந்தை பெயர்'  : "Father's Name",    d.fatherName)}
            {row(isTamil ? 'தந்தை தொழில்' : "Father's Job",     d.fatherOccupation)}
            {row(isTamil ? 'தாய் பெயர்'   : "Mother's Name",    d.motherName)}
            {row(isTamil ? 'தாய் தொழில்'  : "Mother's Job",     d.motherOccupation)}
            {row(isTamil ? 'சகோதரர்கள்'  : 'Siblings',          d.siblings)}
          </div>
        </div>
        )}

        <div className="space-y-1 pt-2 min-w-0">
          {sectionTitle('சொத்துக்கள்', 'Property & Assets')}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 min-w-0">
            {row(isTamil ? 'சொத்து வகை'  : 'Property Type', d.propertyType)}
            {row(isTamil ? 'சொத்து இடம்' : 'Location',      d.propertyLocation)}
          </div>
        </div>

        {d.kundliData && selectedModel !== 3 && (
          <div className="space-y-4 pt-2">
            {sectionTitle('ஜோதிட விவரங்கள்', 'Astrological Details')}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className={`rounded-xl p-3 space-y-1 border transition-all ${isLight ? 'bg-amber-50/70 border-amber-500/20 shadow-sm' : 'bg-slate-900/60 border-gray-800'}`}>
                <span className={`text-[10px] uppercase font-black tracking-wider block ${isLight ? 'text-[#7A695A]' : 'text-gray-500'}`}>Moon Rasi</span>
                <span className={`font-medium break-words ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>{d.kundliData.rasi}</span>
              </div>
              <div className={`rounded-xl p-3 space-y-1 border transition-all ${isLight ? 'bg-amber-50/70 border-amber-500/20 shadow-sm' : 'bg-slate-900/60 border-gray-800'}`}>
                <span className={`text-[10px] uppercase font-black tracking-wider block ${isLight ? 'text-[#7A695A]' : 'text-gray-500'}`}>Star / Nakshatra</span>
                <span className={`font-medium break-words ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>{d.kundliData.nakshatra}</span>
              </div>
              <div className={`rounded-xl p-3 space-y-1 border transition-all ${isLight ? 'bg-amber-50/70 border-amber-500/20 shadow-sm' : 'bg-slate-900/60 border-gray-800'}`}>
                <span className={`text-[10px] uppercase font-black tracking-wider block ${isLight ? 'text-[#7A695A]' : 'text-gray-500'}`}>Lagna (Ascendant)</span>
                <span className={`font-medium break-words ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>{d.kundliData.ascendantSign}</span>
              </div>
            </div>
          </div>
        )}

        {(d.rasiChart || d.navamsaChart) && (
          <div className="space-y-4 pt-2">
            {sectionTitle('ஜோதிட சக்கரங்கள்', 'Divisional Charts')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {d.rasiChart    && <LocalKattam planets={d.rasiChart}    label={isTamil ? 'ராசி (D1)'   : 'Rasi Chart (D1)'}    isLight={isLight} />}
              {d.navamsaChart && <LocalKattam planets={d.navamsaChart} label={isTamil ? 'அம்சம் (D9)' : 'Navamsa Chart (D9)'} isLight={isLight} />}
            </div>
          </div>
        )}

        {d.dasha && selectedModel !== 3 && (
          <div className="space-y-4 pt-2">
            {sectionTitle('தசா புக்தி விவரங்கள்', 'Dasha Periods')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {d.dasha.birth && (
                <div className={`border rounded-xl p-4 text-center transition-all ${isLight ? 'bg-amber-50/80 border-amber-500/25 shadow-sm' : 'bg-slate-900/60 border-amber-500/10'}`}>
                  <span className={`text-[9px] uppercase tracking-widest font-black block ${isLight ? 'text-amber-800' : 'text-amber-500'}`}>Birth Dasha</span>
                  <span className={`text-lg font-serif font-extrabold block mt-1 ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>{d.dasha.birth.mahadasha}</span>
                  <span className={`text-[10px] block mt-1 ${isLight ? 'text-[#7A695A]' : 'text-gray-500'}`}>End Date: {d.dasha.birth.date}</span>
                </div>
              )}
              {d.dasha.current && (
                <div className={`border rounded-xl p-4 text-center transition-all ${isLight ? 'bg-violet-50/80 border-violet-500/25 shadow-sm' : 'bg-slate-900/60 border-violet-500/10'}`}>
                  <span className={`text-[9px] uppercase tracking-widest font-black block ${isLight ? 'text-violet-800' : 'text-violet-400'}`}>Current Dasha</span>
                  <span className={`text-lg font-serif font-extrabold block mt-1 ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>{d.dasha.current.mahadasha}</span>
                  <span className={`text-[10px] block mt-1 ${isLight ? 'text-[#7A695A]' : 'text-gray-500'}`}>End Date: {d.dasha.current.date}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {(d.expectation || d.notes) && selectedModel !== 3 && (
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t ${isLight ? 'border-amber-500/20' : 'border-gray-800/60'}`}>
            {d.expectation && (
              <div className="space-y-1 min-w-0">
                <h4 className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-amber-800' : 'text-amber-500'}`}>{isTamil ? 'எதிர்பார்ப்புகள்' : 'Expectations'}</h4>
                <p className={`text-xs leading-relaxed italic break-words ${isLight ? 'text-[#2C241E]' : 'text-gray-400'}`}>{d.expectation}</p>
              </div>
            )}
            {d.notes && (
              <div className="space-y-1 min-w-0">
                <h4 className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-amber-800' : 'text-amber-500'}`}>{isTamil ? 'குறிப்புகள்' : 'Additional Notes'}</h4>
                <p className={`text-xs leading-relaxed italic break-words ${isLight ? 'text-[#2C241E]' : 'text-gray-400'}`}>{d.notes}</p>
              </div>
            )}
          </div>
        )}

        <div className={`pt-6 border-t grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs ${isLight ? 'border-amber-500/25' : 'border-amber-500/20'}`}>
          {d.phone && selectedModel !== 3 && (
            <div className="min-w-0">
              <span className={`font-bold block uppercase tracking-wider ${isLight ? 'text-[#7A695A]' : 'text-gray-500'}`}>{isTamil ? 'தொடர்பு எண்' : 'Contact Phone'}</span>
              <span className={`font-medium text-sm mt-0.5 block break-words ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>{d.phone}</span>
            </div>
          )}
          {d.address && selectedModel !== 3 && (
            <div className="min-w-0">
              <span className={`font-bold block uppercase tracking-wider ${isLight ? 'text-[#7A695A]' : 'text-gray-500'}`}>{isTamil ? 'முகவரி' : 'Postal Address'}</span>
              <span className={`font-medium mt-0.5 block break-words ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>{d.address}</span>
            </div>
          )}
        </div>

        {selectedModel === 3 && (
          <div
            style={{ marginTop: 'auto' }}
            className={`text-center text-[10px] pt-3 border-t ${isLight ? 'border-amber-500/25 text-[#7A695A]' : 'border-amber-500/20 text-gray-500'}`}
          >
            {isTamil ? 'மென்பொருள் வழங்குனர்' : 'Software By'} {d.businessName || 'AstroAyan'}
            {isTamil ? ' வாடிக்கையாளர் ஆதரவு' : ' customer support'}
            {(d.website || d.supportPhone) ? `: ${[d.website, d.supportPhone].filter(Boolean).join(' / ')}` : ''}
          </div>
        )}
      </div>
    </div>
  );
}