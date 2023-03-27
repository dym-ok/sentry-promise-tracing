import { SeverityLevel } from '@sentry/types';
export const isBrowser = new Function('try {return this===window;}catch(e){ return false;}');
export const isNode = new Function('try {return this===global;}catch(e){return false;}');
export const ERROR_SEVERITY: SeverityLevel = 'error';