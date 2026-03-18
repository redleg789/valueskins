'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { db } from './firebase';
import { ref, set, onValue, update } from 'firebase/database';
import { Campaign, ChatMessage, DealState, SharedApplication } from './useDealSync';

export interface FirebaseRoomState {
  campaigns: Campaign[];
  deals: Record<string, DealState>;
  messages: Record<string, ChatMessage[]>;
  applications: SharedApplication[];
  notifications: Array<{id: string; type: 'campaign' | 'application' | 'message'; message: string; createdAt: number; read: boolean}>;
}

// Global sync — all users on the same deployment share one Firebase namespace
export const useFirebaseRoom = (roomId: string | null, userRole: 'brand' | 'creator' | null, userHandle: string) => {
  const [state, setState] = useState<FirebaseRoomState>({
    campaigns: [],
    deals: {},
    messages: {},
    applications: [],
    notifications: [],
  });
  const [syncing, setSyncing] = useState(false);

  // Always sync — no room ID needed, use global path
  const basePath = 'global';

  useEffect(() => {
    setSyncing(true);

    const campaignsRef = ref(db, `${basePath}/campaigns`);
    const unsubCampaigns = onValue(campaignsRef, (snapshot) => {
      const data = snapshot.val();
      setState(prev => ({ ...prev, campaigns: data ? Object.values(data) : [] }));
    });

    const dealsRef = ref(db, `${basePath}/deals`);
    const unsubDeals = onValue(dealsRef, (snapshot) => {
      const data = snapshot.val();
      setState(prev => ({ ...prev, deals: data || {} }));
    });

    const applicationsRef = ref(db, `${basePath}/applications`);
    const unsubApps = onValue(applicationsRef, (snapshot) => {
      const data = snapshot.val();
      setState(prev => ({ ...prev, applications: data ? Object.values(data) : [] }));
    });

    const notifRef = ref(db, `${basePath}/notifications`);
    const unsubNotifs = onValue(notifRef, (snapshot) => {
      const data = snapshot.val();
      setState(prev => ({ ...prev, notifications: data ? Object.values(data) : [] }));
    });

    setSyncing(false);

    return () => {
      unsubCampaigns();
      unsubDeals();
      unsubApps();
      unsubNotifs();
    };
  }, []);

  const createCampaign = useCallback(
    async (campaign: Campaign) => {
      const id = campaign.id?.toString() || Date.now().toString();
      await set(ref(db, `${basePath}/campaigns/${id}`), {
        ...campaign,
        id: parseInt(id),
        createdAt: Date.now(),
      });
    },
    []
  );

  const updateDeal = useCallback(
    async (dealKey: string, updates: Partial<DealState>) => {
      const safeKey = dealKey.replace(/[.#$/\[\]]/g, '_');
      await update(ref(db, `${basePath}/deals/${safeKey}`), updates);
    },
    []
  );

  const addMessage = useCallback(
    async (dealKey: string, message: ChatMessage) => {
      const safeKey = dealKey.replace(/[.#$/\[\]]/g, '_');
      const msgId = Date.now().toString();
      await set(ref(db, `${basePath}/messages/${safeKey}/${msgId}`), {
        ...message,
        timestamp: Date.now(),
      });
    },
    []
  );

  const sendNotification = useCallback(
    async (toUserHandle: string, type: 'campaign' | 'application' | 'message', message: string) => {
      const notifId = Date.now().toString();
      await set(ref(db, `${basePath}/notifications/${notifId}`), {
        id: notifId,
        type,
        message,
        to: toUserHandle,
        createdAt: Date.now(),
        read: false,
      });
    },
    []
  );

  const createApplication = useCallback(
    async (app: SharedApplication) => {
      await set(ref(db, `${basePath}/applications/${app.id}`), app);
    },
    []
  );

  const markNotificationRead = useCallback(
    async (notifId: string) => {
      await update(ref(db, `${basePath}/notifications/${notifId}`), { read: true });
    },
    []
  );

  return {
    state,
    syncing,
    createCampaign,
    updateDeal,
    addMessage,
    sendNotification,
    createApplication,
    markNotificationRead,
  };
};
