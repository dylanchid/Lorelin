import { useState } from 'react';
import svgPaths from "./imports/svg-n9pd492ljk";
import { TodayScreen } from './components/TodayScreen';
import { DisputesScreen } from './components/DisputesScreen';
import { CaseDetailScreen } from './components/CaseDetailScreen';
import { CaseDetailIDR } from './components/CaseDetailIDR';
import { CaseDetailAppeal } from './components/CaseDetailAppeal';
import { DesignSystemScreen } from './components/DesignSystemScreen';
import { IntakeScreen } from './components/IntakeScreen';
import { TemplatesScreen } from './components/TemplatesScreen';
import { NegotiationLetterTemplate } from './components/templates/NegotiationLetterTemplate';
import { IDRPacketTemplate } from './components/templates/IDRPacketTemplate';
import { AppealLetterTemplate } from './components/templates/AppealLetterTemplate';
import { ReconsiderationLetterTemplate } from './components/templates/ReconsiderationLetterTemplate';
import { VisitsScreen } from './components/VisitsScreen';
import { VisitDetailScreen } from './components/VisitDetailScreen';
import { VisitRecordScreen } from './components/VisitRecordScreen';
import { VisitApprovedScreen } from './components/VisitApprovedScreen';
import { EligibilityScreen } from './components/EligibilityScreen';
import { PreVisitV2Screen } from './components/PreVisitV2Screen';

function Text() {
  return (
    <div className="h-[16px] relative shrink-0 w-[16.594px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[16px] items-start relative w-[16.594px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-white whitespace-pre">GP</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-black relative rounded-[3.35544e+07px] shrink-0 size-[32px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[32px]">
        <Text />
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[24px] relative shrink-0 w-[57.234px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[57.234px]">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-0 not-italic text-[16px] text-neutral-950 text-nowrap top-0 tracking-[-0.3125px] whitespace-pre">Lorelin</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[32px] items-center left-[24px] top-[24px] w-[208px]">
      <Container />
      <Text1 />
    </div>
  );
}

function Button({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="h-[36px] relative w-[232px] cursor-pointer group"
    >
      <div className="absolute h-[36px] left-0 top-0 w-[232px] px-[12px] flex items-center">
        <p className={`font-['Inter:${active ? 'Semi_Bold' : 'Regular'}',sans-serif] ${active ? 'font-semibold text-[#101828]' : 'font-normal text-[#4a5565]'} leading-[20px] not-italic text-[14px] text-nowrap tracking-[-0.1504px] whitespace-pre`}>
          {label}
        </p>
      </div>
    </button>
  );
}

function List({ currentView, onNavigate, onNavigateToEligibility, onNavigateToIntake, onNavigateToTemplates }: { currentView: string; onNavigate: (view: 'today' | 'disputes' | 'visits') => void; onNavigateToEligibility: () => void; onNavigateToIntake: () => void; onNavigateToTemplates: () => void }) {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] items-start left-[12px] top-[80px] w-[232px]">
      <Button label="Home" active={currentView === 'today'} onClick={() => onNavigate('today')} />
      <Button label="Pre-Visit" active={currentView === 'eligibility'} onClick={onNavigateToEligibility} />
      <Button label="Pre-Visit v2" active={currentView === 'pre-visit-v2'} onClick={() => onNavigate('pre-visit-v2' as any)} />
      <Button label="Visits" active={currentView === 'visits' || currentView === 'visit-detail' || currentView === 'visit-record' || currentView === 'visit-approved'} onClick={() => onNavigate('visits')} />
      <Button label="Disputes" active={currentView === 'disputes' || currentView.startsWith('case-detail')} onClick={() => onNavigate('disputes')} />
      <Button label="Diagnostics" active={currentView === 'intake'} onClick={onNavigateToIntake} />
      <Button label="Templates" active={currentView === 'templates' || currentView.startsWith('template-')} onClick={onNavigateToTemplates} />
    </div>
  );
}

function Button4() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-center px-[12px] py-[8px] relative rounded-[10px] shrink-0 cursor-pointer hover:bg-white/30 transition-colors">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#4a5565] text-[14px] text-nowrap tracking-[-0.1504px] whitespace-pre">Support</p>
    </div>
  );
}

function Button5({ onClick }: { onClick?: () => void }) {
  return (
    <div onClick={onClick} className="box-border content-stretch flex gap-[10px] items-center px-[12px] py-[8px] relative rounded-[10px] shrink-0 cursor-pointer hover:bg-white/30 transition-colors">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#4a5565] text-[14px] text-nowrap tracking-[-0.1504px] whitespace-pre">Design System</p>
    </div>
  );
}

function Button6() {
  return (
    <div className="box-border content-stretch flex gap-[10px] items-center px-[12px] py-[8px] relative rounded-[10px] shrink-0 cursor-pointer hover:bg-white/30 transition-colors">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#4a5565] text-[14px] text-nowrap tracking-[-0.1504px] whitespace-pre">Settings</p>
    </div>
  );
}

