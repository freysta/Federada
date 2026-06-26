import { Check, Clock, AlertCircle } from 'lucide-react';

interface SubscriptionStepperProps {
  status: string;
}

export default function SubscriptionStepper({ status }: SubscriptionStepperProps) {
  // Define steps
  const steps = [
    { id: 'enrolled', label: 'Inscrição' },
    { id: 'docs', label: 'Documentos' },
    { id: 'roster', label: 'Elenco' },
    { id: 'approved', label: 'Aprovação' }
  ];

  // Determine current active step based on status
  let currentStepIndex = 0;
  let isRejected = status === 'REJECTED';

  if (status === 'PENDING_DOCS') currentStepIndex = 1;
  else if (status === 'PENDING_ROSTER') currentStepIndex = 2;
  else if (status === 'PENDING') currentStepIndex = 3;
  else if (status === 'APPROVED' || status === 'CONFIRMED') currentStepIndex = 4;
  else if (isRejected) currentStepIndex = 3; // Fails at approval phase usually

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
        
        {/* Active line */}
        <div 
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full z-0 transition-all duration-500 ${isRejected ? 'bg-red-500' : 'bg-blue-600'}`}
          style={{ width: `${Math.min((currentStepIndex / (steps.length - 1)) * 100, 100)}%` }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const isFailed = isRejected && index === currentStepIndex;

          let bgColor = 'bg-slate-200';
          let textColor = 'text-slate-400';
          let icon = null;

          if (isCompleted) {
            bgColor = 'bg-blue-600';
            textColor = 'text-blue-600';
            icon = <Check size={12} className="text-white" />;
          } else if (isActive) {
            if (isFailed) {
              bgColor = 'bg-red-500';
              textColor = 'text-red-500';
              icon = <AlertCircle size={12} className="text-white" />;
            } else {
              bgColor = 'bg-blue-600 ring-4 ring-blue-100';
              textColor = 'text-blue-600 font-bold';
              icon = <Clock size={12} className="text-white" />;
            }
          }

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${bgColor}`}>
                {icon || <span className="w-2 h-2 rounded-full bg-white"></span>}
              </div>
              <span className={`text-[10px] uppercase tracking-wider ${textColor} absolute top-8 whitespace-nowrap`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
