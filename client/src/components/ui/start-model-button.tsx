import { useAppStore } from '@/stores/app';
import { Button } from './button';
import { Loader2 } from 'lucide-react';

const StartModelButton = () => {
  const { requestModeling, isProcessing } = useAppStore();
  
  const handleStartModeling = async () => {
    // This will use the description that's already been updated by the editor
    await requestModeling();
  };
  
  return (
    <div className="flex justify-end">
      <Button 
        onClick={handleStartModeling} 
        variant="default" 
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Start Modeling'}
        {isProcessing && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
      </Button>
    </div>
  );
};

export default StartModelButton;