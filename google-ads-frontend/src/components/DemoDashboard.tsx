'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  DollarSign, 
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  LogOut
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Dados de demonstração
const demoCampaigns = [
  {
    id: '1',
    name: 'Campanha Black Friday 2024',
    status: 'ENABLED',
    budget: 5000,
    impressions: 125000,
    clicks: 6250,
    cost: 3750.50,
    ctr: '5.00'
  },
  {
    id: '2', 
    name: 'Produtos Eletrônicos',
    status: 'ENABLED',
    budget: 3000,
    impressions: 89000,
    clicks: 3560,
    cost: 2140.25,
    ctr: '4.00'
  },
  {
    id: '3',
    name: 'Campanha Natal',
    status: 'PAUSED',
    budget: 2000,
    impressions: 45000,
    clicks: 1350,
    cost: 810.75,
    ctr: '3.00'
  },
  {
    id: '4',
    name: 'Remarketing Site',
    status: 'ENABLED',
    budget: 1500,
    impressions: 67000,
    clicks: 2010,
    cost: 1206.30,
    ctr: '3.00'
  },
  {
    id: '5',
    name: 'Campanha Brand',
    status: 'REMOVED',
    budget: 1000,
    impressions: 23000,
    clicks: 690,
    cost: 414.20,
    ctr: '3.00'
  }
];

const demoMetrics = {
  totalCampaigns: 5,
  activeCampaigns: 3,
  totalImpressions: 349000,
  totalClicks: 13860,
  totalCost: 8322.00,
  averageCtr: '3.97'
};

const performanceData = demoCampaigns.map(campaign => ({
  name: campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name,
  impressions: campaign.impressions,
  clicks: campaign.clicks,
  cost: campaign.cost
}));

const statusDistribution = demoCampaigns.reduce((acc, campaign) => {
  const status = campaign.status;
  acc[status] = (acc[status] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const pieData = Object.entries(statusDistribution).map(([status, count]) => ({
  name: status,
  value: count
}));

// Dados de performance por dia (últimos 7 dias)
const dailyPerformance = [
  { day: 'Dom', impressions: 45000, clicks: 1800, cost: 1080 },
  { day: 'Seg', impressions: 52000, clicks: 2080, cost: 1248 },
  { day: 'Ter', impressions: 48000, clicks: 1920, cost: 1152 },
  { day: 'Qua', impressions: 55000, clicks: 2200, cost: 1320 },
  { day: 'Qui', impressions: 51000, clicks: 2040, cost: 1224 },
  { day: 'Sex', impressions: 58000, clicks: 2320, cost: 1392 },
  { day: 'Sáb', impressions: 40000, clicks: 1600, cost: 960 }
];

export default function DemoDashboard() {
  const [loading, setLoading] = useState(false);

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
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'removed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('google_ads_token');
    localStorage.removeItem('google_ads_customer_id');
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Google Ads
            </h1>
            <p className="text-gray-600">
              Demonstração - Visualize e monitore suas campanhas do Google Ads
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleRefresh} 
              disabled={loading}
              variant="outline"
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
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Alerta de demonstração */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Modo Demonstração:</strong> Estes são dados fictícios para demonstrar a interface. 
            Configure suas credenciais do Google Ads para ver dados reais.
          </AlertDescription>
        </Alert>

        {/* Métricas Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Campanhas
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{demoMetrics.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                {demoMetrics.activeCampaigns} ativas
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
                {formatNumber(demoMetrics.totalImpressions)}
              </div>
              <p className="text-xs text-green-600">
                +12% vs mês anterior
              </p>
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
                {formatNumber(demoMetrics.totalClicks)}
              </div>
              <p className="text-xs text-muted-foreground">
                CTR: {demoMetrics.averageCtr}%
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
                {formatCurrency(demoMetrics.totalCost)}
              </div>
              <p className="text-xs text-red-600">
                +8% vs mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Campanha</CardTitle>
              <CardDescription>Impressões e cliques por campanha</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
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
                    label={({ name, percent }) => `${getStatusText(name)}: ${(percent * 100).toFixed(0)}%`}
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

        {/* Performance Diária */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Performance dos Últimos 7 Dias</CardTitle>
            <CardDescription>Tendência de impressões, cliques e custos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'cost' ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                  name === 'impressions' ? 'Impressões' : name === 'clicks' ? 'Cliques' : 'Custo'
                ]} />
                <Line type="monotone" dataKey="impressions" stroke="#8884d8" name="impressions" />
                <Line type="monotone" dataKey="clicks" stroke="#82ca9d" name="clicks" />
                <Line type="monotone" dataKey="cost" stroke="#ffc658" name="cost" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lista de Campanhas */}
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
                    <th className="text-right p-2">Orçamento</th>
                    <th className="text-right p-2">Impressões</th>
                    <th className="text-right p-2">Cliques</th>
                    <th className="text-right p-2">CTR</th>
                    <th className="text-right p-2">Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {demoCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{campaign.name}</td>
                      <td className="p-2">
                        <Badge className={getStatusColor(campaign.status)}>
                          {getStatusText(campaign.status)}
                        </Badge>
                      </td>
                      <td className="p-2 text-right">
                        {formatCurrency(campaign.budget)}
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
      </div>
    </div>
  );
}