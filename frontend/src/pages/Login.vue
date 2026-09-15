<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth';
import { Button, FormControl } from 'frappe-ui';
import { ref } from 'vue';

const username = ref('');
const password = ref('');
const { login, loginError } = useAuth();
</script>

<template>
	<form
		@submit.prevent="login(username, password)"
		class="space-y-4 py-4 max-w-lg mx-auto border border-gray-300 rounded-lg p-6"
	>
		<h2>Login</h2>
		<FormControl
			type="text"
			label="Username"
			placeholder="Enter your username"
			v-model="username"
			required
		/>
		<FormControl
			type="password"
			label="Password"
			placeholder="Enter your password"
			v-model="password"
			required
		/>
		<div v-if="loginError" class="text-red-500 text-sm mt-1">{{ loginError }}</div>

		<Button variant="solid" type="submit">Login</Button>
	</form>
</template>
