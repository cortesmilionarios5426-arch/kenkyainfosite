import { MultiStepForm } from '@/components/form/MultiStepForm';

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'hsl(var(--primary))' }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'hsl(var(--accent))' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <MultiStepForm />
      </div>
    </div>
  );
};

export default Index;
