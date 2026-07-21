import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';

interface UseDirtyFormOptions {
  /** Whether the form is currently dirty (has unsaved changes) */
  isDirty: boolean;
  /** Message to show in the confirmation dialog */
  message?: string;
  /** Callback when user confirms leaving */
  onConfirmLeave?: () => void;
  /** Callback when user cancels leaving */
  onCancelLeave?: () => void;
}

interface UseDirtyFormReturn {
  /** Show the confirmation dialog */
  showConfirm: boolean;
  /** Set the confirmation dialog visibility */
  setShowConfirm: (show: boolean) => void;
  /** Handle confirming leave */
  handleConfirmLeave: () => void;
  /** Handle canceling leave */
  handleCancelLeave: () => void;
  /** Reset the dirty state */
  resetDirty: () => void;
}

/**
 * Hook to handle dirty form protection
 * 
 * @param options - Configuration options
 * @returns Dirty state controls
 * 
 * @example
 * ```tsx
 * const { showConfirm, setShowConfirm, handleConfirmLeave, handleCancelLeave, resetDirty } = useDirtyForm({
 *   isDirty: formIsDirty,
 *   message: 'You have unsaved changes. Are you sure you want to leave?',
 *   onConfirmLeave: () => {
 *     // Clear form and navigate
 *     resetDirty();
 *     navigate('/somewhere');
 *   }
 * });
 * ```
 */
export function useDirtyForm({
  isDirty,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  onConfirmLeave,
  onCancelLeave,
}: UseDirtyFormOptions): UseDirtyFormReturn {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const navigate = useNavigate();

  // Use blocker to intercept navigation attempts
  const blocker = useBlocker(
    useCallback(() => {
      // Only block if form is dirty
      return isDirty;
    }, [isDirty])
  );

  // Handle browser navigation (back/forward)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, message]);

  // Handle route changes (React Router)
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowConfirm(true);
      setPendingNavigation(() => blocker.proceed);
    }
  }, [blocker]);

  const handleConfirmLeave = useCallback(() => {
    setShowConfirm(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
    if (onConfirmLeave) {
      onConfirmLeave();
    }
  }, [pendingNavigation, onConfirmLeave]);

  const handleCancelLeave = useCallback(() => {
    setShowConfirm(false);
    setPendingNavigation(null);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
    if (onCancelLeave) {
      onCancelLeave();
    }
  }, [blocker, onCancelLeave]);

  const resetDirty = useCallback(() => {
    setShowConfirm(false);
    setPendingNavigation(null);
  }, []);

  return {
    showConfirm,
    setShowConfirm,
    handleConfirmLeave,
    handleCancelLeave,
    resetDirty,
  };
}
