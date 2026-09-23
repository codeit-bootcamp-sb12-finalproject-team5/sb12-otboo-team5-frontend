import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/useAuthStore';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetch, loading } = useAuthStore();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      navigate(`/auth/login?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    fetch({ throwError: true })
      .then(() => navigate('/recommendations', { replace: true }))
      .catch(() => navigate('/auth/login?error=oauth_login_failed', { replace: true }));
  }, [fetch, navigate, searchParams]);

  return (
    <p className="text-center text-gray-600" aria-live="polite">
      {loading ? '로그인 정보를 확인하고 있습니다.' : '로그인을 완료하는 중입니다.'}
    </p>
  );
}
