import { router } from '@/main';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { call } from 'frappe-ui';
import { computed, ref } from 'vue';

export const checkLoginStatus = async () => {
  try {
    const username: string = await call('frappe.auth.get_logged_user');
    return {
      isAuthenticated: true,
      username: username,
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      username: '',
    };
  }
};

export function useAuth() {
  const loginError = ref('');

  const queryClient = useQueryClient();

  const authStatusQuery = useQuery({
    queryKey: ['authStatus'],
    queryFn: checkLoginStatus,
  });

  const isAuthenticated = computed(
    () => authStatusQuery.data.value?.isAuthenticated ?? false,
  );
  const username = computed(() => authStatusQuery.data.value?.username ?? '');

  async function login(username: string, password: string) {
    try {
      await call('login', {
        usr: username,
        pwd: password,
      });
      queryClient.invalidateQueries({ queryKey: ['authStatus'] }); // Refetch the login status after successful login
      loginError.value = '';
      router.push('/');
    } catch (error) {
      loginError.value = 'Invalid username or password';
    }
  }

  async function logout() {
    try {
      await call('logout');
      queryClient.invalidateQueries({ queryKey: ['authStatus'] }); // Refetch the login status after successful logout
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', { error });
    }
  }

  return {
    isAuthenticated,
    username,
    login,
    logout,
    loginError,
  };
}
