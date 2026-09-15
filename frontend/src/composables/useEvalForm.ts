import { useEval } from '@/composables/useEval';
import { useEvalStore } from '@/lib/store';
import { toTypedSchema } from '@vee-validate/zod';
import { storeToRefs } from 'pinia';
import { useForm } from 'vee-validate';
import { computed, watch } from 'vue';
import * as z from 'zod';

export function useEvalForm() {
  const { mutation } = useEval();
  const store = useEvalStore();
  const { currentEval } = storeToRefs(store);

  //Make validationSchema dynamically react when currentEval changes.
  const validationSchema = computed(() => {
    const maxScore = currentEval.value?.eval_score_max ?? 4;
    const minScore = currentEval.value?.eval_score_min ?? 0;
    return toTypedSchema(
      z.object({
        score_raw: z.coerce
          .number()
          .max(maxScore, {
            message: `Raw score must be less than or equal to ${maxScore}`,
          })
          .min(minScore, {
            message: `Raw score must be greater than or equal to ${minScore}`,
          }),
        score_scaled: z.coerce.number().min(0).max(4),
      }),
    );
  });

  const vform = useForm({
    initialValues: {
      score_raw: String(currentEval.value?.score_score_raw ?? '0'),
      score_scaled: String(currentEval.value?.score_score_scaled ?? '0'),
    },
    validationSchema, // vee-validate unwraps computed schemas automatically
  });
  const [scoreRaw, scoreRawAttrs] = vform.defineField('score_raw', {
    validateOnInput: true,
  });
  const [scoreScaled, scoreScaledAttrs] = vform.defineField('score_scaled', {
    validateOnInput: true,
  });

  // Sync form values whenever a new evaluation is opened
  watch(
    () => currentEval.value,
    (newVal) => {
      vform.setValues({
        score_raw: String(newVal?.score_score_raw ?? '0'),
        score_scaled: String(newVal?.score_score_scaled ?? '0'),
      });
    },
    { immediate: true },
  );

  // Helper function to handle scaling math logic
  const calculateScaledScore = (
    raw: number | string,
    score_max: number,
    score_min: number,
  ): number => {
    const rawNum = Number(raw);
    if (isNaN(rawNum)) return 0;

    if (score_max === score_min) return 0;

    // Standard min-max normalization scaled to a 0-4 range
    const normalized = (rawNum - score_min) / (score_max - score_min);
    const scaled = normalized * 4;

    // console.log(
    // 	`Calculating scaled score: raw=${rawNum}, min=${score_min}, max=${score_max}, normalized=${normalized}, scaled=${scaled}`,
    // );
    // Clamp value between 0 and 4 and round to 2 decimal places
    return Math.min(Math.max(Number(scaled.toFixed(2)), 0), 4);
  };

  watch(scoreRaw, (newRawVal) => {
    const newScaledScore = calculateScaledScore(
      newRawVal as number | string,
      currentEval.value?.eval_score_max ?? 4,
      currentEval.value?.eval_score_min ?? 0,
    );
    scoreScaled.value = newScaledScore;
  });

  const onSubmit = vform.handleSubmit((values) => {
    // Save your updated values here
    mutation.mutate({
      name: currentEval.value?.score_name ?? '',
      score_raw: Number(values.score_raw),
      score_scaled: Number(values.score_scaled),
    });
    store.toggleOpen();
  });

  return {
    vform,
    scoreRaw,
    scoreRawAttrs,
    scoreScaled,
    scoreScaledAttrs,
    isPending: mutation.isPending,
    onSubmit,
  };
}
