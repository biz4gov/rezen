

import React from 'react';
import type { ConstantConfig } from '../types';
import { ArrowLeft, ChevronRight, List, FileText, CheckSquare, Sliders, BrainCircuit, MessageSquare, Palette } from 'lucide-react';

interface SettingsPageProps {
  onNavigateToConstant: (config: ConstantConfig) => void;
  onNavigateToPrompts: () => void;
  onNavigateToWhatsappConfig: () => void;
  onNavigateToBranding: () => void;
  onBack: () => void;
  configs: ConstantConfig[];
}

const SettingsCard: React.FC<{ title: string; icon: React.ReactNode; onClick: () => void; }> = ({ title, icon, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between text-left p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                {icon}
            </div>
            <div className="ml-4">
                <p className="text-base font-semibold text-gray-800">{title}</p>
            </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
    </button>
);

const getIconForTitle = (title: string): React.ReactNode => {
    if (title.includes('Modalidades')) return <List size={20} />;
    if (title.includes('Legislações')) return <FileText size={20} />;
    if (title.includes('Critérios')) return <CheckSquare size={20} />;
    if (title.includes('Modos')) return <Sliders size={20} />;
    return <List size={20} />;
};

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigateToConstant, onNavigateToPrompts, onNavigateToWhatsappConfig, onNavigateToBranding, onBack, configs }) => {
  return (
    <div className="h-full w-full bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
            <div className="flex items-center mb-8">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 mr-4">
                    <ArrowLeft size={20} className="text-gray-700" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Configurações da Aplicação</h1>
            </div>

            <div className="flex-grow overflow-y-auto pr-2">
                <div className="max-w-3xl mx-auto space-y-4">
                     {configs.map(config => (
                        <SettingsCard 
                            key={config.key}
                            title={config.title} 
                            icon={getIconForTitle(config.title)}
                            onClick={() => onNavigateToConstant(config)} 
                        />
                    ))}
                    <SettingsCard 
                        title="Identidade Visual"
                        icon={<Palette size={20} />}
                        onClick={onNavigateToBranding} 
                    />
                    <SettingsCard 
                        title="Prompts da IA (Gemini)"
                        icon={<BrainCircuit size={20} />}
                        onClick={onNavigateToPrompts} 
                    />
                    <SettingsCard 
                        title="API Whatsapp"
                        icon={<MessageSquare size={20} />}
                        onClick={onNavigateToWhatsappConfig} 
                    />
                </div>
            </div>
        </div>
    </div>
  );
};

export default SettingsPage;