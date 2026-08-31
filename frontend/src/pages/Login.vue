<script lang="ts" setup>
import { useAuthStore } from '@/lib/store';
import { call } from 'frappe-ui';
import { ref } from 'vue';

const username = ref('');
const password = ref('');

async function login(username: string, password: string) {
	try {
		const response = await call('login', {
			usr: username,
			pwd: password,
		});
		const authStore = useAuthStore();
		authStore.isAuthenticated = true;
		console.log('Authentication successful', response);
	} catch (error) {
		console.error('Authentication failed', error);
	}
}
</script>

<template>
	<div class="login-container">
		<h1>Login</h1>
		<form @submit.prevent="login(username, password)">
			<div class="form-group">
				<label for="username">Username:</label>
				<input type="text" id="username" v-model="username" required />
			</div>
			<div class="form-group">
				<label for="password">Password:</label>
				<input type="password" id="password" v-model="password" required />
			</div>
			<button type="submit">Login</button>
		</form>
	</div>
</template>
