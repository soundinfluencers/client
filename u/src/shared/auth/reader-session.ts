import { useSyncExternalStore } from 'react';

// Auth lifecycle, not token identity. Refresh and user/balance patches do not
// advance this epoch. No name/userId guess, no persistence of credentials.
let session = { epoch: 0, active: false };
const listeners = new Set<() => void>();
export const getReaderSession = () => session;
export function changeReaderSession(active: boolean) {
  session = { epoch: session.epoch + 1, active };
  listeners.forEach(listener => listener());
}
export function useReaderSession() {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, getReaderSession, getReaderSession);
}
