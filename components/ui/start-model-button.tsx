"use client"
import { useAppStore } from '@/stores/app';
import { Button } from './button';
import { Loader2, Square } from 'lucide-react';

const StartModelButton = () => {
  const { requestModeling, stopModeling, isProcessing } = useAppStore();
  
  const handleButtonClick = async () => {
    if (isProcessing) {
      // If processing, stop the modeling
      stopModeling();
    } else {
      // Otherwise start modeling
      await requestModeling();
    }
  };
  
  return (
    <div className="flex justify-end">
      <Button 
        onClick={handleButtonClick} 
        variant={isProcessing ? "destructive" : "default"}
      >
        {isProcessing ? 'Stop Modeling' : 'Start Modeling'}
        {isProcessing && <Square className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  );
};

export default StartModelButton;