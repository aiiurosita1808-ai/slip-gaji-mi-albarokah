const fs = require('fs');
let content = fs.readFileSync('src/components/SlipPreview.tsx', 'utf8');

// The replacement mapping
const map = {
  'bg-white': 'bg-[#ffffff]',
  'border-slate-200': 'border-[#e2e8f0]',
  'text-slate-900': 'text-[#0f172a]',
  'border-emerald-600': 'border-[#059669]',
  'bg-slate-100': 'bg-[#f1f5f9]',
  'text-slate-300': 'text-[#cbd5e1]',
  'text-slate-500': 'text-[#64748b]',
  'text-slate-800': 'text-[#1e293b]',
  'text-emerald-700': 'text-[#047857]',
  'text-slate-600': 'text-[#475569]',
  'border-slate-800': 'border-[#1e293b]',
  'border-slate-300': 'border-[#cbd5e1]',
  'bg-slate-50': 'bg-[#f8fafc]',
  'border-slate-900': 'border-[#0f172a]'
};

// Split at id="slip-document" so we only affect the slip itself, not the buttons
const parts = content.split('id="slip-document"');
if (parts.length > 1) {
  let slipContent = parts[1];
  for (const [cls, hex] of Object.entries(map)) {
    const regex = new RegExp(`\\b${cls}\\b`, 'g');
    slipContent = slipContent.replace(regex, hex);
  }
  content = parts[0] + 'id="slip-document"' + slipContent;
  fs.writeFileSync('src/components/SlipPreview.tsx', content);
  console.log("Replaced colors successfully.");
} else {
  console.log("Could not find slip-document.");
}