function Container2({ onNavigateToDesignSystem }: { onNavigateToDesignSystem: () => void }) {
  return (
    <div className="box-border content-stretch flex flex-col gap-[4px] h-[148px] items-start pb-0 pt-[16px] px-[12px] relative shrink-0">
      <Button4 />
      <Button5 onClick={onNavigateToDesignSystem} />
      <Button6 />
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[16px] relative shrink-0 w-[15.734px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[16px] items-start relative w-[15.734px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#364153] text-[12px] text-center text-nowrap whitespace-pre">AS</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="bg-[#d1d5dc] relative rounded-[3.35544e+07px] shrink-0 size-[32px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center pl-0 pr-[0.016px] py-0 relative size-[32px]">
        <Text2 />
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[20px] relative shrink-0 w-[90px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[90px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-neutral-950 text-nowrap top-0 tracking-[-0.1504px] whitespace-pre">Alex Smith</p>
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[16px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g>
          <path d="M4 6L8 10L12 6" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="h-[48px] relative rounded-[10px] shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[12px] h-[48px] items-center px-[12px] py-0 relative w-full">
          <Container3 />
          <Text3 />
          <Icon4 />
        </div>
      </div>
    </div>
  );
}

function Container4({ onNavigateToDesignSystem }: { onNavigateToDesignSystem: () => void }) {
  return (
    <div className="box-border content-stretch flex flex-col items-start px-0 py-px w-full">
      <Container2 onNavigateToDesignSystem={onNavigateToDesignSystem} />
      <Button7 />
    </div>
  );
}

function Sidebar({ currentView, onNavigate, onNavigateToEligibility, onNavigateToIntake, onNavigateToTemplates, onNavigateToDesignSystem }: { currentView: string; onNavigate: (view: 'today' | 'disputes' | 'visits') => void; onNavigateToEligibility: () => void; onNavigateToIntake: () => void; onNavigateToTemplates: () => void; onNavigateToDesignSystem: () => void }) {
  return (
    <div className="bg-[#f5f5f7] h-full relative shrink-0 w-[186px] flex flex-col">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[186px] flex flex-col">
        <Container1 />
        <List currentView={currentView} onNavigate={onNavigate} onNavigateToEligibility={onNavigateToEligibility} onNavigateToIntake={onNavigateToIntake} onNavigateToTemplates={onNavigateToTemplates} />
        <div className="flex-1" />
        <Container4 onNavigateToDesignSystem={onNavigateToDesignSystem} />
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<'today' | 'disputes' | 'visits' | 'eligibility' | 'pre-visit-v2' | 'visit-detail' | 'visit-record' | 'visit-approved' | 'intake' | 'templates' | 'template-1' | 'template-2' | 'template-3' | 'template-4' | 'case-detail' | 'case-detail-idr' | 'case-detail-appeal' | 'design-system'>('today');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const handleOpenCase = (id: string) => {
    setSelectedCaseId(id);
    // Route to IDR screen for case ID '4' (K. Williams - Ready for IDR)
    // Route to Appeal screen for case ID '3' (M. Patel - New/Appeal only)
    if (id === '4') {
      setCurrentView('case-detail-idr');
    } else if (id === '3') {
      setCurrentView('case-detail-appeal');
    } else {
      setCurrentView('case-detail');
    }
  };

  const handleBackToDisputes = () => {
    setCurrentView('disputes');
    setSelectedCaseId(null);
  };

  const handleViewTemplate = (templateId: string) => {
    setCurrentView(`template-${templateId}` as any);
  };

  const handleBackToTemplates = () => {
    setCurrentView('templates');
  };

  const handleViewVisit = (visitId: string) => {
    setCurrentView('visit-detail');
  };

  const handleRecordVisit = (visitId: string) => {
    setCurrentView('visit-record');
  };

  const handleSendToAthena = (visitId: string) => {
    setCurrentView('visit-approved');
  };

  const handleBackToVisits = () => {
    setCurrentView('visits');
  };

  return (
    <div className="bg-[#f5f5f7] h-screen w-screen overflow-hidden flex">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} onNavigateToEligibility={() => setCurrentView('eligibility')} onNavigateToIntake={() => setCurrentView('intake')} onNavigateToTemplates={() => setCurrentView('templates')} onNavigateToDesignSystem={() => setCurrentView('design-system')} />
      
      {/* Main Content */}
      <div className="flex-1 bg-[#f5f5f7] h-full overflow-auto">
        {currentView === 'today' ? (
          <TodayScreen onOpenCase={handleOpenCase} />
        ) : currentView === 'visits' ? (
          <VisitsScreen onViewVisit={handleViewVisit} onRecordVisit={handleRecordVisit} onSendToAthena={handleSendToAthena} />
        ) : currentView === 'visit-detail' ? (
          <VisitDetailScreen onBack={handleBackToVisits} />
        ) : currentView === 'visit-record' ? (
          <VisitRecordScreen onBack={handleBackToVisits} />
        ) : currentView === 'visit-approved' ? (
          <VisitApprovedScreen onBack={handleBackToVisits} />
        ) : currentView === 'disputes' ? (
          <DisputesScreen onOpenCase={handleOpenCase} />
        ) : currentView === 'eligibility' ? (
          <EligibilityScreen />
        ) : currentView === 'pre-visit-v2' ? (
          <PreVisitV2Screen />
        ) : currentView === 'intake' ? (
          <IntakeScreen />
        ) : currentView === 'templates' ? (
          <TemplatesScreen onViewTemplate={handleViewTemplate} />
        ) : currentView === 'template-1' ? (
          <NegotiationLetterTemplate onBack={handleBackToTemplates} />
        ) : currentView === 'template-2' ? (
          <IDRPacketTemplate onBack={handleBackToTemplates} />
        ) : currentView === 'template-3' ? (
          <AppealLetterTemplate onBack={handleBackToTemplates} />
        ) : currentView === 'template-4' ? (
          <ReconsiderationLetterTemplate onBack={handleBackToTemplates} />
        ) : currentView === 'case-detail-idr' ? (
          <CaseDetailIDR onBack={handleBackToDisputes} />
        ) : currentView === 'case-detail-appeal' ? (
          <CaseDetailAppeal onBack={handleBackToDisputes} />
        ) : currentView === 'design-system' ? (
          <DesignSystemScreen />
        ) : (
          <CaseDetailScreen onBack={handleBackToDisputes} />
        )}
      </div>
    </div>
  );
}