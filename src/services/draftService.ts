/**
 * Form Auto-Save & Unfinished Entry Draft Recovery Service
 * Automatically caches form fields while typing and restores draft after app restart.
 */

const DRAFT_PREFIX = 'fuel_gain_draft_';

export interface EntryDraftPayload {
  date: string;
  productId: string;
  formData: Record<string, any>;
  lastUpdated: string;
}

export const draftService = {
  saveDraft(date: string, productId: string, formData: Record<string, any>) {
    try {
      const key = `${DRAFT_PREFIX}${date}_${productId}`;
      const payload: EntryDraftPayload = {
        date,
        productId,
        formData,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch {
      // Storage full or unavailable
    }
  },

  getDraft(date: string, productId: string): EntryDraftPayload | null {
    try {
      const key = `${DRAFT_PREFIX}${date}_${productId}`;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  clearDraft(date: string, productId: string) {
    try {
      const key = `${DRAFT_PREFIX}${date}_${productId}`;
      localStorage.removeItem(key);
    } catch {
      // Fallback
    }
  },

  getAllDrafts(): EntryDraftPayload[] {
    const drafts: EntryDraftPayload[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(DRAFT_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw) drafts.push(JSON.parse(raw));
        }
      }
    } catch {
      // Fallback
    }
    return drafts;
  },
};
