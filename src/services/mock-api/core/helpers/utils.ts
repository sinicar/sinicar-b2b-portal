export const delay = (ms: number = 0) => {
  if (ms === 0) return Promise.resolve();
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const generateClientId = () => 'C-' + Math.floor(10000 + Math.random() * 90000);

export const generateActivationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const generateId = (prefix: string = '') => 
  `${prefix}${Date.now()}-${Math.floor(Math.random() * 1000)}`;
