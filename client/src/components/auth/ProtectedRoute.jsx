import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import api from '../../services/api.js';
import { fetchMe } from '../../store/slices/authSlice.js';
import { setAccessToken } from '../../services/tokenStore.js';
import LoadingScreen from '../ui/LoadingScreen.jsx';

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { user, booting } = useSelector((state) => state.auth);

  useEffect(() => {
    async function bootstrap() {
      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.accessToken);
      } catch {
        /* no active session */
      }
      dispatch(fetchMe());
    }
    bootstrap();
  }, [dispatch]);

  if (booting) return <LoadingScreen />;

  return user ? children : <Navigate to="/login" replace />;
}
