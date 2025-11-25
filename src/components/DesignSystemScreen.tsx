import { ChevronRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export function DesignSystemScreen() {
  return (
    <div className="overflow-auto size-full bg-white">
      <div className="max-w-[1400px] mx-auto px-[60px] py-[40px]">
        
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-[32px] font-semibold text-[#101828] tracking-[-0.02em] mb-2">Design System</h1>
          <p className="text-[14px] text-[#6a7282]">Core design tokens and components for the provider disputes platform</p>
        </div>

        {/* Brand & Logo Section */}
        <section className="mb-16">
          <h2 className="text-[18px] font-semibold text-[#101828] tracking-[-0.02em] mb-6">Brand & Logo</h2>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Primary Logo */}
            <div className="border border-gray-200 rounded-lg p-8 bg-white">
              <div className="size-[48px] rounded-lg bg-[#101828] flex items-center justify-center mb-3">
                <span className="text-white text-[14px] font-normal">GP</span>
              </div>
              <span className="text-[20px] font-semibold text-[#101828] tracking-[-0.02em]">Lorelin</span>
              <p className="text-[11px] text-[#99A1AF] mt-4">Primary logo · Use on light backgrounds (navigation, headers)</p>
            </div>

            {/* Inverse Logo */}
            <div className="border border-gray-700 rounded-lg p-8 bg-[#101828]">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white rounded-full size-[40px] flex items-center justify-center">
                  <span className="text-[#101828] text-[14px] font-normal">GP</span>
                </div>
                <span className="text-[20px] font-semibold text-white tracking-[-0.02em]">Lorelin</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-4">Inverse logo · Use on dark backgrounds (modals, marketing)</p>
            </div>
          </div>
        </section>

        {/* Color Palette Section */}
        <section className="mb-16">
          <h2 className="text-[18px] font-semibold text-[#101828] tracking-[-0.02em] mb-6">Color Palette</h2>
          
          {/* Neutrals */}
          <div className="mb-8">
            <h3 className="text-[14px] font-medium text-[#101828] mb-4">Neutrals</h3>
            <div className="grid grid-cols-7 gap-4">
              {[
                { name: 'Neutral/0', hex: '#FFFFFF', token: '--color-neutral-0' },
                { name: 'Neutral/50', hex: '#F9FAFB', token: '--color-neutral-50' },
                { name: 'Neutral/100', hex: '#F3F4F6', token: '--color-neutral-100' },
                { name: 'Neutral/200', hex: '#E5E7EB', token: '--color-neutral-200' },
                { name: 'Neutral/400', hex: '#9CA3AF', token: '--color-neutral-400' },
                { name: 'Neutral/700', hex: '#374151', token: '--color-neutral-700' },
                { name: 'Neutral/950', hex: '#101828', token: '--color-neutral-950' },
              ].map((color) => (
                <div key={color.name}>
                  <div 
                    className="w-full h-[64px] rounded-lg border border-gray-200 mb-2"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="text-[11px] font-medium text-[#101828] mb-0.5">{color.name}</div>
                  <div className="text-[10px] text-[#6a7282] mb-1">{color.hex}</div>
                  <div className="text-[9px] text-[#99A1AF] font-mono">{color.token}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Brand / Primary */}
          <div className="mb-8">
            <h3 className="text-[14px] font-medium text-[#101828] mb-4">Brand / Primary</h3>
            <div className="grid grid-cols-7 gap-4">
              {[
                { name: 'Primary/50', hex: '#DCFCF3', token: '--color-primary-50', desc: 'Hover backgrounds' },
                { name: 'Primary/500', hex: '#0C5E47', token: '--color-primary-500', desc: 'Main brand color' },
                { name: 'Primary/700', hex: '#047857', token: '--color-primary-700', desc: 'Active states' },
              ].map((color) => (
                <div key={color.name}>
                  <div 
                    className="w-full h-[64px] rounded-lg border border-gray-200 mb-2"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="text-[11px] font-medium text-[#101828] mb-0.5">{color.name}</div>
                  <div className="text-[10px] text-[#6a7282] mb-1">{color.hex}</div>
                  <div className="text-[9px] text-[#99A1AF] font-mono mb-1">{color.token}</div>
                  <div className="text-[9px] text-[#99A1AF] italic">{color.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic Colors */}
          <div className="mb-8">
            <h3 className="text-[14px] font-medium text-[#101828] mb-4">Semantic</h3>
            <div className="grid grid-cols-3 gap-6">
              {/* Success */}
              <div>
                <div className="text-[12px] font-medium text-[#101828] mb-3">Success</div>
                <div className="space-y-3">
                  {[
                    { name: 'Success/50', hex: '#ECFDF5', token: '--color-success-50' },
                    { name: 'Success/500', hex: '#10B981', token: '--color-success-500' },
                    { name: 'Success/700', hex: '#047857', token: '--color-success-700' },
                  ].map((color) => (
                    <div key={color.name} className="flex items-center gap-3">
                      <div 
                        className="w-[48px] h-[48px] rounded-lg border border-gray-200 flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div>
                        <div className="text-[11px] font-medium text-[#101828]">{color.name}</div>
                        <div className="text-[10px] text-[#6a7282]">{color.hex}</div>
                        <div className="text-[9px] text-[#99A1AF] font-mono">{color.token}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[#99A1AF] mt-3 italic">Used for "Recovered" states and positive revenue numbers</p>
              </div>

              {/* Warning */}
              <div>
                <div className="text-[12px] font-medium text-[#101828] mb-3">Warning</div>
                <div className="space-y-3">
                  {[
                    { name: 'Warning/50', hex: '#FFFBEB', token: '--color-warning-50' },
                    { name: 'Warning/500', hex: '#F59E0B', token: '--color-warning-500' },
                    { name: 'Warning/700', hex: '#B45309', token: '--color-warning-700' },
                  ].map((color) => (
                    <div key={color.name} className="flex items-center gap-3">
                      <div 
                        className="w-[48px] h-[48px] rounded-lg border border-gray-200 flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div>
                        <div className="text-[11px] font-medium text-[#101828]">{color.name}</div>
                        <div className="text-[10px] text-[#6a7282]">{color.hex}</div>
                        <div className="text-[9px] text-[#99A1AF] font-mono">{color.token}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[#99A1AF] mt-3 italic">Used for "At risk" states and approaching deadlines</p>
              </div>

              {/* Destructive */}
              <div>
                <div className="text-[12px] font-medium text-[#101828] mb-3">Destructive</div>
                <div className="space-y-3">
                  {[
                    { name: 'Destructive/50', hex: '#FEF2F2', token: '--color-destructive-50' },
                    { name: 'Destructive/500', hex: '#EF4444', token: '--color-destructive-500' },
                    { name: 'Destructive/700', hex: '#B91C1C', token: '--color-destructive-700' },
                  ].map((color) => (
                    <div key={color.name} className="flex items-center gap-3">
                      <div 
                        className="w-[48px] h-[48px] rounded-lg border border-gray-200 flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div>
                        <div className="text-[11px] font-medium text-[#101828]">{color.name}</div>
                        <div className="text-[10px] text-[#6a7282]">{color.hex}</div>
                        <div className="text-[9px] text-[#99A1AF] font-mono">{color.token}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[#99A1AF] mt-3 italic">Used for critical urgency and error states</p>
              </div>
            </div>
          </div>

          {/* Chart Colors */}
          <div>
            <h3 className="text-[14px] font-medium text-[#101828] mb-4">Chart Colors</h3>
            <div className="grid grid-cols-7 gap-4">
              {[
                { name: 'Chart/Recovered', hex: '#10B981', token: '--color-chart-recovered', desc: 'Success color' },
                { name: 'Chart/OnTable', hex: '#D1D5DB', token: '--color-chart-on-table', desc: 'Neutral gray' },
              ].map((color) => (
                <div key={color.name}>
                  <div 
                    className="w-full h-[64px] rounded-lg border border-gray-200 mb-2"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="text-[11px] font-medium text-[#101828] mb-0.5">{color.name}</div>
                  <div className="text-[10px] text-[#6a7282] mb-1">{color.hex}</div>
                  <div className="text-[9px] text-[#99A1AF] font-mono mb-1">{color.token}</div>
                  <div className="text-[9px] text-[#99A1AF] italic">{color.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-16">
          <h2 className="text-[18px] font-semibold text-[#101828] tracking-[-0.02em] mb-6">Typography</h2>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Display */}
            <div className="border-b border-gray-200 p-6 bg-white">
              <div className="text-[42px] font-semibold text-[#101828] tracking-[-0.02em] leading-[1.1] mb-3">
                $83,400
              </div>
              <div className="grid grid-cols-5 gap-4 text-[11px]">
                <div>
                  <div className="text-[#99A1AF] mb-1">Name</div>
                  <div className="text-[#101828] font-medium">Text/Display</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Size</div>
                  <div className="text-[#101828] font-medium">42px</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Weight</div>
                  <div className="text-[#101828] font-medium">600 (Semibold)</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Line height</div>
                  <div className="text-[#101828] font-medium">1.1</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Usage</div>
                  <div className="text-[#101828]">Large KPI numbers</div>
                </div>
              </div>
            </div>

            {/* H1 */}
            <div className="border-b border-gray-200 p-6 bg-gray-50/30">
              <div className="text-[32px] font-semibold text-[#101828] tracking-[-0.02em] mb-3">
                Today
              </div>
              <div className="grid grid-cols-5 gap-4 text-[11px]">
                <div>
                  <div className="text-[#99A1AF] mb-1">Name</div>
                  <div className="text-[#101828] font-medium">Text/H1</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Size</div>
                  <div className="text-[#101828] font-medium">32px</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Weight</div>
                  <div className="text-[#101828] font-medium">600 (Semibold)</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Line height</div>
                  <div className="text-[#101828] font-medium">1.2</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Usage</div>
                  <div className="text-[#101828]">Page titles</div>
                </div>
              </div>
            </div>

            {/* H2 */}
            <div className="border-b border-gray-200 p-6 bg-white">
              <div className="text-[18px] font-semibold text-[#101828] tracking-[-0.02em] mb-3">
                Cases to act on
              </div>
              <div className="grid grid-cols-5 gap-4 text-[11px]">
                <div>
                  <div className="text-[#99A1AF] mb-1">Name</div>
                  <div className="text-[#101828] font-medium">Text/H2</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Size</div>
                  <div className="text-[#101828] font-medium">18px</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Weight</div>
                  <div className="text-[#101828] font-medium">600 (Semibold)</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Line height</div>
                  <div className="text-[#101828] font-medium">1.3</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Usage</div>
                  <div className="text-[#101828]">Section titles</div>
                </div>
              </div>
            </div>

            {/* Label */}
            <div className="border-b border-gray-200 p-6 bg-gray-50/30">
              <div className="text-[10px] text-[#99A1AF] tracking-[0.05em] uppercase font-medium mb-3">
                POTENTIAL RECOVERY · LAST 90 DAYS
              </div>
              <div className="grid grid-cols-5 gap-4 text-[11px]">
                <div>
                  <div className="text-[#99A1AF] mb-1">Name</div>
                  <div className="text-[#101828] font-medium">Text/Label</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Size</div>
                  <div className="text-[#101828] font-medium">10px</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Weight</div>
                  <div className="text-[#101828] font-medium">500 (Medium)</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Transform</div>
                  <div className="text-[#101828] font-medium">Uppercase, 0.05em</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Usage</div>
                  <div className="text-[#101828]">Section labels, metadata</div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="border-b border-gray-200 p-6 bg-white">
              <div className="text-[13px] text-[#101828] tracking-[-0.15px] mb-3">
                The patient was seen on March 4, 2025 for a breast reconstruction procedure.
              </div>
              <div className="grid grid-cols-5 gap-4 text-[11px]">
                <div>
                  <div className="text-[#99A1AF] mb-1">Name</div>
                  <div className="text-[#101828] font-medium">Text/Body</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Size</div>
                  <div className="text-[#101828] font-medium">13px</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Weight</div>
                  <div className="text-[#101828] font-medium">400 (Regular)</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Letter spacing</div>
                  <div className="text-[#101828] font-medium">-0.15px</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Usage</div>
                  <div className="text-[#101828]">Default text in cards, tables</div>
                </div>
              </div>
            </div>

            {/* Caption */}
            <div className="p-6 bg-gray-50/30">
              <div className="text-[11px] text-[#99A1AF] mb-3">
                These data points are referenced in the IDR position statement.
              </div>
              <div className="grid grid-cols-5 gap-4 text-[11px]">
                <div>
                  <div className="text-[#99A1AF] mb-1">Name</div>
                  <div className="text-[#101828] font-medium">Text/Caption</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Size</div>
                  <div className="text-[#101828] font-medium">11px</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Weight</div>
                  <div className="text-[#101828] font-medium">400 (Regular)</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Color</div>
                  <div className="text-[#101828] font-medium">#99A1AF</div>
                </div>
                <div>
                  <div className="text-[#99A1AF] mb-1">Usage</div>
                  <div className="text-[#101828]">Helper text, tooltips, chart labels</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing, Layout & Radius Section */}
        <section className="mb-16">
          <h2 className="text-[18px] font-semibold text-[#101828] tracking-[-0.02em] mb-6">Spacing, Layout & Radius</h2>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Spacing Scale */}
            <div>
              <h3 className="text-[14px] font-medium text-[#101828] mb-4">Spacing Scale</h3>
              <div className="space-y-3">
                {[
                  { token: 'space-1', px: '4px' },
                  { token: 'space-2', px: '8px' },
                  { token: 'space-3', px: '12px' },
                  { token: 'space-4', px: '16px' },
                  { token: 'space-6', px: '24px' },
                  { token: 'space-8', px: '32px' },
                ].map((space) => (
                  <div key={space.token} className="flex items-center gap-4">
                    <div className="w-[80px] text-[11px] text-[#6a7282] font-mono">{space.token}</div>
                    <div className="w-[60px] text-[11px] text-[#101828]">{space.px}</div>
                    <div 
                      className="h-[24px] bg-blue-500 rounded"
                      style={{ width: space.px }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Radius */}
            <div>
              <h3 className="text-[14px] font-medium text-[#101828] mb-4">Border Radius</h3>
              <div className="space-y-3">
                {[
                  { name: 'Radius/sm', value: '4px', usage: 'Chips, status pills' },
                  { name: 'Radius/md', value: '8px', usage: 'Buttons, inputs' },
                  { name: 'Radius/lg', value: '14px', usage: 'Cards, large containers' },
                  { name: 'Radius/full', value: '9999px', usage: 'Circular avatars, dots' },
                ].map((radius) => (
                  <div key={radius.name} className="flex items-center gap-4">
                    <div className="w-[80px] text-[11px] text-[#6a7282] font-mono">{radius.name}</div>
                    <div className="w-[60px] text-[11px] text-[#101828]">{radius.value}</div>
                    <div 
                      className="w-[64px] h-[40px] bg-gray-200 border border-gray-300"
                      style={{ borderRadius: radius.value }}
                    />
                    <div className="text-[11px] text-[#99A1AF] italic">{radius.usage}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Elevation */}
          <div className="mt-8">
            <h3 className="text-[14px] font-medium text-[#101828] mb-4">Elevation & Borders</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-3">
                  <div className="text-[13px] text-[#101828]">Card with border only</div>
                </div>
                <p className="text-[11px] text-[#99A1AF]">
                  <span className="font-medium text-[#101828]">Border only:</span> Use for nested cards or when subtle separation is needed
                </p>
              </div>
              <div>
                <div className="bg-white border border-gray-100 rounded-lg p-6 mb-3 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
                  <div className="text-[13px] text-[#101828]">Card with border + shadow</div>
                </div>
                <p className="text-[11px] text-[#99A1AF]">
                  <span className="font-medium text-[#101828]">Border + shadow:</span> Use for top-level cards that need lift from the background
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Components Section */}
        <section className="mb-16">
          <h2 className="text-[18px] font-semibold text-[#101828] tracking-[-0.02em] mb-6">Components</h2>
          
          {/* Buttons */}
          <div className="mb-8">
            <h3 className="text-[14px] font-medium text-[#101828] mb-4">Buttons</h3>
            <div className="flex items-center gap-4">
              <div>
                <button className="bg-[#101828] text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-[#1f2937] transition-colors">
                  Primary button
                </button>
                <p className="text-[10px] text-[#99A1AF] mt-2">Default state</p>
              </div>
              <div>
                <button className="bg-[#1f2937] text-white px-4 py-2 rounded-lg text-[13px] font-medium">
                  Primary button
                </button>
                <p className="text-[10px] text-[#99A1AF] mt-2">Hover state</p>
              </div>
              <div>
                <button className="border border-gray-200 text-[#101828] px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-gray-50 transition-colors">
                  Secondary button
                </button>
                <p className="text-[10px] text-[#99A1AF] mt-2">Ghost / Outline</p>
              </div>
              <div>
                <button className="size-[40px] rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <ChevronRight className="size-4 text-gray-600" />
                </button>
                <p className="text-[10px] text-[#99A1AF] mt-2">Icon button</p>
              </div>
            </div>
            <p className="text-[11px] text-[#99A1AF] mt-4 italic">
              Buttons use Radius/md (8px). Primary for main actions, secondary for cancel/back, icon-only for navigation.
            </p>
          </div>

          {/* Segmented Control */}
          <div className="mb-8">
            <h3 className="text-[14px] font-medium text-[#101828] mb-4">Segmented Control (Filter Pills)</h3>
            <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-lg inline-flex">
              <button className="bg-[#101828] text-white px-3 py-1 rounded-md text-[12px] tracking-[-0.15px]">
                All
              </button>
              <button className="text-[#6a7282] px-3 py-1 rounded-md text-[12px] tracking-[-0.15px] hover:bg-gray-50">
                Needs negotiation
              </button>
              <button className="text-[#6a7282] px-3 py-1 rounded-md text-[12px] tracking-[-0.15px] hover:bg-gray-50">
                File IDR
              </button>
            </div>
            <p className="text-[11px] text-[#99A1AF] mt-3 italic">
              Selected state uses primary background. Unselected states use ghost style with hover.
            </p>
          </div>

          {/* Status Chips */}
          <div className="mb-8">
            <h3 className="text-[14px] font-medium text-[#101828] mb-4">Status Pills / Chips</h3>
            <div className="flex items-center gap-3">
              <div>
                <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] border bg-orange-50/60 text-orange-700/85 border-orange-200/40">
                  File IDR
                </span>
                <p className="text-[10px] text-[#99A1AF] mt-2">Destructive/urgent</p>
              </div>
              <div>
                <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] border bg-amber-50/70 text-amber-700/85 border-amber-200/40">
                  Needs negotiation
                </span>
                <p className="text-[10px] text-[#99A1AF] mt-2">Warning</p>
              </div>
              <div>
                <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] border bg-slate-50/60 text-slate-600/85 border-slate-200/40">
                  In review
                </span>
                <p className="text-[10px] text-[#99A1AF] mt-2">Neutral/info</p>
              </div>
              <div>
                <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] border border-gray-200/60 bg-transparent text-[#6a7282]">
                  $31,200 recovered
                </span>
                <p className="text-[10px] text-[#99A1AF] mt-2">Metadata pill</p>
              </div>
            </div>
            <p className="text-[11px] text-[#99A1AF] mt-4 italic">
              Chips use text-[11px], px-2.5 py-1, Radius/sm. Colors map to semantic tokens. Borders at 40-60% opacity.
            </p>
          </div>

          {/* Table Card */}
          <div className="mb-8">
            <h3 className="text-[14px] font-medium text-[#101828] mb-4">Table Card (Cases to Act On)</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="text-[14px] font-medium text-[#101828]">Cases to act on</div>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2.5 text-left">
                      <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Patient</span>
                    </th>
                    <th className="px-4 py-2.5 text-left">
                      <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Procedure</span>
                    </th>
                    <th className="px-4 py-2.5 text-right">
                      <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Potential +$</span>
                    </th>
                    <th className="px-4 py-2.5 text-left">
                      <span className="text-[11px] text-[#6a7282] tracking-[0.05em] uppercase">Status</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 bg-white group hover:bg-blue-50/20 cursor-pointer">
                    <td className="px-4 py-2.5">
                      <span className="text-[13px] text-[#101828] tracking-[-0.15px]">J. Martinez</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[13px] text-[#101828] tracking-[-0.15px]">Breast reconstruction</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-[15px] font-semibold text-emerald-700 tracking-[-0.2px]">+$3,400</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] border bg-orange-50/60 text-orange-700/85 border-orange-200/40">
                        File IDR
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-blue-50/20">
                    <td className="px-4 py-2.5">
                      <span className="text-[13px] text-[#101828] tracking-[-0.15px]">S. Chen</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[13px] text-[#101828] tracking-[-0.15px]">Rhinoplasty</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-[15px] font-semibold text-emerald-700 tracking-[-0.2px]">+$5,800</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] border bg-amber-50/70 text-amber-700/85 border-amber-200/40">
                        Needs negotiation
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-2.5">
                      <span className="text-[13px] text-[#101828] tracking-[-0.15px]">M. Patel</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[13px] text-[#101828] tracking-[-0.15px]">Abdominoplasty</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-[15px] font-semibold text-emerald-700 tracking-[-0.2px]">+$4,200</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] border bg-slate-50/60 text-slate-600/85 border-slate-200/40">
                        In review
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#99A1AF] mt-3 italic">
              Headers use all-caps text-[11px]. Rows show default, hover (blue-50/20), and selected states. Entire row is clickable.
            </p>
          </div>

          {/* Sidebar Nav Item */}
          <div className="mb-8">
            <h3 className="text-[14px] font-medium text-[#101828] mb-4">Sidebar Navigation Item</h3>
            <div className="bg-[#f5f5f7] p-6 rounded-lg space-y-2 w-[240px]">
              <div className="h-[36px] relative w-full px-[12px] flex items-center">
                <p className="font-semibold leading-[20px] text-[#101828] text-[14px] text-nowrap tracking-[-0.15px]">
                  Today
                </p>
              </div>
              <div className="h-[36px] relative w-full px-[12px] flex items-center">
                <p className="font-normal leading-[20px] text-[#4a5565] text-[14px] text-nowrap tracking-[-0.15px]">
                  Disputes
                </p>
              </div>
            </div>
            <p className="text-[11px] text-[#99A1AF] mt-3 italic">
              Active item uses bold font weight. Inactive items use regular weight with muted color.
            </p>
          </div>

          {/* Chart Component */}
          <div>
            <h3 className="text-[14px] font-medium text-[#101828] mb-4">Chart Component (Stacked Bar)</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] text-[#99A1AF]">Recovered vs still on the table by week</span>
                <div className="flex items-center gap-3.5">
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-emerald-600" />
                    <span className="text-[10px] text-[#99A1AF]">Recovered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-gray-300" />
                    <span className="text-[10px] text-[#99A1AF]">Still on the table</span>
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-2 h-[120px]">
                {[
                  { recovered: 60, onTable: 30 },
                  { recovered: 70, onTable: 40 },
                  { recovered: 50, onTable: 30 },
                  { recovered: 80, onTable: 35 },
                  { recovered: 85, onTable: 45 },
                  { recovered: 65, onTable: 40 },
                  { recovered: 75, onTable: 35 },
                  { recovered: 70, onTable: 45 },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-0">
                    <div 
                      className="w-full bg-gray-300 rounded-t"
                      style={{ height: `${bar.onTable}%` }}
                    />
                    <div 
                      className="w-full bg-emerald-600"
                      style={{ height: `${bar.recovered}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-[#99A1AF] mt-3 italic">
              Bars have rounded top corners (4px). Gridlines at low opacity. Legend uses size-1.5 dots. Axis labels at text-[10px].
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}