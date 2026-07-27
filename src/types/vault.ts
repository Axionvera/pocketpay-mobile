export type VaultActionState =
  | 'idle'
  | 'review'
  | 'signing'
  | 'submission'
  | 'pending'
  | 'confirmed'
  | 'failed';

export interface VaultActionStatus {
  state: VaultActionState;
  error?: string;
  txHash?: string;
}

export const VAULT_ACTION_LABELS: Record<VaultActionState, string> = {
  idle: '',
  review: 'Review',
  signing: 'Signing…',
  submission: 'Submitting…',
  pending: 'Pending confirmation…',
  confirmed: 'Confirmed',
  failed: 'Failed',
};
