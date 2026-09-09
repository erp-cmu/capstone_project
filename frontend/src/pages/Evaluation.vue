<script setup lang="ts">
import { useEval } from '@/composables/useEval';

const { data } = useEval();
console.log(data);
</script>

<template>
	Evaluation

	<div v-if="data" v-for="el in data" :key="el.eval_name">
		{{ el.eval_name }} {{ el.eval_evaluator_name }}
	</div>
</template>
