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
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  Eye, 
  MousePointer, 
  DollarSign, 
  Activity,
  RefreshCw,
  AlertCircle,
  LogOut,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Settings,
  User,
  BarChart3
} from 'lucide-react';
import { 
  Campaign, 
  MetricsSummary, 
  campaignsService, 
  metricsService 
} from '@/lib/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

interface AccountInfo {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  status: string;
}

export default function CompleteDashboard() {
  const [customerId, setCustomerId] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('google_ads_token');
      setIsAuthenticated(!!token);
      
      const savedCustomerId = localStorage.getItem('google_ads_customer_id');
      if (savedCustomerId) {
        setCustomerId(savedCustomerId);
        if (token) {
          fetchAllData(savedCustomerId);
        }
      }
    }
  }, []);

  const fetchAllData = async (customerIdToUse?: string) => {
    const idToUse = customerIdToUse || customerId;
    if (!idToUse.trim()) {
      setError('Por favor, insira um Customer ID válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      localStorage.setItem('google_ads_customer_id', idToUse);

      // Buscar todos os dados em paralelo
      const [campaignsResponse, metricsResponse] = await Promise.all([
        campaignsService.getCampaigns(idToUse, { 
          limit: 100,
          status: filterStatus !== 'all' ? filterStatus : undefined 
        }),
        metricsService.getSummary(idToUse)
      ]);

      setCampaigns(campaignsResponse.data.campaigns);
      setMetrics(metricsResponse.data.summary);

      // Buscar informações da conta se disponível
      try {
        const accountResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/account/${idToUse}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('google_ads_token')}`
          }
        });
        
        if (accountResponse.ok) {
          const accountData = await accountResponse.json();
          setAccountInfo(accountData.data.account);
        }
      } catch (accountError) {
        console.warn('Não foi possível buscar informações da conta:', accountError);
      }

    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error 
        : 'Erro ao buscar dados. Verifique sua autenticação.';
      setError(errorMessage || 'Erro ao buscar dados. Verifique sua autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('google_ads_token');
    localStorage.removeItem('google_ads_customer_id');
    window.location.href = '/auth';
  };

  const formatCurrency = (value: number) => {
    const currency = accountInfo?.currency || 'BRL';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'enabled':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'removed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'enabled':
        return 'Ativa';
      case 'paused':
        return 'Pausada';
      case 'removed':
        return 'Removida';
      default:
        return status;
    }
  };

  // Filtrar campanhas por status
  const filteredCampaigns = campaigns.filter(campaign => 
    filterStatus === 'all' || campaign.status.toLowerCase() === filterStatus.toLowerCase()
  );

  // Dados para gráficos
  const campaignChartData = filteredCampaigns.slice(0, 10).map(campaign => ({
    name: campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name,
    impressions: campaign.impressions,
    clicks: campaign.clicks,
    cost: campaign.cost,
    ctr: parseFloat(campaign.ctr)
  }));

  const statusDistribution = campaigns.reduce((acc, campaign) => {
    const status = getStatusText(campaign.status);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusDistribution).map(([status, count]) => ({
    name: status,
    value: count
  }));

  // Dados de performance simulados para gráfico de tendência
  const performanceTrend = [
    { day: 'Seg', impressions: 45000, clicks: 1800, cost: 1080, ctr: 4.0 },
    { day: 'Ter', impressions: 52000, clicks: 2080, cost: 1248, ctr: 4.0 },
    { day: 'Qua', impressions: 48000, clicks: 1920, cost: 1152, ctr: 4.0 },
    { day: 'Qui', impressions: 55000, clicks: 2200, cost: 1320, ctr: 4.0 },
    { day: 'Sex', impressions: 51000, clicks: 2040, cost: 1224, ctr: 4.0 },
    { day: 'Sáb', impressions: 58000, clicks: 2320, cost: 1392, ctr: 4.0 },
    { day: 'Dom', impressions: 40000, clicks: 1600, cost: 960, ctr: 4.0 }
  ];

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Google Ads
              </h1>
              {accountInfo && (
                <p className="text-sm text-gray-600 mt-1">
                  {accountInfo.name} • {accountInfo.currency} • {accountInfo.timezone}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => fetchAllData()} 
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Atualizar
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Controles */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações e Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="customerId">Customer ID</Label>
                <Input
                  id="customerId"
                  placeholder="123-456-7890"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status">Status das Campanhas</Label>
                <select
                  id="status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">Todas</option>
                  <option value="enabled">Ativas</option>
                  <option value="paused">Pausadas</option>
                  <option value="removed">Removidas</option>
                </select>
              </div>
              <div>
                <Label htmlFor="dateRange">Período</Label>
                <select
                  id="dateRange"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 90 dias</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => fetchAllData()} 
                  disabled={loading}
                  className="w-full flex items-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Filter className="w-4 h-4" />
                  )}
                  {loading ? 'Carregando...' : 'Aplicar Filtros'}
                </Button>
              </div>
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
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Campanhas
                </CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalCampaigns}</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {metrics.activeCampaigns} ativas
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Impressões
                </CardTitle>
                <Eye className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(metrics.totalImpressions)}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% vs período anterior
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cliques
                </CardTitle>
                <MousePointer className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(metrics.totalClicks)}
                </div>
                <p className="text-xs text-gray-600">
                  CTR: {metrics.averageCtr}%
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Custo Total
                </CardTitle>
                <DollarSign className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(metrics.totalCost)}
                </div>
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  +8% vs período anterior
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráficos */}
        {campaigns.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Performance por Campanha */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance por Campanha
                </CardTitle>
                <CardDescription>
                  Top 10 campanhas por impressões e cliques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={campaignChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'cost' ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                      name === 'impressions' ? 'Impressões' : name === 'clicks' ? 'Cliques' : 'Custo'
                    ]} />
                    <Bar dataKey="impressions" fill="#8884d8" name="impressions" />
                    <Bar dataKey="clicks" fill="#82ca9d" name="clicks" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição por Status */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
                <CardDescription>Status das campanhas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
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

        {/* Tendência de Performance */}
        {campaigns.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tendência de Performance - Últimos 7 Dias
              </CardTitle>
              <CardDescription>
                Evolução das métricas principais ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'cost' ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                    name === 'impressions' ? 'Impressões' : name === 'clicks' ? 'Cliques' : name === 'ctr' ? 'CTR (%)' : 'Custo'
                  ]} />
                  <Area type="monotone" dataKey="impressions" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="clicks" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="cost" stackId="3" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Lista de Campanhas */}
        {filteredCampaigns.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Campanhas ({filteredCampaigns.length})</CardTitle>
                  <CardDescription>
                    Lista completa das suas campanhas do Google Ads
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-medium">Nome</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-right p-3 font-medium">Orçamento</th>
                      <th className="text-right p-3 font-medium">Impressões</th>
                      <th className="text-right p-3 font-medium">Cliques</th>
                      <th className="text-right p-3 font-medium">CTR</th>
                      <th className="text-right p-3 font-medium">Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-medium max-w-xs">
                          <div className="truncate" title={campaign.name}>
                            {campaign.name}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={getStatusColor(campaign.status)}>
                            {getStatusText(campaign.status)}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          {formatCurrency(campaign.budget)}
                        </td>
                        <td className="p-3 text-right">
                          {formatNumber(campaign.impressions)}
                        </td>
                        <td className="p-3 text-right">
                          {formatNumber(campaign.clicks)}
                        </td>
                        <td className="p-3 text-right font-mono">{campaign.ctr}%</td>
                        <td className="p-3 text-right font-semibold">
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
                Insira seu Customer ID e clique em &quot;Aplicar Filtros&quot; para começar
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}