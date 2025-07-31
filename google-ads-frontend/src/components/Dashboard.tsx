'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  DollarSign, 
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { 
  Campaign, 
  MetricsSummary, 
  campaignsService, 
  metricsService 
} from '@/lib/api';
import DemoDashboard from './DemoDashboard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const [customerId, setCustomerId] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar se existe token de autenticação
    const token = localStorage.getItem('google_ads_token');
    setIsAuthenticated(!!token);
    
    // Se for token de demonstração, mostrar dashboard demo
    if (token === 'demo_token') {
      return;
    }
    
    // Carregar customerId salvo
    const savedCustomerId = localStorage.getItem('google_ads_customer_id');
    if (savedCustomerId) {
      setCustomerId(savedCustomerId);
    }
  }, []);

  const fetchData = async () => {
    if (!customerId.trim()) {
      setError('Por favor, insira um Customer ID válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Salvar customerId
      localStorage.setItem('google_ads_customer_id', customerId);

      // Buscar campanhas e métricas em paralelo
      const [campaignsResponse, metricsResponse] = await Promise.all([
        campaignsService.getCampaigns(customerId),
        metricsService.getSummary(customerId)
      ]);

      setCampaigns(campaignsResponse.data.campaigns);
      setMetrics(metricsResponse.data.summary);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao buscar dados. Verifique sua autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'enabled':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'removed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const campaignChartData = campaigns.map(campaign => ({
    name: campaign.name.length > 20 ? campaign.name.substring(0, 20) + '...' : campaign.name,
    impressions: campaign.impressions,
    clicks: campaign.clicks,
    cost: campaign.cost
  }));

  const statusDistribution = campaigns.reduce((acc, campaign) => {
    const status = campaign.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusDistribution).map(([status, count]) => ({
    name: status,
    value: count
  }));

  // Se for token de demonstração, mostrar dashboard demo
  const token = localStorage.getItem('google_ads_token');
  if (token === 'demo_token') {
    return <DemoDashboard />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Autenticação Necessária</CardTitle>
            <CardDescription className="text-center">
              Você precisa se autenticar com o Google Ads para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/auth'} 
              className="w-full"
            >
              Fazer Login com Google Ads
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Google Ads
          </h1>
          <p className="text-gray-600">
            Visualize e monitore suas campanhas do Google Ads
          </p>
        </div>

        {/* Controles */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="customerId">Customer ID</Label>
                <Input
                  id="customerId"
                  placeholder="123-456-7890"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                />
              </div>
              <Button 
                onClick={fetchData} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Activity className="w-4 h-4" />
                )}
                {loading ? 'Carregando...' : 'Buscar Dados'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Erro */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Métricas Resumo */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Campanhas
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalCampaigns}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.activeCampaigns} ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Impressões
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(metrics.totalImpressions)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cliques
                </CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(metrics.totalClicks)}
                </div>
                <p className="text-xs text-muted-foreground">
                  CTR: {metrics.averageCtr}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Custo Total
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(metrics.totalCost)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráficos */}
        {campaigns.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Campanha</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={campaignChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="impressions" fill="#8884d8" name="Impressões" />
                    <Bar dataKey="clicks" fill="#82ca9d" name="Cliques" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Campanhas */}
        {campaigns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Campanhas</CardTitle>
              <CardDescription>
                Lista completa das suas campanhas do Google Ads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nome</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-right p-2">Impressões</th>
                      <th className="text-right p-2">Cliques</th>
                      <th className="text-right p-2">CTR</th>
                      <th className="text-right p-2">Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{campaign.name}</td>
                        <td className="p-2">
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-right">
                          {formatNumber(campaign.impressions)}
                        </td>
                        <td className="p-2 text-right">
                          {formatNumber(campaign.clicks)}
                        </td>
                        <td className="p-2 text-right">{campaign.ctr}%</td>
                        <td className="p-2 text-right">
                          {formatCurrency(campaign.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estado vazio */}
        {!loading && campaigns.length === 0 && metrics === null && (
          <Card>
            <CardContent className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum dado encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Insira seu Customer ID e clique em "Buscar Dados" para começar
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}