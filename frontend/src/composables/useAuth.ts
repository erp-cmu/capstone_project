import { router } from '@/main';
import { type User } from '@/types/user';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { call } from 'frappe-ui';
import { computed, ref } from 'vue';

export const checkLoginStatus = async () => {
  try {
    const user: User = await call(
      'capstone_project.utils.auth.get_current_user_info',
    );
    return {
      isAuthenticated: true,
      user: user,
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      user: null,
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
  const user = computed(() => authStatusQuery.data.value?.user ?? null);

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
    user,
    login,
    logout,
    loginError,
  };
}
