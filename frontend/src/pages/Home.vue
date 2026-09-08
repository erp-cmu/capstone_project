<script setup lang="ts">
import { useEval } from '@/composables/useEval';
import { ref } from 'vue';

const res = useEval();
console.log(res);
</script>

<template>
	<div>Home</div>
</template>
