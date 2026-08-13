import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Printer, ArrowLeft } from 'lucide-react';

interface BiodataPreviewProps {
  formData: any;
  biodataOutput: any;
  onBack: () => void;
}

const RASI_TAMIL_NAMES = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி',
  'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்',
];

function buildKattamCells(planetsJson: any) {
  if (!planetsJson) return {};

  const rasiToCell: Record<number, string> = {
    12: '0,0', 1: '1,0', 2: '2,0', 3: '3,0',
    11: '0,1',                      4: '3,1',
    10: '0,2',                      5: '3,2',
     9: '0,3', 8: '1,3', 7: '2,3', 6: '3,3',
  };

  const cellMap: Record<string, any[]> = {};
  Object.values(planetsJson).forEach((p: any) => {
    if (typeof p !== 'object' || p.rasi_no == null) return;
    const key = rasiToCell[p.rasi_no];
    if (!key) return;
    if (!cellMap[key]) cellMap[key] = [];
    cellMap[key].push({ name: p.name, retro: p.retro, full_name: p.full_name });
  });

  return cellMap;
}

// ─── HTML builder for the print/PDF popup window ──────────────────────────

function buildKattamHtml(planets: any, label: string) {
  if (!planets) return '';

  const cellMap = buildKattamCells(planets);
  const cellRasi: Record<string, number> = {
    '0,0': 12, '1,0': 1, '2,0': 2, '3,0': 3,
    '0,1': 11,                     '3,1': 4,
    '0,2': 10,                     '3,2': 5,
    '0,3': 9, '1,3': 8, '2,3': 7, '3,3': 6,
  };

  const isLagna = (col: number, row: number) => {
    const rasi = cellRasi[`${col},${row}`];
    return Object.values(planets || {}).some(
      (p: any) => p?.full_name === 'Ascendant' && p?.rasi_no === rasi
    );
  };

  let cellsHtml = '';
  for (let rIdx = 0; rIdx < 4; rIdx++) {
    for (let cIdx = 0; cIdx < 4; cIdx++) {
      const isCenter = (rIdx === 1 || rIdx === 2) && (cIdx === 1 || cIdx === 2);
      if (isCenter) {
        if (rIdx === 1 && cIdx === 1) {
          cellsHtml += `<div class="kt-cell kt-center">${label}</div>`;
        }
        continue;
      }

      const rasiNo = cellRasi[`${cIdx},${rIdx}`];
      const pList = cellMap[`${cIdx},${rIdx}`] || [];
      const hasLagna = isLagna(cIdx, rIdx);

      cellsHtml += `
        <div class="kt-cell">
          <div class="kt-top">
            <span class="kt-rasi-no">${rasiNo}</span>
            ${hasLagna ? '<span class="kt-lagna">L</span>' : ''}
          </div>
          <div class="kt-planets">
            ${pList.map((p: any) => `<span class="kt-planet">${p.retro ? `${p.name}(R)` : p.name}</span>`).join('')}
          </div>
          <span class="kt-tamil">${RASI_TAMIL_NAMES[rasiNo - 1]}</span>
        </div>`;
    }
  }

  return `
    <div class="kattam-wrap">
      <h4 class="kattam-label">${label}</h4>
      <div class="kattam-grid">${cellsHtml}</div>
    </div>`;
}

