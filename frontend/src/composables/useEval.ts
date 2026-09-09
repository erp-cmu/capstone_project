import { type Eval } from '@/types/eval';
import { useQuery } from '@tanstack/vue-query';
import { call } from 'frappe-ui';

async function getEvals() {
  try {
    const url =
      'capstone_project.capstone_project.doctype.cap_eval.cap_eval.get_eval_data';
    const evals = await call(url);
    return evals as Eval[];
  } catch (error) {
    console.error('Error fetching eval data:', error);
    return [] as Eval[];
  }
}

export function useEval() {
  const evalQuery = useQuery({
    queryKey: ['evalData'],
    queryFn: getEvals,
  });

  return {
    data: evalQuery.data,
    query: evalQuery,
  };
}
