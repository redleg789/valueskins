'use client';

import { useEffect, useState, useCallback } from 'react';
import { getDb } from './firebase';
import { ref, set, onValue, update } from 'firebase/database';
import { Campaign, ChatMessage, DealState, SharedApplication } from './useDealSync';

export interface FirebaseRoomState {
  campaigns: Campaign[];
  deals: Record<string, DealState>;
  messages: Record<string, ChatMessage[]>;
  applications: SharedApplication[];
  notifications: Array<{id: string; type: 'campaign' | 'application' | 'message'; message: string; createdAt: number; read: boolean}>;
}

const basePath = 'global';

export const useFirebaseRoom = (roomId: string | null, userRole: 'brand' | 'creator' | null, userHandle: string) => {
  const [state, setState] = useState<FirebaseRoomState>({
    campaigns: [],
    deals: {},
    messages: {},
    applications: [],
    notifications: [],
  });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const db = getDb();
    if (!db) return;

    setSyncing(true);

    const unsubCampaigns = onValue(ref(db, `${basePath}/campaigns`), (snapshot) => {
      const data = snapshot.val();
      setState(prev => ({ ...prev, campaigns: data ? Object.values(data) : [] }));
    });

    const unsubDeals = onValue(ref(db, `${basePath}/deals`), (snapshot) => {
      const data = snapshot.val();
      setState(prev => ({ ...prev, deals: data || {} }));
    });

    const unsubApps = onValue(ref(db, `${basePath}/applications`), (snapshot) => {
      const data = snapshot.val();
      setState(prev => ({ ...prev, applications: data ? Object.values(data) : [] }));
    });

    const unsubNotifs = onValue(ref(db, `${basePath}/notifications`), (snapshot) => {
      const data = snapshot.val();
      setState(prev => ({ ...prev, notifications: data ? Object.values(data) : [] }));
    });

    const unsubMessages = onValue(ref(db, `${basePath}/messages`), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed: Record<string, ChatMessage[]> = {};
        for (const [dealKey, msgs] of Object.entries(data)) {
          parsed[dealKey] = Object.values(msgs as Record<string, ChatMessage>);
        }
        setState(prev => ({ ...prev, messages: parsed }));
      }
    });

    setSyncing(false);

    return () => {
      unsubCampaigns();
      unsubDeals();
      unsubApps();
      unsubNotifs();
      unsubMessages();
    };
  }, []);

  const createCampaign = useCallback(async (campaign: Campaign) => {
    const db = getDb();
    if (!db) return;
    const id = campaign.id?.toString() || Date.now().toString();
    await set(ref(db, `${basePath}/campaigns/${id}`), {
      ...campaign,
      id: parseInt(id),
      createdAt: Date.now(),
    });
  }, []);

  const updateDeal = useCallback(async (dealKey: string, updates: Partial<DealState>) => {
    const db = getDb();
    if (!db) return;
    const safeKey = dealKey.replace(/[.#$/\[\]]/g, '_');
    await update(ref(db, `${basePath}/deals/${safeKey}`), updates);
  }, []);

  const addMessage = useCallback(async (dealKey: string, message: ChatMessage) => {
    const db = getDb();
    if (!db) return;
    const safeKey = dealKey.replace(/[.#$/\[\]]/g, '_');
    const msgId = Date.now().toString();
    await set(ref(db, `${basePath}/messages/${safeKey}/${msgId}`), {
      ...message,
      timestamp: Date.now(),
    });
  }, []);

  const sendNotification = useCallback(async (toUserHandle: string, type: 'campaign' | 'application' | 'message', message: string) => {
    const db = getDb();
    if (!db) return;
    const notifId = Date.now().toString();
    await set(ref(db, `${basePath}/notifications/${notifId}`), {
      id: notifId,
      type,
      message,
      to: toUserHandle,
      createdAt: Date.now(),
      read: false,
    });
  }, []);

  const createApplication = useCallback(async (app: SharedApplication) => {
    const db = getDb();
    if (!db) return;
    await set(ref(db, `${basePath}/applications/${app.id}`), app);
  }, []);

  const markNotificationRead = useCallback(async (notifId: string) => {
    const db = getDb();
    if (!db) return;
    await update(ref(db, `${basePath}/notifications/${notifId}`), { read: true });
  }, []);

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
