import { useList } from 'frappe-ui';

export function useEval() {
  const evals = useList({
    doctype: 'CAP Eval',
    fields: ['*'],
    orderBy: 'creation desc',
    limit: 10000,
  });
  return evals;
}
