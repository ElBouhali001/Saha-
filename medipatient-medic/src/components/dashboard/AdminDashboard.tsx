
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, FileText, Settings, Package, BarChart3 } from 'lucide-react';
import ModuleManager from '../admin/ModuleManager';
import SubscriptionManager from '../admin/SubscriptionManager';
import SpecialtyManager from '../admin/SpecialtyManager';
import DoctorRoleManager from '../admin/DoctorRoleManager';
import UserRoleManager from '../admin/UserRoleManager';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { title: t('dashboard.stats.active_users'), value: '127', icon: Users, color: 'text-blue-600' },
    { title: t('dashboard.stats.today_appointments'), value: '23', icon: Calendar, color: 'text-green-600' },
    { title: t('dashboard.stats.consultations'), value: '89', icon: FileText, color: 'text-purple-600' },
    { title: t('dashboard.stats.active_modules'), value: '8', icon: Package, color: 'text-orange-600' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('dashboard.admin.title')}
          </h1>
          <p className="text-gray-600">
            {t('dashboard.welcome_user', { name: `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}` })}
          </p>
        </div>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          {t('dashboard.actions.settings')}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">{t('dashboard.admin.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="modules">{t('dashboard.admin.tabs.modules')}</TabsTrigger>
          <TabsTrigger value="subscription">{t('dashboard.admin.tabs.subscription')}</TabsTrigger>
          <TabsTrigger value="specialties">{t('dashboard.admin.tabs.specialties')}</TabsTrigger>
          <TabsTrigger value="roles">{t('dashboard.admin.tabs.roles')}</TabsTrigger>
          <TabsTrigger value="users">{t('dashboard.admin.tabs.users')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('dashboard.admin.tabs.analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.actions.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="w-6 h-6 mb-2" />
                  {t('dashboard.actions.manage_users')}
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Package className="w-6 h-6 mb-2" />
                  {t('dashboard.actions.manage_modules')}
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="w-6 h-6 mb-2" />
                  {t('dashboard.actions.reports')}
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Settings className="w-6 h-6 mb-2" />
                  {t('dashboard.actions.configuration')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules">
          <ModuleManager />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionManager />
        </TabsContent>

        <TabsContent value="specialties">
          <SpecialtyManager />
        </TabsContent>

        <TabsContent value="roles">
          <DoctorRoleManager />
        </TabsContent>

        <TabsContent value="users">
          <UserRoleManager />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytiques et Rapports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Section d'analytiques en cours de développement...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
