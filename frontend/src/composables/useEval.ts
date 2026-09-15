import { useAuth } from '@/composables/useAuth';
import { type Eval } from '@/types/eval';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { call } from 'frappe-ui';

// import { watch } from 'vue';

async function getEvals(employeeName: string) {
  try {
    const url = 'capstone_project.api.eval.get_eval_data';
    const evals = await call(url, {
      method: 'POST',
      employee_name: employeeName,
    });
    return evals as Eval[];
  } catch (error) {
    console.error('Error fetching eval data:', error);
    return [] as Eval[];
  }
}

async function updateScore(payload: UpdateScoreParams) {
  try {
    const url = 'capstone_project.api.eval.edit_score_value';
    const response = await call(url, {
      method: 'POST',
      name: payload.name,
      score_raw: payload.score_raw,
      score_scaled: payload.score_scaled,
    });
    return response;
  } catch (error) {
    console.error('Error editing eval data:', error);
    throw error;
  }
}

export function useEval() {
  const { isAuthenticated, user } = useAuth();
  const evalQuery = useQuery({
    queryKey: ['evalData', user?.value?.emp_name || ''],
    queryFn: () => getEvals(user?.value?.emp_name || ''),
    enabled: isAuthenticated,
    initialData: [] as Array<Eval>,
  });

  // watch(evalQuery.data, () => {
  //   console.log(evalQuery.data.value);
  // });

  const scoreMutation = useMutation({
    mutationFn: updateScore,
    onSuccess: () => {
      evalQuery.refetch();
    },
  });

  return {
    data: evalQuery.data,
    query: evalQuery,
    mutation: scoreMutation,
  };
}
interface UpdateScoreParams {
  name: string;
  score_raw: number;
  score_scaled: number;
}
