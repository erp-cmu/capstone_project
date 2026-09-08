<script setup lang="ts">
import Nav from './components/Nav.vue';
</script>

<template>
	<div class="min-h-screen bg-surface-gray-1 text-ink-gray-8">
		<Nav />
		<main class="container-mx-auto mt-6 px-6">
			<router-view />
		</main>
	</div>
</template>
