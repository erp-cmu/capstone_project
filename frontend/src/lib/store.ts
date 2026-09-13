import { defineStore } from 'pinia';

type GroupMode = 'recipient' | 'clo';

export const useEvalStore = defineStore('eval', {
  state: () => ({
    group_mode: 'recipient' as GroupMode,
  }),
});
