import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { setCredentials, logout as logoutAction, updateUser } from '../store/slices/authSlice';
import { authService } from '../services';
import { selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: ({ data }) => {
      dispatch(setCredentials({ user: data.data.user, accessToken: data.data.accessToken }));
      toast.success(`Welcome back, ${data.data.user.name}!`);
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: ({ data }) => {
      dispatch(setCredentials({ user: data.data.user, accessToken: data.data.accessToken }));
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      dispatch(logoutAction());
      navigate('/login');
      toast.success('Logged out successfully');
    },
  });

  const { refetch: refetchMe } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.getMe().then(r => r.data.data),
    enabled: isAuthenticated,
    onSuccess: (data) => dispatch(updateUser(data)),
    staleTime: 1000 * 60 * 5,
  });

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    refetchMe,
  };
};
