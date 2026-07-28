import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAppStore } from '../store/appStore';
import { useWalletStore } from '../store/walletStore';
import { getLastErrorReport } from './errorReporting';
import { redactSensitiveString } from './redactSensitive';
import { classifyNetworkError } from '../hooks/useNetworkStatus';

export const getDiagnostics = () => {
  const appState = useAppStore.getState();
  const walletState = useWalletStore.getState();
  const lastError = getLastErrorReport();

  // Derive network health from the wallet store error string.
  const networkErrorType = classifyNetworkError(walletState.error);

  // Redact sensitive data — never include secret keys, public keys, or balances.
  const redactedDiagnostics = {
    environment: {
      platform: Platform.OS,
      osVersion: Platform.Version,
      appVersion: Constants.expoConfig?.version ?? 'unknown',
      isDevelopment: __DEV__,
    },
    appState: {
      isInitialized: appState.isInitialized,
      themeMode: appState.themeMode,
      contactsCount: appState.contacts.length,
    },
    walletState: {
      hasPublicKey: !!walletState.publicKey,
      isBalanceLoaded: walletState.balance !== '0.0000000',
      balanceState: walletState.balanceState,
      fundingStatus: walletState.fundingStatus,
      transactionsCount: walletState.transactions.length,
      isLoading: walletState.isLoading,
      lastRefreshed: walletState.lastRefreshed,
      lastError: walletState.error
        ? redactSensitiveString(walletState.error)
        : null,
    },
    networkHealth: {
      classifiedError: networkErrorType,
      hasError: !!walletState.error,
    },
    /**
     * Most recent failure captured by reportError (ErrorBoundary / global
     * handlers). Messages are already redacted at the reporting boundary.
     */
    lastReportedError: lastError
      ? {
          source: lastError.source,
          name: lastError.name,
          message: lastError.message,
          isFatal: Boolean(lastError.isFatal),
          timestamp: lastError.timestamp,
        }
      : null,
    timestamp: new Date().toISOString(),
  };

  return JSON.stringify(redactedDiagnostics, null, 2);
};
