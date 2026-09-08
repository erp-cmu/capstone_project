import { useList } from 'frappe-ui';

// import { ref, toValue, watch } from 'vue';

export function useEval() {
  const evals = useList({
    doctype: 'CAP Eval',
    fields: ['*'],
    orderBy: 'creation desc',
  });
  return evals;
}
