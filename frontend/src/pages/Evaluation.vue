<script setup lang="ts">
import { useEval } from '@/composables/useEval';

const evals = useEval();
console.log(evals);
</script>

<template>
	Evaluation

	<div v-if="evals?.data" v-for="el in evals.data" :key="el.name">
		{{ el.name }}
	</div>
</template>
