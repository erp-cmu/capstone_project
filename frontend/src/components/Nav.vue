<script setup lang="ts">
import { FeatherIcon } from 'frappe-ui';
</script>

<template>
	<nav class="bg-surface-white shadow-sm">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
			<RouterLink to="/" class="flex items-center gap-3">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 shadow-sm"
				>
					<FeatherIcon name="layers" class="h-5 w-5" />
				</div>
			</RouterLink>

			<div class="hidden items-center gap-3 md:flex">
				<RouterLink to="/about"> About </RouterLink>
			</div>

			<RouterLink to="/login"> Sign in </RouterLink>
		</div>
	</nav>
</template>
