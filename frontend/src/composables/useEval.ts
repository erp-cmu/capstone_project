import { useAuth } from '@/composables/useAuth';
import { useEvalStore } from '@/lib/store';
import { type Eval } from '@/types/eval';
import { useQuery } from '@tanstack/vue-query';
import { call } from 'frappe-ui';
import { storeToRefs } from 'pinia';
import { groupBy, map, mapValues, pipe } from 'remeda';
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
  const store = useEvalStore();
  const { group_mode } = storeToRefs(store);
  const { isAuthenticated, user } = useAuth();
  const evalQuery = useQuery({
    queryKey: ['evalData', user?.value?.emp_name || ''],
    queryFn: () => getEvals(user?.value?.emp_name || ''),
    enabled: isAuthenticated,
  });

  const dataGrouped = computed(() => {
    if (group_mode.value == 'recipient') {
      return pipe(
        evalQuery.data.value || [],
        groupBy((ev) => ev.eval_evaluator_name),
        mapValues((ev_eval) =>
          pipe(
            ev_eval,
            groupBy((ev_eval) => ev_eval.score_recipient_type),
            mapValues((ev_eval_name) =>
              groupBy(
                ev_eval_name,
                (name) => name.score_recipient_type_dynamic,
              ),
            ),
          ),
        ),
      );
    } else if (group_mode.value === 'clo') {
      return pipe(
        evalQuery.data.value || [],
        groupBy((ev) => ev.eval_evaluator_name),
        mapValues((ev_eval) =>
          pipe(
            ev_eval,
            groupBy((ev_eval) => ev_eval.eval_clo_number),
            mapValues((ev_eval_number) =>
              groupBy(
                ev_eval_number,
                (name) => name.score_recipient_type_dynamic,
              ),
            ),
          ),
        ),
      );
    }
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
