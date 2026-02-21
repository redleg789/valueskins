'use client';

import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Contract addresses (update these after deployment)
export const CONTRACT_ADDRESSES = {
    sepolia: {
        personaRegistry: '0x0000000000000000000000000000000000000000' as const,
        professionRegistry: '0x0000000000000000000000000000000000000000' as const,
        skinNFT: '0x0000000000000000000000000000000000000000' as const,
        paymentSplitter: '0x0000000000000000000000000000000000000000' as const,
        levelOracle: '0x0000000000000000000000000000000000000000' as const,
    },
    mainnet: {
        personaRegistry: '0x0000000000000000000000000000000000000000' as const,
        professionRegistry: '0x0000000000000000000000000000000000000000' as const,
        skinNFT: '0x0000000000000000000000000000000000000000' as const,
        paymentSplitter: '0x0000000000000000000000000000000000000000' as const,
        levelOracle: '0x0000000000000000000000000000000000000000' as const,
    },
} as const;

// WalletConnect project ID - get one at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo';

export const config = createConfig({
    chains: [sepolia, mainnet],
    connectors: [
        injected(),
        walletConnect({ projectId }),
    ],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
    },
});

// Get current chain's contract addresses
export function getContractAddresses(chainId: number) {
    if (chainId === sepolia.id) return CONTRACT_ADDRESSES.sepolia;
    if (chainId === mainnet.id) return CONTRACT_ADDRESSES.mainnet;
    return CONTRACT_ADDRESSES.sepolia; // Default to sepolia
}

declare module 'wagmi' {
    interface Register {
        config: typeof config;
    }
}
