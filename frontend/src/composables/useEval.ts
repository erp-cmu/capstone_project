import { useAuth } from '@/composables/useAuth';
import { type Eval } from '@/types/eval';
import { useQuery } from '@tanstack/vue-query';
import { call } from 'frappe-ui';
import { groupBy } from 'lodash-es';
import { computed, watch } from 'vue';

async function getEvals(employeeName: string) {
  try {
    const url =
      'capstone_project.capstone_project.doctype.cap_eval.cap_eval.get_eval_data';
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

export function useEval() {
  const { isAuthenticated, user } = useAuth();
  const evalQuery = useQuery({
    queryKey: ['evalData', user?.value?.emp_name || ''],
    queryFn: () => getEvals(user?.value?.emp_name || ''),
    enabled: isAuthenticated,
  });

  const dataGrouped = computed(() => {
    return groupBy(
      evalQuery.data.value,
      (ev: Eval) =>
        `${ev.score_recipient_type} - ${ev.score_recipient_type_dynamic}`,
    );
  });

  watch(evalQuery.data, () => {
    console.log(evalQuery.data.value);
  });

  return {
    data: evalQuery.data,
    dataGrouped: dataGrouped,
    query: evalQuery,
  };
}
