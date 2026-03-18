'use client';

import { Suspense } from 'react';
import DemoRoomWrapper from '@/components/DemoRoomWrapper';

export default function InstagramDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div style={{ background: '#000', minHeight: '100vh' }} />}>
      <DemoRoomWrapper />
    </Suspense>
  );
}
