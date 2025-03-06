import React from 'react'
import { useAppStore } from '@/stores/app';
import { Button } from './button';

const StartModelButton = () => {
  const { requestModeling, isProcessing } = useAppStore();
  return (
    <div className="flex justify-end">
      <Button onClick={() => requestModeling()} variant="default" disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Start Modeling'}
      </Button>
    </div>
  )
}

export default StartModelButton;