import React from 'react';
import { useAppSelector } from '../store/hooks';
import { BarChart3, MessageSquare, Send, Clock, TrendingUp, Users } from 'lucide-react';

const Statistics: React.FC = () => {
  const { messages } = useAppSelector((state) => state.messageHistory);
  const { flights } = useAppSelector((state) => state.flights);
  const { templates } = useAppSelector((state) => state.templates);

  // Calculate statistics
  const totalMessages = messages.length;
  const sentMessages = messages.filter(msg => msg.sentAt).length;
  const pendingMessages = totalMessages - sentMessages;
  const totalFlights = flights.length;
  const activeTemplates = templates.filter(t => t.isActive).length;
  const totalTemplates = templates.length;

  // Messages by day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const messagesByDay = last7Days.map(date => ({
    date,
    count: messages.filter(msg => msg.createdAt.startsWith(date)).length
  }));

  // Most used templates
  const templateUsage = templates.map(template => ({
    name: template.name,
    count: messages.filter(msg => msg.templateId === template.id).length
  })).sort((a, b) => b.count - a.count);

  // Most common routes
  const routeUsage = messages.reduce((acc, msg) => {
    const route = `${msg.departureCity} → ${msg.arrivalCity}`;
    acc[route] = (acc[route] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topRoutes = Object.entries(routeUsage)
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-6">
            <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              סטטיסטיקות מערכת
            </h3>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">סה"כ הודעות</p>
                  <p className="text-2xl font-bold text-blue-900">{totalMessages}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center">
                <Send className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">הודעות שנשלחו</p>
                  <p className="text-2xl font-bold text-green-900">{sentMessages}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-600">הודעות ממתינות</p>
                  <p className="text-2xl font-bold text-yellow-900">{pendingMessages}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">תבניות פעילות</p>
                  <p className="text-2xl font-bold text-purple-900">{activeTemplates}/{totalTemplates}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Messages by Day */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">הודעות לפי יום (7 ימים אחרונים)</h4>
              <div className="space-y-3">
                {messagesByDay.map(({ date, count }) => (
                  <div key={date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(date).toLocaleDateString('he-IL')}
                    </span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.max(5, (count / Math.max(...messagesByDay.map(d => d.count), 1)) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-left">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Templates */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">תבניות בשימוש</h4>
              <div className="space-y-3">
                {templateUsage.slice(0, 5).map(({ name, count }) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 truncate flex-1 mr-3">{name}</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${Math.max(5, (count / Math.max(...templateUsage.map(t => t.count), 1)) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-left">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Routes */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">מסלולים פופולריים</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topRoutes.map(({ route, count }) => (
                <div key={route} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{route}</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-8 bg-blue-50 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-blue-900 mb-3">סיכום</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">אחוז הודעות שנשלחו:</span>
                <span className="ml-2 text-blue-900 font-bold">
                  {totalMessages > 0 ? Math.round((sentMessages / totalMessages) * 100) : 0}%
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">ממוצע הודעות ליום:</span>
                <span className="ml-2 text-blue-900 font-bold">
                  {Math.round(totalMessages / 7 * 10) / 10}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">תבניות בשימוש:</span>
                <span className="ml-2 text-blue-900 font-bold">
                  {templateUsage.filter(t => t.count > 0).length}/{totalTemplates}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

