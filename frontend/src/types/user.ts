export interface User {
  username: string;
  first_name: string;
  last_name: null;
  email: string;
  user_image: null;
  is_employee: boolean;
  emp_name: string;
  emp_fullname_th: string;
  emp_name_code: string;
  role: 'ADMIN' | 'USER';
}
