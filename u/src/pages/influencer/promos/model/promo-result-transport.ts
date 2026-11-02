import { isPromoId, isPromoPlatform } from './promo-read';
import { getCampaignResultDataSchema } from '../distributing/components/campaign-result-form/validation/campaignResult.schema';
import type { TCampaignResultDTO } from '../distributing/components/campaign-result-form/types/campaign-result-form.types';

const counters = ['impressions','like','comments','shares','saves','favorites'] as const;
const strings = ['postLink','screenshotUrl','datePost'] as const;
export function allowResultBody(value: TCampaignResultDTO): TCampaignResultDTO {
  if (!isPromoId(value?.campaignId) || !isPromoId(value?.addedAccountsId) || typeof value?.username !== 'string' || !value.username.trim() || !value.data || typeof value.data !== 'object') throw new Error('Invalid result placement identity or data.');
  const data: Record<string, any> = {};
  for (const key of counters) {
    const n = value.data[key];
    if (n !== undefined) { if (!Number.isSafeInteger(n) || n! < 0) throw new Error(`${key} must be a non-negative integer.`); data[key] = n; }
  }
  if (value.data.rating !== undefined) { if (typeof value.data.rating !== 'number' || !Number.isFinite(value.data.rating) || value.data.rating < 0) throw new Error('Rating is invalid.'); data.rating = value.data.rating; }
  for (const key of strings) {
    const v = value.data[key];
    if (v !== undefined) { if (typeof v !== 'string' || !v.trim()) throw new Error(`${key} is invalid.`); data[key] = v; }
  }
  for (const key of ['postLink', 'screenshotUrl'] as const) if (data[key] !== undefined) {
    let url: URL; try { url = new URL(data[key]); } catch { throw new Error(`${key} must be a valid URL.`); }
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error(`${key} must be an HTTP URL.`);
  }
  return { campaignId: value.campaignId, addedAccountsId: value.addedAccountsId, username: value.username, data };
}
export function buildPromoResultBody(identity: { campaignId: string; addedAccountsId: string; username: string }, platform: unknown, values: unknown): TCampaignResultDTO {
  if (!isPromoPlatform(platform) || platform === 'multipromo') throw new Error('This promo platform is unsupported.');
  const parsed = getCampaignResultDataSchema(platform).parse(values);
  return allowResultBody({ ...identity, data: parsed });
}
