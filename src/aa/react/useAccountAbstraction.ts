import { useContext } from 'react';
import { accountAbstractionContext } from './accountAbstractionContext';

const useAccountAbstraction = () => {
  const context = useContext(accountAbstractionContext);

  if (!context) {
    throw new Error('useAccountAbstraction should be used within an AccountAbstraction Provider');
  }

  return context;
};

export { useAccountAbstraction };
