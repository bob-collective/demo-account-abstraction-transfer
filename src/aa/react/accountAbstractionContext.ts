import { createContext } from 'react';
import { AaClient } from '../AaClient';

type accountAbstractionContextValue = {
  client?: AaClient;
};

const initialState = {
  client: undefined
};

const accountAbstractionContext = createContext<accountAbstractionContextValue>(initialState);

export { accountAbstractionContext };
