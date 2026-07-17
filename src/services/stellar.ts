import * as StellarSdk from '@stellar/stellar-sdk';

const server = new StellarSdk.Horizon.Server(
  process.env.EXPO_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'
);

/**
 * Generates a new Stellar Keypair.
 * This function returns both the public and secret keys.
 * The secret key MUST be stored securely using SecureStore.
 */
export const generateKeypair = () => {
  const keypair = StellarSdk.Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
};

/**
 * Helper to fetch account details including balances.
 */
export const fetchAccountDetails = async (publicKey: string) => {
  try {
    const account = await server.loadAccount(publicKey);
    return account;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      throw new Error('Account not found on the network. Please fund it first.');
    }
    throw error;
  }
};

/**
 * Fetch the XLM balance for a given public key.
 */
export const fetchXlmBalance = async (publicKey: string): Promise<string> => {
  try {
    const account = await fetchAccountDetails(publicKey);
    const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
    return nativeBalance ? nativeBalance.balance : '0.0000000';
  } catch (error: any) {
    // If account is not found (unfunded), balance is 0
    if (error.message.includes('not found')) {
      return '0.0000000';
    }
    throw error;
  }
};

/**
 * Fetch recent transactions for a given public key.
 */
export const fetchRecentTransactions = async (publicKey: string, limit: number = 20) => {
  try {
    const response = await server
      .operations()
      .forAccount(publicKey)
      .order('desc')
      .limit(limit)
      .call();
    
    return response.records;
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      return [];
    }
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Send XLM to a destination address.
 */
export const sendXlmTransaction = async (
  secretKey: string,
  destinationPublicKey: string,
  amount: string,
  memoText?: string
) => {
  try {
    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    const sourcePublicKey = sourceKeypair.publicKey();
    
    const account = await server.loadAccount(sourcePublicKey);
    const fee = await server.fetchBaseFee();

    let transactionBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: fee.toString(),
      networkPassphrase: process.env.EXPO_PUBLIC_STELLAR_NETWORK_PASSPHRASE || StellarSdk.Networks.TESTNET,
    });

    transactionBuilder.addOperation(
      StellarSdk.Operation.payment({
        destination: destinationPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: amount,
      })
    );

    if (memoText) {
      transactionBuilder.addMemo(StellarSdk.Memo.text(memoText));
    }

    transactionBuilder.setTimeout(30);
    const transaction = transactionBuilder.build();
    transaction.sign(sourceKeypair);

    const response = await server.submitTransaction(transaction);
    return response;
  } catch (error: any) {
    console.error('Error sending transaction:', error?.response?.data || error);
    throw new Error(error?.response?.data?.extras?.result_codes?.transaction || 'Transaction failed');
  }
};

/**
 * Fund a Testnet account using Friendbot.
 * This is Testnet-only; Friendbot does not exist on Mainnet / Futurenet.
 */
export const fundWithFriendbot = async (publicKey: string): Promise<void> => {
  const friendbotUrl = 'https://friendbot.stellar.org';
  const response = await fetch(`${friendbotUrl}?addr=${encodeURIComponent(publicKey)}`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = (body as any)?.detail || `Friendbot request failed (HTTP ${response.status})`;
    throw new Error(detail);
  }
};

/**
 * MOCK SERVICE WRAPPERS FOR SOROBAN SAVINGS VAULT (Placeholder)
 * 
 * NOTE: Soroban smart contract interactions require specific contract bindings
 * or direct invocation via the SDK. These wrappers serve as placeholders for
 * where the actual Soroban SDK calls should be added.
 */

export const mockConnectVault = async (publicKey: string): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

export const mockFetchVaultBalance = async (publicKey: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return '0.0000000'; // Default placeholder
};

export const mockDepositToVault = async (secretKey: string, amount: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return true;
};

export const mockWithdrawFromVault = async (secretKey: string, amount: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return true;
};

export const mockLockVault = async (
  secretKey: string,
  amount: string,
  unlockTimestamp: number
): Promise<{ success: boolean; unlockTime: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const unlockDate = new Date(unlockTimestamp * 1000);
  return {
    success: true,
    unlockTime: unlockDate.toLocaleString(),
  };
};
