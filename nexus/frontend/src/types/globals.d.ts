// Global type declarations for third-party scripts injected into window

interface GTagEventParams {
  [key: string]: string | number | boolean | undefined;
}

interface Window {
  gtag?: (
    command: 'event' | 'config' | 'set' | 'js',
    eventOrTarget: string | Date,
    params?: GTagEventParams
  ) => void;
}
