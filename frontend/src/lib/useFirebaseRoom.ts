'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { db } from './firebase';
import { ref, set, onValue, update, DatabaseReference } from 'firebase/database';
import { Campaign, ChatMessage, DealState, SharedApplication } from './useDealSync';

export interface FirebaseRoomState {
  campaigns: Campaign[];
  deals: Record<string, DealState>;
  messages: Record<string, ChatMessage[]>;
  applications: SharedApplication[];
  notifications: Array<{id: string; type: 'campaign' | 'application' | 'message'; message: string; createdAt: number; read: boolean}>;
}

export const useFirebaseRoom = (roomId: string | null, userRole: 'brand' | 'creator' | null, userHandle: string) => {
  const [state, setState] = useState<FirebaseRoomState>({
    campaigns: [],
    deals: {},
    messages: {},
    applications: [],
    notifications: [],
  });
  const [syncing, setSyncing] = useState(false);
  const roomRef = useRef<string | null>(null);

  // Initialize Firebase listeners when room is active
  useEffect(() => {
    if (!roomId || !userRole) {
      setState({ campaigns: [], deals: {}, messages: {}, applications: [], notifications: [] });
      return;
    }

    setSyncing(true);
    roomRef.current = roomId;
    const roomPath = `rooms/${roomId}`;

    // Listen to campaigns
    const campaignsRef = ref(db, `${roomPath}/campaigns`);
    const unsubscribeCampaigns = onValue(campaignsRef, (snapshot) => {
      const data = snapshot.val();
      setState(prev => ({ ...prev, campaigns: data ? Object.values(data) : [] }));
    });

    // Listen to deals
    const dealsRef = ref(db, `${roomPath}/deals`);
    const unsubscribeDeals = onValue(dealsRef, (snapshot) => {
      const data = snapshot.val();
      setState(prev => ({ ...prev, deals: data || {} }));
    });

    // Listen to applications
    const applicationsRef = ref(db, `${roomPath}/applications`);
    const unsubscribeApplications = onValue(applicationsRef, (snapshot) => {
      const data = snapshot.val();
      setState(prev => ({ ...prev, applications: data ? Object.values(data) : [] }));
    });

    // Listen to notifications for this user
    const notifRef = ref(db, `${roomPath}/notifications/${userHandle}`);
    const unsubscribeNotifs = onValue(notifRef, (snapshot) => {
      const data = snapshot.val();
      setState(prev => ({ ...prev, notifications: data ? Object.values(data) : [] }));
    });

    setSyncing(false);

    return () => {
      unsubscribeCampaigns();
      unsubscribeDeals();
      unsubscribeApplications();
      unsubscribeNotifs();
    };
  }, [roomId, userRole, userHandle]);

  // Create campaign
  const createCampaign = useCallback(
    async (campaign: Campaign) => {
      if (!roomRef.current) return;
      const id = Date.now().toString();
      await set(ref(db, `rooms/${roomRef.current}/campaigns/${id}`), {
        ...campaign,
        id,
        createdBy: userHandle,
        createdAt: Date.now(),
      });
    },
    [userHandle]
  );

  // Update deal
  const updateDeal = useCallback(
    async (dealKey: string, updates: Partial<DealState>) => {
      if (!roomRef.current) return;
      await update(ref(db, `rooms/${roomRef.current}/deals/${dealKey}`), updates);
    },
    []
  );

  // Add chat message
  const addMessage = useCallback(
    async (dealKey: string, message: ChatMessage) => {
      if (!roomRef.current) return;
      const msgId = Date.now().toString();
      await set(ref(db, `rooms/${roomRef.current}/messages/${dealKey}/${msgId}`), {
        ...message,
        timestamp: Date.now(),
      });
    },
    []
  );

  // Send notification to user
  const sendNotification = useCallback(
    async (toUserHandle: string, type: 'campaign' | 'application' | 'message', message: string) => {
      if (!roomRef.current) return;
      const notifId = Date.now().toString();
      await set(ref(db, `rooms/${roomRef.current}/notifications/${toUserHandle}/${notifId}`), {
        id: notifId,
        type,
        message,
        createdAt: Date.now(),
        read: false,
      });
    },
    []
  );

  // Create application
  const createApplication = useCallback(
    async (app: SharedApplication) => {
      if (!roomRef.current) return;
      await set(ref(db, `rooms/${roomRef.current}/applications/${app.id}`), app);
    },
    []
  );

  // Mark notification as read
  const markNotificationRead = useCallback(
    async (notifId: string) => {
      if (!roomRef.current) return;
      await update(ref(db, `rooms/${roomRef.current}/notifications/${userHandle}/${notifId}`), {
        read: true,
      });
    },
    [userHandle]
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
