import React from 'react';
import { useStudy } from '../../context/StudyContext';

const Toast = () => {
  const { toast } = useStudy();
  
  if (!toast.visible) return null;
  
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-accent text-bg-main px-4 py-2 rounded-full text-sm font-semibold z-50 transition-opacity duration-300">
      {toast.message}
    </div>
  );
};

export default Toast;