function buildBiodataHtml(d: any, isTamil: boolean) {
  const cell = (label: string, value: string) => {
    if (!value) return '';
    return `
      <div class="cell">
        <span class="cell-label">${label}</span>
        <span class="cell-colon">:</span>
        <span class="cell-value">${value}</span>
      </div>`;
  };

  const section = (title: string) => `
    <div class="section-wrap">
      <div class="section-line"></div>
      <span>${title}</span>
      <div class="section-line"></div>
    </div>`;

  const propertyDetails = d.propertyType
    ? `${d.propertyType}${d.propertyLocation ? ', ' + d.propertyLocation : ''}`
    : '';

  const kundliSection = d.kundliData ? `
    ${section(isTamil ? 'ஜோதிட விவரங்கள்' : 'ASTROLOGICAL DETAILS')}
    <div class="grid-2">
      ${cell('Moon Rasi', `${d.kundliData.rasi}${d.kundliData.rasiLord ? ' (Lord: ' + d.kundliData.rasiLord + ')' : ''}`)}
      ${cell('Nakshatra', `${d.kundliData.nakshatra}${d.kundliData.nakshatraPada ? ' Pada ' + d.kundliData.nakshatraPada : ''}`)}
      ${cell('Ascendant', `${d.kundliData.ascendantSign}${d.kundliData.ascendantNakshatra ? ' / ' + d.kundliData.ascendantNakshatra : ''}`)}
    </div>
  ` : '';

  const chartsSection = (d.rasiChart || d.navamsaChart) ? `
    ${section(isTamil ? 'ஜோதிட சக்கரங்கள்' : 'DIVISIONAL CHARTS')}
    <div class="charts-row">
      ${d.rasiChart ? buildKattamHtml(d.rasiChart, isTamil ? 'ராசி (D1)' : 'Rasi Chart (D1)') : ''}
      ${d.navamsaChart ? buildKattamHtml(d.navamsaChart, isTamil ? 'அம்சம் (D9)' : 'Navamsa Chart (D9)') : ''}
    </div>
  ` : '';

  const dashaSection = d.dasha ? `
    ${section(isTamil ? 'தசா புக்தி விவரங்கள்' : 'DASHA INFO')}
    <div class="dasha-row">
      ${d.dasha.birth ? `
        <div class="dasha-box">
          <div class="dasha-title" style="color:#c8980f">Birth Dasha</div>
          <div class="dasha-label">MAHADASHA</div>
          <div class="dasha-value" style="color:#c8980f">${d.dasha.birth.mahadasha ?? ''}</div>
          <div class="dasha-sub">Dasha Bhukthi End Date</div>
          <div class="dasha-date">${d.dasha.birth.date ?? ''}</div>
        </div>` : ''}
      ${d.dasha.current ? `
        <div class="dasha-box">
          <div class="dasha-title" style="color:#7c3aed">Current Dasha</div>
          <div class="dasha-label">MAHADASHA</div>
          <div class="dasha-value" style="color:#7c3aed">${d.dasha.current.mahadasha ?? ''}</div>
          <div class="dasha-sub">Dasha Bhukthi End Date</div>
          <div class="dasha-date">${d.dasha.current.date ?? ''}</div>
        </div>` : ''}
    </div>
  ` : '';

  const expectationSection = `
    ${section(isTamil ? 'எதிர்பார்ப்புகள்' : 'EXPECTATION')}
    ${d.expectation
      ? `<p class="expect-text">${d.expectation}</p>`
      : `<div class="blank-line"></div><div class="blank-line"></div>`}
    ${d.notes ? `
      ${section(isTamil ? 'குறிப்புகள்' : 'NOTES')}
      <p class="expect-text">${d.notes}</p>` : ''}
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; word-wrap: break-word; overflow-wrap: break-word; }
        @page { margin: 10mm; size: A4 portrait; }
        html, body {
          margin: 0 !important;
          padding: 12px !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          max-width: 100%;
          overflow-x: hidden;
        }
        body {
          font-family: Georgia, serif;
          background: #fffdf5;
          font-size: 13px;
          color: #1a1000;
        }
        @media print { html { margin: 0 !important; } }

        /* Card */
        .card {
          border: 5px solid #c8980f;
          padding: 14px;
          background: #fffdf5;
          max-width: 100%;
          overflow: hidden;
        }
        .top-line, .bottom-line { height: 2px; background: #e8c06a; margin: 0 20px 10px; }
        .bottom-line { margin-top: 10px; margin-bottom: 0; }

        /* Title */
        h1.title {
          text-align: center; font-size: 20px; font-weight: 800;
          color: #c8980f; letter-spacing: 3px; margin: 6px 0 4px;
        }
        .reg-no {
          display: block; text-align: center; font-size: 10px;
          color: #8b5c00; letter-spacing: 1px; margin-bottom: 6px;
        }

        /* Section divider */
        .section-wrap {
          display: flex; align-items: center; gap: 8px; margin: 10px 0 6px;
        }
        .section-wrap span {
          font-size: 12px; font-weight: 800; color: #8b5c00;
          letter-spacing: 1.5px; white-space: nowrap;
        }
        .section-line { flex: 1; height: 1px; background: #c8980f; }

        /* Header block: title + section divider on left, photo on right */
        .header-block {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 12px;
          width: 100%;
          margin-bottom: 6px;
        }
        .header-text {
          flex: 1;
          min-width: 0;
        }

        /* Personal block: photo LEFT, grid RIGHT — side by side */
        .personal-block {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 12px;
          width: 100%;
        }
        .photo-box {
          width: 110px;
          flex-shrink: 0;
          border: 2px solid #c8980f;
          border-radius: 4px;
          overflow: hidden;
		  margin-top: 20px;
        }
        .photo-box img { width: 110px; height: 130px; object-fit: cover; display: block; }
        .photo-placeholder {
          width: 110px; height: 130px; background: #f5e8c8;
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; font-size: 11px; color: #c8980f; text-align: center;
        }
        .personal-grid-wrap {
          flex: 1;
          min-width: 0;
        }

        /* 2-col cell grid */
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          width: 100%;
          min-width: 0;
        }
        .cell {
          display: flex;
          align-items: baseline;
          gap: 4px;
          padding: 4px 6px;
          border-bottom: 0.5px solid #e8d5aa;
          font-size: 12px;
          min-width: 0;
          overflow: hidden;
        }
        .cell-label {
          color: #5a3e00;
          font-weight: 700;
          min-width: 75px;
          max-width: 90px;
          flex-shrink: 0;
          font-size: 11px;
        }
        .cell-colon { color: #8b5c00; flex-shrink: 0; }
        .cell-value {
          color: #1a1000;
          flex: 1;
          min-width: 0;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        /* Family uses same cell style in a 2-col layout */
        .family-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          width: 100%;
          min-width: 0;
        }

        /* Charts */
        .charts-row {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          margin: 8px 0;
          width: 100%;
          overflow: hidden;
        }
        .kattam-wrap { width: 260px; max-width: 100%; }
        .kattam-label {
          font-size: 11px; font-weight: 800; text-align: center;
          color: #8b5c00; letter-spacing: 1px; margin-bottom: 4px;
          text-transform: uppercase;
        }
        .kattam-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(4, 1fr);
          border: 1px solid #c8980f55;
          width: 100%;
        }
        .kt-cell {
          border: 0.5px solid #e8d5aa;
          min-height: 52px;
          padding: 3px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-size: 8px;
          overflow: hidden;
        }
        .kt-center {
          grid-column: span 2;
          grid-row: span 2;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 9px;
          font-weight: 800;
          color: #7c3aed;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .kt-top { display: flex; justify-content: space-between; align-items: center; }
        .kt-rasi-no { color: #999; font-weight: 700; font-family: monospace; }
        .kt-lagna {
          color: #c0392b; font-weight: 800;
          border: 0.5px solid #c0392b55;
          border-radius: 2px; padding: 0 2px;
        }
        .kt-planets {
          display: flex; flex-wrap: wrap; gap: 1px;
          justify-content: center; margin: auto 0;
        }
        .kt-planet {
          background: #7c3aed15; color: #6d28d9; font-weight: 700;
          padding: 0 2px; border-radius: 2px; word-break: keep-all;
        }
        .kt-tamil { text-align: center; color: #8b5c00; font-size: 7.5px; }

        /* Dasha */
        .dasha-row { display: flex; gap: 10px; margin: 6px 0; flex-wrap: wrap; }
        .dasha-box {
          flex: 1;
          min-width: 120px;
          border: 1.5px solid #c8980f55;
          border-radius: 8px;
          padding: 10px;
          text-align: center;
          background: rgba(200,152,15,0.04);
        }
        .dasha-title { font-size: 12px; font-weight: 800; text-align: left; margin-bottom: 6px; }
        .dasha-label {
          font-size: 10px; color: #5a3e00; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;
        }
        .dasha-value { font-size: 16px; font-weight: 800; margin-bottom: 6px; }
        .dasha-sub { font-size: 10px; color: #5a3e00; font-weight: 600; margin-bottom: 3px; }
        .dasha-date { font-size: 11px; color: #c0392b; font-style: italic; font-weight: 700; }

        /* Expectation / notes */
        .expect-text {
          font-size: 13px; color: #1a1000; line-height: 1.6;
          margin: 4px 0 8px;
          word-break: break-word; overflow-wrap: break-word;
        }
        .blank-line {
          width: 100%; height: 1px; background: #c8980f;
          opacity: 0.4; margin: 16px 0;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="top-line"></div>
        <h1 class="title">${isTamil ? 'விவர பத்திரிகை' : 'BIODATA'}</h1>
        ${d.registrationNo ? `<span class="reg-no">Reg No: ${d.registrationNo}</span>` : ''}

        <div class="personal-block">
          <div class="photo-box">
            ${d.photo
              ? `<img src="${d.photo}" />`
              : `<div class="photo-placeholder">👤<br/>Photo Not Provided</div>`}
          </div>
          <div class="personal-grid-wrap">
            ${section(isTamil ? 'தனிப்பட்ட விவரங்கள்' : 'PERSONAL DETAILS')}
            <div class="grid-2">
              ${cell('Name', d.name)}
              ${cell('Gender', d.gender)}
              ${cell('Date of Birth', d.dob)}
              ${cell('Time of Birth', d.tob)}
              ${cell('Birth Place', d.birthPlace)}
              ${cell('Religion', d.religion)}
              ${cell('Caste', d.caste)}
              ${cell('Height', d.height)}
              ${cell('Weight', d.weight)}
              ${cell('Complexion', d.complexion)}
              ${cell('Marital Status', d.maritalStatus)}
              ${cell('Native Place', d.nativePlace)}
            </div>
          </div>
        </div>

        ${section(isTamil ? 'கல்வி மற்றும் வேலை' : 'PROFESSIONAL & EDUCATION')}
        <div class="grid-2">
          ${cell('Education', d.education)}
          ${cell('Occupation', d.occupation)}
          ${cell('Monthly Income', d.salary)}
        </div>

        ${section(isTamil ? 'குடும்ப விவரங்கள்' : 'FAMILY DETAILS')}
        <div class="family-grid">
          ${cell("Father's Name",    d.fatherName)}
          ${cell("Mother's Name",    d.motherName)}
          ${cell("Father's Job",     d.fatherOccupation)}
          ${cell("Mother's Job",     d.motherOccupation)}
          ${cell('Siblings',         d.siblings)}
          ${cell('Native Place',     d.nativePlace)}
          ${cell('Property Details', propertyDetails)}
          ${cell('Contact No.',      d.phone)}
          ${cell('Address',          d.address)}
        </div>

        ${kundliSection}
        ${chartsSection}
        ${expectationSection}
        ${dashaSection}

        <div class="bottom-line"></div>
      </div>
    </body>
    </html>
  `;
}

