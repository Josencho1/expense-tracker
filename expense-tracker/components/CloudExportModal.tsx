'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types/expense';
import {
  EXPORT_TEMPLATES,
  CLOUD_PROVIDERS,
  ExportTemplate,
  CloudProvider,
  ScheduleFrequency,
  getExportHistory,
  getScheduledExports,
  getCloudIntegrations,
  addScheduledExport,
  deleteScheduledExport,
  toggleScheduledExport,
  toggleCloudIntegration,
  exportByTemplate,
  generateShareableLink,
  clearExportHistory,
} from '@/lib/cloudExport';
import { formatCurrency } from '@/lib/utils';
import {
  X,
  Cloud,
  Calendar,
  History,
  Share2,
  Download,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Link as LinkIcon,
  Trash2,
  Plus,
  Power,
  Loader2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface CloudExportModalProps {
  expenses: Expense[];
  onClose: () => void;
}

type Tab = 'templates' | 'integrations' | 'schedule' | 'history' | 'share';

export default function CloudExportModal({ expenses, onClose }: CloudExportModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<CloudProvider | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Schedule state
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState<ScheduleFrequency>('monthly');
  const [scheduleTemplate, setScheduleTemplate] = useState<ExportTemplate>('monthly-summary');
  const [scheduleDestination, setScheduleDestination] = useState<CloudProvider>('email');

  // Share state
  const [shareLink, setShareLink] = useState('');
  const [showQR, setShowQR] = useState(false);

  // Dynamic data
  const [exportHistory, setExportHistory] = useState(getExportHistory());
  const [scheduledExports, setScheduledExports] = useState(getScheduledExports());
  const [integrations, setIntegrations] = useState(getCloudIntegrations());

  const refreshData = () => {
    setExportHistory(getExportHistory());
    setScheduledExports(getScheduledExports());
    setIntegrations(getCloudIntegrations());
  };

  const handleExport = async () => {
    if (!selectedTemplate) return;

    setIsExporting(true);
    setExportSuccess(false);

    // Simulate cloud upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    exportByTemplate(expenses, selectedTemplate, selectedDestination || undefined);

    setIsExporting(false);
    setExportSuccess(true);
    refreshData();

    setTimeout(() => {
      setExportSuccess(false);
      setSelectedTemplate(null);
      setSelectedDestination(null);
    }, 2000);
  };

  const handleAddSchedule = () => {
    if (!scheduleName.trim()) {
      alert('Please enter a schedule name');
      return;
    }

    const nextRun = calculateNextRun(scheduleFrequency);

    addScheduledExport({
      name: scheduleName,
      template: scheduleTemplate,
      frequency: scheduleFrequency,
      destination: scheduleDestination,
      enabled: true,
      nextRun,
    });

    setScheduleName('');
    refreshData();
  };

  const handleToggleIntegration = (provider: CloudProvider) => {
    if (provider === 'email') return; // Email is always connected

    // Simulate OAuth flow
    const confirmed = confirm(`Connect to ${provider}? This will open an authentication window.`);
    if (confirmed) {
      toggleCloudIntegration(provider);
      refreshData();
    }
  };

  const handleGenerateShareLink = () => {
    const link = generateShareableLink(expenses);
    setShareLink(link);
    setShowQR(true);
  };

  const calculateNextRun = (frequency: ScheduleFrequency): string => {
    const now = new Date();
    const next = new Date(now);

    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return next.toISOString();
  };

  const getTabIcon = (tab: Tab) => {
    switch (tab) {
      case 'templates':
        return <Download size={18} />;
      case 'integrations':
        return <Cloud size={18} />;
      case 'schedule':
        return <Calendar size={18} />;
      case 'history':
        return <History size={18} />;
      case 'share':
        return <Share2 size={18} />;
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'templates', label: 'Templates' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'history', label: 'History' },
    { id: 'share', label: 'Share' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2.5 rounded-xl backdrop-blur-sm">
                <Cloud size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Cloud Export Center</h2>
                <p className="text-blue-100 text-sm">
                  Export, sync, schedule, and share your expense data
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                {getTabIcon(tab.id)}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Export Templates</h3>
              <p className="text-gray-600 mb-6">
                Choose a professionally designed template optimized for different use cases
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {EXPORT_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-5 rounded-xl border-2 transition-all text-left ${
                      selectedTemplate === template.id
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{template.icon}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          template.format === 'pdf'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {template.format.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    {template.includesCharts && (
                      <span className="inline-flex items-center gap-1 text-xs text-purple-600">
                        <Zap size={12} />
                        Includes charts
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {selectedTemplate && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Select Destination (Optional)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    {integrations
                      .filter(i => i.connected)
                      .map(integration => (
                        <button
                          key={integration.provider}
                          onClick={() => setSelectedDestination(integration.provider)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedDestination === integration.provider
                              ? 'border-purple-500 bg-white shadow-md'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{integration.icon}</div>
                          <div className="text-xs font-medium text-gray-700">
                            {integration.name}
                          </div>
                        </button>
                      ))}
                  </div>

                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                      isExporting || exportSuccess
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Exporting...
                      </>
                    ) : exportSuccess ? (
                      <>
                        <CheckCircle size={20} />
                        Export Complete!
                      </>
                    ) : (
                      <>
                        <Download size={20} />
                        Export Now
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cloud Integrations</h3>
              <p className="text-gray-600 mb-6">
                Connect your favorite cloud services to sync and backup expense data automatically
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map(integration => (
                  <div
                    key={integration.provider}
                    className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{integration.icon}</span>
                        <div>
                          <h4 className="font-bold text-gray-900">{integration.name}</h4>
                          <p className="text-sm text-gray-600">{integration.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        {integration.connected ? (
                          <>
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="text-sm font-medium text-green-600">Connected</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-500">
                              Not connected
                            </span>
                          </>
                        )}
                      </div>

                      {integration.provider !== 'email' && (
                        <button
                          onClick={() => handleToggleIntegration(integration.provider)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            integration.connected
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {integration.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      )}
                    </div>

                    {integration.lastSync && (
                      <p className="text-xs text-gray-500 mt-2">
                        Last sync: {new Date(integration.lastSync).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Scheduled Exports</h3>
              <p className="text-gray-600 mb-6">
                Set up automatic recurring exports to keep your data backed up and synced
              </p>

              {/* Create Schedule */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-purple-200 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Create New Schedule</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule Name
                    </label>
                    <input
                      type="text"
                      value={scheduleName}
                      onChange={e => setScheduleName(e.target.value)}
                      placeholder="e.g., Monthly backup"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={scheduleFrequency}
                      onChange={e => setScheduleFrequency(e.target.value as ScheduleFrequency)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template
                    </label>
                    <select
                      value={scheduleTemplate}
                      onChange={e => setScheduleTemplate(e.target.value as ExportTemplate)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {EXPORT_TEMPLATES.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination
                    </label>
                    <select
                      value={scheduleDestination}
                      onChange={e => setScheduleDestination(e.target.value as CloudProvider)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {integrations
                        .filter(i => i.connected)
                        .map(i => (
                          <option key={i.provider} value={i.provider}>
                            {i.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleAddSchedule}
                  className="mt-4 flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <Plus size={18} />
                  Create Schedule
                </button>
              </div>

              {/* Active Schedules */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Active Schedules</h4>
                {scheduledExports.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No scheduled exports yet. Create one above!
                  </p>
                ) : (
                  scheduledExports.map(schedule => (
                    <div
                      key={schedule.id}
                      className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => {
                            toggleScheduledExport(schedule.id);
                            refreshData();
                          }}
                          className={`p-2 rounded-lg transition-all ${
                            schedule.enabled
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Power size={20} />
                        </button>

                        <div>
                          <h5 className="font-semibold text-gray-900">{schedule.name}</h5>
                          <p className="text-sm text-gray-600">
                            {schedule.frequency} • {schedule.template} → {schedule.destination}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Clock size={12} />
                            Next run: {new Date(schedule.nextRun).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          deleteScheduledExport(schedule.id);
                          refreshData();
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Export History</h3>
                  <p className="text-gray-600 text-sm">
                    View all your past exports and re-download if needed
                  </p>
                </div>
                {exportHistory.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Clear all export history?')) {
                        clearExportHistory();
                        refreshData();
                      }
                    }}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {exportHistory.length === 0 ? (
                <div className="text-center py-12">
                  <History size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No export history yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exportHistory.map(item => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">
                              {EXPORT_TEMPLATES.find(t => t.id === item.template)?.icon}
                            </span>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {EXPORT_TEMPLATES.find(t => t.id === item.template)?.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {new Date(item.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              {item.recordCount} records
                            </span>
                            <span className="text-gray-600">
                              {formatCurrency(item.totalAmount)}
                            </span>
                            {item.destination && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                {item.destination}
                              </span>
                            )}
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                item.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : item.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Share Tab */}
          {activeTab === 'share' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Share Your Data</h3>
              <p className="text-gray-600 mb-6">
                Generate shareable links and QR codes for easy data sharing with accountants,
                partners, or other apps
              </p>

              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <LinkIcon size={20} />
                    Generate Shareable Link
                  </h4>

                  <button
                    onClick={handleGenerateShareLink}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium mb-4"
                  >
                    <Share2 size={20} />
                    Generate Link
                  </button>

                  {shareLink && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-purple-300">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Shareable Link
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(shareLink);
                              alert('Link copied to clipboard!');
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                          >
                            Copy
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          This link expires in 7 days
                        </p>
                      </div>

                      {showQR && (
                        <div className="bg-white rounded-lg p-6 border border-purple-300 text-center">
                          <h5 className="font-semibold text-gray-900 mb-4">QR Code</h5>
                          <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
                            <QRCodeSVG value={shareLink} size={200} />
                          </div>
                          <p className="text-sm text-gray-600 mt-4">
                            Scan this code to access your shared expense data
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Email Share */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail size={20} />
                    Send via Email
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="accountant@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Add a message for the recipient..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <button
                      onClick={() => alert('Email sent! (This is a demo)')}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      <Mail size={20} />
                      Send Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {expenses.length} expenses • {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))} total
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
