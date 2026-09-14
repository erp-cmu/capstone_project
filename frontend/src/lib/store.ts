import { type Eval } from '@/types/eval';
import { defineStore } from 'pinia';

type GroupMode = 'recipient' | 'clo';

export const useEvalStore = defineStore('eval', {
  state: () => ({
    group_mode: 'recipient' as GroupMode,
    open: false,
    currentEval: null as Eval | null,
  }),

  actions: {
    toggleGroupMode() {
      this.group_mode = this.group_mode === 'recipient' ? 'clo' : 'recipient';
    },
    toggleOpen() {
      this.open = !this.open;
    },
    setCurrentEval(evalData: Eval | null) {
      this.currentEval = evalData;
    },
  },
});