// ─── Local kattam for the in-app preview ──────────────────────────────────

interface LocalKattamProps {
  planets: any;
  label: string;
}

function LocalKattam({ planets, label }: LocalKattamProps) {
  const cellMap = buildKattamCells(planets);

  const cellRasi: Record<string, number> = {
    '0,0': 12, '1,0': 1, '2,0': 2, '3,0': 3,
    '0,1': 11,                     '3,1': 4,
    '0,2': 10,                     '3,2': 5,
    '0,3': 9, '1,3': 8, '2,3': 7, '3,3': 6,
  };

  const isLagna = (col: number, row: number) => {
    const rasi = cellRasi[`${col},${row}`];
    return Object.values(planets || {}).some(
      (p: any) => p?.full_name === 'Ascendant' && p?.rasi_no === rasi
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[260px] max-w-[320px] mx-auto bg-slate-950 border border-violet-500/20 rounded-xl overflow-hidden shadow-2xl p-3">
        <h4 className="text-xs font-bold text-center text-amber-400 mb-2.5 uppercase tracking-wider">
          {label}
        </h4>
        <div className="grid grid-cols-4 grid-rows-4 gap-0.5 bg-gray-800/20">
          {Array.from({ length: 4 }).map((_, rIdx) =>
            Array.from({ length: 4 }).map((_, cIdx) => {
              const isCenter = (rIdx === 1 || rIdx === 2) && (cIdx === 1 || cIdx === 2);
              if (isCenter) {
                if (rIdx === 1 && cIdx === 1) {
                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className="col-span-2 row-span-2 bg-slate-900/60 border border-violet-500/10 flex items-center justify-center p-2 text-center"
                    >
                      <span className="text-[11px] font-serif font-extrabold text-violet-400 uppercase tracking-widest">
                        {label}
                      </span>
                    </div>
                  );
                }
                return null;
              }

              const rasiNo = cellRasi[`${cIdx},${rIdx}`];
              const pList = cellMap[`${cIdx},${rIdx}`] || [];
              const hasLagna = isLagna(cIdx, rIdx);

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="bg-slate-950/90 border border-violet-500/10 p-1 flex flex-col justify-between min-h-[62px] relative"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[8px] text-gray-600 font-bold font-mono">{rasiNo}</span>
                    {hasLagna && (
                      <span className="text-[8px] bg-red-500/10 text-red-400 px-1 rounded border border-red-500/20 font-extrabold">
                        L
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-0.5 justify-center items-center my-auto">
                    {pList.map((p, i) => (
                      <span
                        key={i}
                        className="text-[7.5px] px-1 rounded font-extrabold bg-violet-500/10 text-violet-300 leading-none"
                      >
                        {p.retro ? `${p.name}(R)` : p.name}
                      </span>
                    ))}
                  </div>
                  <span className="text-[8px] text-gray-500 text-center block font-serif leading-none truncate">
                    {RASI_TAMIL_NAMES[rasiNo - 1]}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function BiodataPreview({ formData, biodataOutput, onBack }: BiodataPreviewProps) {
  const { t, isTamil } = useTranslation();

  const d = {
    ...formData,
    dasha:        biodataOutput?.dashaData   || null,
    rasiChart:    biodataOutput?.rasiChart   || null,
    navamsaChart: biodataOutput?.navamsaChart || null,
    kundliData:   biodataOutput?.kundliData  || null,
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(
        isTamil
          ? 'பாப்-அப் தடுக்கப்பட்டது. இந்த தளத்திற்கு பாப்-அப்களை அனுமதிக்கவும்.'
          : 'Popup blocked. Please allow popups for this site.'
      );
      return;
    }

    const html = buildBiodataHtml(d, isTamil);

    const wrappedHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          #toolbar {
            position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
            background: #1a1a2e; display: flex; align-items: center;
            gap: 10px; padding: 10px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          }
          #toolbar .tb-title {
            color: #FFD700; font-family: sans-serif;
            font-size: 15px; font-weight: 700; flex: 1;
          }
          #toolbar button {
            border: none; border-radius: 8px; padding: 8px 18px;
            font-size: 14px; font-weight: 700; cursor: pointer; font-family: sans-serif;
          }
          .btn-print { background: #FFD700; color: #1a1a2e; }
          .btn-close  { background: #444;    color: #fff; }
          #content { margin-top: 56px; }
          @media print {
            #toolbar  { display: none !important; }
            #content  { margin-top: 0 !important; }
          }
        </style>
      </head>
      <body>
        <div id="toolbar">
          <span class="tb-title">${isTamil ? 'விவர பத்திரிகை' : 'Biodata Preview'}</span>
          <button class="btn-print" onclick="window.print()">${isTamil ? 'அச்சிடு' : 'Print'}</button>
          <button class="btn-close"  onclick="window.close()">${isTamil ? 'மூடு'   : 'Close'}</button>
        </div>
        <div id="content">${html}</div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(wrappedHTML);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.focus(); printWindow.print(); };
  };

  // ── row helper for the in-app dark preview ──
  const row = (label: string, value: string) => {
    if (!value) return null;
    return (
      <div className="flex py-2 border-b border-gray-800/40 text-xs min-w-0">
        <span className="w-28 shrink-0 text-gray-400 font-semibold uppercase tracking-wider">
          {label}
        </span>
        <span className="flex-1 text-white font-medium pl-2 break-words min-w-0">{value}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">

      {/* ── Action bar ── */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-900/40 border border-gray-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 border border-gray-800 hover:bg-slate-800 text-gray-300 text-xs font-bold px-3 py-2 rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isTamil ? 'மீண்டும் திருத்த' : 'Back to Edit'}</span>
        </button>

        <button
          onClick={handlePrint}
          className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>{isTamil ? 'அச்சிடு / PDF சேமி' : 'Print / Save PDF'}</span>
        </button>
      </div>

      {/* ── In-app dark preview ── */}
      <div
        id="print-area"
        className="bg-slate-950 border-4 border-amber-500/40 rounded-2xl p-4 md:p-8 space-y-6 shadow-2xl relative overflow-hidden"
      >
        {/* corner ornaments */}
        <div className="absolute top-2 left-2  text-amber-500/20 text-lg select-none">✦</div>
        <div className="absolute top-2 right-2 text-amber-500/20 text-lg select-none">✦</div>
        <div className="absolute bottom-2 left-2  text-amber-500/20 text-lg select-none">✦</div>
        <div className="absolute bottom-2 right-2 text-amber-500/20 text-lg select-none">✦</div>

        {/* heading */}
        <div className="text-center space-y-1">
          <div className="text-red-500 text-xl font-bold">🕉</div>
          <h1 className="text-xl font-serif font-black text-amber-500 uppercase tracking-widest">
            {isTamil ? 'விவர பத்திரிகை' : 'Matrimonial Biodata'}
          </h1>
          {d.registrationNo && (
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono block">
              Reg No: {d.registrationNo}
            </span>
          )}
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
        </div>

        {/* Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* photo */}
          <div className="flex flex-col items-center">
            <div className="w-36 h-44 rounded-xl border-2 border-amber-500/20 bg-slate-900 overflow-hidden shadow-md flex items-center justify-center">
              {d.photo ? (
                <img src={d.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-600 text-xs flex flex-col items-center gap-1.5">
                  <span className="text-3xl">👤</span>
                  <span>Photo Not Provided</span>
                </div>
              )}
            </div>
          </div>

          {/* fields */}
          <div className="md:col-span-2 space-y-1 min-w-0">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest border-b border-gray-800 pb-1.5 mb-2">
              {isTamil ? 'தனிப்பட்ட விவரங்கள்' : 'Personal Information'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 min-w-0">
              {row(isTamil ? 'பெயர்'          : 'Full Name',      d.name)}
              {row(isTamil ? 'பாலினம்'        : 'Gender',         d.gender)}
              {row(isTamil ? 'பிறந்த தேதி'   : 'Date of Birth',  d.dob)}
              {row(isTamil ? 'பிறந்த நேரம்'  : 'Time of Birth',  d.tob)}
              {row(isTamil ? 'பிறந்த இடம்'   : 'Birth Place',    d.birthPlace)}
              {row(isTamil ? 'மதம்'           : 'Religion',       d.religion)}
              {row(isTamil ? 'ஜாதி'           : 'Caste',          d.caste)}
              {row(isTamil ? 'உயரம்'          : 'Height',         d.height)}
              {row(isTamil ? 'எடை'            : 'Weight',         d.weight)}
              {row(isTamil ? 'நிறம்'          : 'Complexion',     d.complexion)}
              {row(isTamil ? 'திருமண நிலை'   : 'Marital Status', d.maritalStatus)}
              {row(isTamil ? 'பூர்வீகம்'     : 'Native Place',   d.nativePlace)}
            </div>
          </div>
        </div>

        {/* Education & Employment */}
        <div className="space-y-1 pt-2 min-w-0">
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest border-b border-gray-800 pb-1.5 mb-2">
            {isTamil ? 'கல்வி மற்றும் வேலை' : 'Professional & Education'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 min-w-0">
            {row(isTamil ? 'கல்வி'   : 'Education',     d.education)}
            {row(isTamil ? 'வேலை'    : 'Occupation',    d.occupation)}
            {row(isTamil ? 'சம்பளம்' : 'Monthly Income', d.salary)}
          </div>
        </div>

        {/* Family details */}
        <div className="space-y-1 pt-2 min-w-0">
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest border-b border-gray-800 pb-1.5 mb-2">
            {isTamil ? 'குடும்ப விவரங்கள்' : 'Family Details'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 min-w-0">
            {row(isTamil ? 'தந்தை பெயர்'  : "Father's Name", d.fatherName)}
            {row(isTamil ? 'தந்தை தொழில்' : "Father's Job",  d.fatherOccupation)}
            {row(isTamil ? 'தாய் பெயர்'   : "Mother's Name", d.motherName)}
            {row(isTamil ? 'தாய் தொழில்'  : "Mother's Job",  d.motherOccupation)}
            {row(isTamil ? 'சகோதரர்கள்'  : 'Siblings',       d.siblings)}
          </div>
        </div>

        {/* Property & Assets */}
        <div className="space-y-1 pt-2 min-w-0">
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest border-b border-gray-800 pb-1.5 mb-2">
            {isTamil ? 'சொத்துக்கள்' : 'Property & Assets'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 min-w-0">
            {row(isTamil ? 'சொத்து வகை' : 'Property Type', d.propertyType)}
            {row(isTamil ? 'சொத்து இடம்' : 'Location',     d.propertyLocation)}
          </div>
        </div>

        {/* Astrological details */}
        {d.kundliData && (
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest border-b border-gray-800 pb-1.5">
              {isTamil ? 'ஜோதிட விவரங்கள்' : 'Astrological Details'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-900/60 border border-gray-800 rounded-xl p-3 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Moon Rasi</span>
                <span className="text-white font-medium break-words">{d.kundliData.rasi}</span>
              </div>
              <div className="bg-slate-900/60 border border-gray-800 rounded-xl p-3 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Star / Nakshatra</span>
                <span className="text-white font-medium break-words">{d.kundliData.nakshatra}</span>
              </div>
              <div className="bg-slate-900/60 border border-gray-800 rounded-xl p-3 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Lagna (Ascendant)</span>
                <span className="text-white font-medium break-words">{d.kundliData.ascendantSign}</span>
              </div>
            </div>
          </div>
        )}

        {/* Divisional charts */}
        {(d.rasiChart || d.navamsaChart) && (
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest border-b border-gray-800 pb-1.5">
              {isTamil ? 'ஜோதிட சக்கரங்கள்' : 'Divisional Charts'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {d.rasiChart    && <LocalKattam planets={d.rasiChart}    label={isTamil ? 'ராசி (D1)'   : 'Rasi Chart (D1)'}    />}
              {d.navamsaChart && <LocalKattam planets={d.navamsaChart} label={isTamil ? 'அம்சம் (D9)' : 'Navamsa Chart (D9)'} />}
            </div>
          </div>
        )}

        {/* Dasha periods */}
        {d.dasha && (
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest border-b border-gray-800 pb-1.5">
              {isTamil ? 'தசா புக்தி விவரங்கள்' : 'Dasha Periods'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {d.dasha.birth && (
                <div className="bg-slate-900/60 border border-amber-500/10 rounded-xl p-4 text-center">
                  <span className="text-[9px] uppercase tracking-widest font-black text-amber-500 block">Birth Dasha</span>
                  <span className="text-lg font-serif font-extrabold text-white block mt-1">{d.dasha.birth.mahadasha}</span>
                  <span className="text-[10px] text-gray-500 block mt-1">End Date: {d.dasha.birth.date}</span>
                </div>
              )}
              {d.dasha.current && (
                <div className="bg-slate-900/60 border border-violet-500/10 rounded-xl p-4 text-center">
                  <span className="text-[9px] uppercase tracking-widest font-black text-violet-400 block">Current Dasha</span>
                  <span className="text-lg font-serif font-extrabold text-white block mt-1">{d.dasha.current.mahadasha}</span>
                  <span className="text-[10px] text-gray-500 block mt-1">End Date: {d.dasha.current.date}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expectations / notes */}
        {(d.expectation || d.notes) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800/60">
            {d.expectation && (
              <div className="space-y-1 min-w-0">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                  {isTamil ? 'எதிர்பார்ப்புகள்' : 'Expectations'}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed italic break-words">{d.expectation}</p>
              </div>
            )}
            {d.notes && (
              <div className="space-y-1 min-w-0">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                  {isTamil ? 'குறிப்புகள்' : 'Additional Notes'}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed italic break-words">{d.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Contact footer */}
        <div className="pt-6 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {d.phone && (
            <div className="min-w-0">
              <span className="text-gray-500 font-bold block uppercase tracking-wider">
                {isTamil ? 'தொடர்பு எண்' : 'Contact Phone'}
              </span>
              <span className="text-white font-medium text-sm mt-0.5 block break-words">{d.phone}</span>
            </div>
          )}
          {d.address && (
            <div className="min-w-0">
              <span className="text-gray-500 font-bold block uppercase tracking-wider">
                {isTamil ? 'முகவரி' : 'Postal Address'}
              </span>
              <span className="text-white font-medium mt-0.5 block break-words">{d.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}