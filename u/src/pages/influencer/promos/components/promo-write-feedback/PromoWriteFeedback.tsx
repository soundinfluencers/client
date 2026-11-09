import type { PromoAttempt } from '../../model/promo-write';
import { ButtonMain } from '@/components/ui/buttons-fix/ButtonFix';

export function PromoWriteFeedback({ record, onRetry }: { record?: PromoAttempt; onRetry: () => void }) {
  if (!record || (record.phase === 'idle' && !record.message)) return null;
  return <div role="status" aria-live="polite">
    <p>{record.phase === 'writing' || record.phase === 'checking' ? 'Processing promo…' : record.message}</p>
    {record.phase !== 'writing' && record.phase !== 'checking' && (record.needsRead || record.phase === 'unknown' || (record.phase === 'refused' && !record.canRetry)) && <ButtonMain label={record.reading ? 'Reading…' : 'Retry reading promo'} isDisabled={record.reading} onClick={onRetry} />}
  </div>;
}
