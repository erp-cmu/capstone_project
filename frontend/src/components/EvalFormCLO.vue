<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	cloDesc: string;
	rubricDesc: string;
}>();

const rubricDescArray = computed(() => props.rubricDesc.split('\n'));
</script>

<template>
	<div class="flex flex-col gap-2">
		<p class="font-bold">{{ cloDesc }}</p>
		<ul class="list-disc pl-6 bg-gray-100 p-2 rounded-md">
			<li v-for="(desc, index) in rubricDescArray" :key="index">{{ desc }}</li>
		</ul>
	</div>
</template>
