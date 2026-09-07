// Standalone component harness for the isolated MongoDB/browser integration test.
// Vite's production entry does not include this file.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AccountDataReviews } from '../src/pages/influencer/social-accounts/components/AccountDataReviews';
import type { InfluencerProfileApi } from '../src/types/user/influencer.types';

const id = new URLSearchParams(window.location.search).get('accountId') ?? '';
const profile: InfluencerProfileApi = { instagram: [{ accountId: id, username: 'example', labelStatus: 'accept' }], tiktok: [], youtube: [], facebook: [], spotify: [], soundcloud: [], press: [], notificationMethods: { whatsapp: false, telegram: false } };
createRoot(document.getElementById('root')!).render(<div style={{ maxWidth: 1050, margin: '30px auto', fontFamily: 'Arial, sans-serif' }}><AccountDataReviews profile={profile} /></div>);
