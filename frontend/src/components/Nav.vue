<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';
import { FeatherIcon } from 'frappe-ui';

const { logout, isAuthenticated, username } = useAuth();
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

			<div class="flex items-center gap-3">
				<RouterLink to="/evaluation">Evaluation</RouterLink>
			</div>

			<div class="flex items-center gap-3">
				<div v-if="isAuthenticated" class="flex items-center gap-3">
					<div>{{ username }}</div>
					<RouterLink to="/" @click="logout">Log out</RouterLink>
				</div>
				<div v-else>
					<RouterLink to="/login">Log in</RouterLink>
				</div>
			</div>
		</div>
	</nav>
</template>
