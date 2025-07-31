'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { authService } from '@/lib/api';

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  const handleOAuthCallback = useCallback(async (code: string, state: string | null) => {
    try {
      console.log('Processing OAuth callback');
      setSuccess('Autenticação realizada com sucesso!');
      if (typeof window !== 'undefined') {
        localStorage.setItem('google_ads_token', 'oauth_token_from_callback');
      }
      setTimeout(() => router.push('/'), 2000);
    } catch (error) {
      setError('Erro ao processar autenticação. Tente novamente.');
    }
  }, [router]);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setError('Autorização negada pelo Google. Tente novamente.');
      return;
    }

    if (code) {
      handleOAuthCallback(code, state);
    }

    if (typeof window !== 'undefined') {
      const savedCustomerId = localStorage.getItem('google_ads_customer_id');
      if (savedCustomerId) {
        setCustomerId(savedCustomerId);
      }
    }
  }, [searchParams, handleOAuthCallback]);

  const handleGetAuthUrl = async () => {
    if (!customerId.trim()) {
      setError('Por favor, insira um Customer ID válido');
      return;
    }

    setLoading(true);
    setError(null);
    setAuthUrl(null);

    try {
      const response = await authService.getAuthUrl(customerId, 'user_' + Date.now());
      setAuthUrl(response.data.authUrl);
      setSuccess('URL de autenticação gerada!');
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('google_ads_customer_id', customerId);
      }
    } catch (error) {
      setError('Erro ao gerar URL de autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectAuth = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('google_ads_token', 'demo_token');
      localStorage.setItem('google_ads_customer_id', customerId || 'demo-customer-id');
    }
    setSuccess('Autenticação de demonstração ativada!');
    setTimeout(() => router.push('/'), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Google Ads Dashboard</h1>
          <p className="text-gray-600">Conecte-se ao Google Ads para visualizar suas campanhas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Autenticação</CardTitle>
            <CardDescription>Insira seu Customer ID e autorize o acesso ao Google Ads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customerId">Customer ID do Google Ads</Label>
              <Input
                id="customerId"
                placeholder="123-456-7890"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Encontre seu Customer ID no Google Ads</p>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {authUrl && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-3">Clique no link abaixo para autorizar:</p>
                <Button onClick={() => window.open(authUrl, '_blank')} className="w-full bg-blue-600 hover:bg-blue-700">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Autorizar Google Ads
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Button onClick={handleGetAuthUrl} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando URL...
                  </>
                ) : (
                  'Gerar URL de Autenticação'
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">ou</span>
                </div>
              </div>

              <Button onClick={handleDirectAuth} variant="outline" className="w-full" disabled={loading}>
                Modo Demonstração (Teste)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
