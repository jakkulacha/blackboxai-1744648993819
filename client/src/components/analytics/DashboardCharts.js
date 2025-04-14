import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { analyticsAPI } from '../../services/api';
import { PageLoader } from '../common/LoadingSpinner';

const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  tertiary: '#F59E0B',
  quaternary: '#6366F1',
  success: '#22C55E',
  danger: '#EF4444'
};

const PERIODS = [
  { id: 'week', label: 'Week', icon: 'calendar-week' },
  { id: 'month', label: 'Month', icon: 'calendar-alt' },
  { id: 'year', label: 'Year', icon: 'calendar' },
  { id: 'all', label: 'All Time', icon: 'infinity' }
];

const CHART_TYPES = [
  { id: 'line', label: 'Line', icon: 'chart-line' },
  { id: 'bar', label: 'Bar', icon: 'chart-bar' },
  { id: 'area', label: 'Area', icon: 'chart-area' },
  { id: 'pie', label: 'Pie', icon: 'chart-pie' }
];

const DashboardCharts = ({ userType = 'instructor' }) => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [completionData, setCompletionData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedChartType, setSelectedChartType] = useState('line');
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    loadChartData();
  }, [selectedPeriod]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const [revenueStats, enrollmentStats, completionStats, categoryStats] = await Promise.all([
        analyticsAPI.getRevenueStats({ period: selectedPeriod }),
        analyticsAPI.getEnrollmentStats({ period: selectedPeriod }),
        analyticsAPI.getCompletionStats({ period: selectedPeriod }),
        analyticsAPI.getCategoryStats()
      ]);

      setRevenueData(revenueStats.data.data);
      setEnrollmentData(enrollmentStats.data.data);
      setCompletionData(completionStats.data.data);
      setCategoryData(categoryStats.data.data);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const getChartComponent = (type, data, config) => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
      ...config
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={config.tickFormatter}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={config.tooltipFormatter}
            />
            <Legend />
            {config.lines.map((line, index) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={{ r: 4, fill: line.color }}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={config.tickFormatter}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={config.tooltipFormatter}
            />
            <Legend />
            {config.areas.map((area, index) => (
              <Area
                key={area.key}
                type="monotone"
                dataKey={area.key}
                name={area.name}
                fill={area.color}
                stroke={area.color}
                fillOpacity={0.2}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={config.tickFormatter}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={config.tooltipFormatter}
            />
            <Legend />
            {config.bars.map((bar, index) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                name={bar.name}
                fill={bar.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey={config.dataKey}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={config.colors[index % config.colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={config.tooltipFormatter}
            />
            <Legend />
          </PieChart>
        );

      default:
        return null;
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Period Selection */}
        <div className="flex space-x-2">
          {PERIODS.map(period => (
            <motion.button
              key={period.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPeriod(period.id)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                selectedPeriod === period.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <i className={`fas fa-${period.icon} mr-2`}></i>
              {period.label}
            </motion.button>
          ))}
        </div>

        {/* Chart Type Selection */}
        <div className="flex space-x-2">
          {CHART_TYPES.map(type => (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedChartType(type.id)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                selectedChartType === type.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <i className={`fas fa-${type.icon} mr-2`}></i>
              {type.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Revenue Overview</h3>
            <div className="text-sm text-gray-500">
              Total: {formatCurrency(revenueData.reduce((sum, item) => sum + item.revenue, 0))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {getChartComponent(selectedChartType, revenueData, {
                tickFormatter: formatCurrency,
                tooltipFormatter: (value) => formatCurrency(value),
                lines: [
                  { key: 'revenue', name: 'Revenue', color: CHART_COLORS.primary }
                ],
                areas: [
                  { key: 'revenue', name: 'Revenue', color: CHART_COLORS.primary }
                ],
                bars: [
                  { key: 'revenue', name: 'Revenue', color: CHART_COLORS.primary }
                ]
              })}
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Enrollment Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Enrollment Trends</h3>
            <div className="text-sm text-gray-500">
              Total: {enrollmentData.reduce((sum, item) => sum + item.enrollments, 0)}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {getChartComponent(selectedChartType, enrollmentData, {
                tickFormatter: (value) => value,
                tooltipFormatter: (value) => value,
                lines: [
                  { key: 'enrollments', name: 'Enrollments', color: CHART_COLORS.secondary }
                ],
                areas: [
                  { key: 'enrollments', name: 'Enrollments', color: CHART_COLORS.secondary }
                ],
                bars: [
                  { key: 'enrollments', name: 'Enrollments', color: CHART_COLORS.secondary }
                ]
              })}
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Completion Rate Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Completion Rates</h3>
            <div className="text-sm text-gray-500">
              Average: {formatPercentage(
                completionData.reduce((sum, item) => sum + item.completionRate, 0) /
                completionData.length
              )}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {getChartComponent(selectedChartType, completionData, {
                tickFormatter: formatPercentage,
                tooltipFormatter: (value) => formatPercentage(value),
                lines: [
                  { key: 'completionRate', name: 'Completion Rate', color: CHART_COLORS.tertiary }
                ],
                areas: [
                  { key: 'completionRate', name: 'Completion Rate', color: CHART_COLORS.tertiary }
                ],
                bars: [
                  { key: 'completionRate', name: 'Completion Rate', color: CHART_COLORS.tertiary }
                ]
              })}
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Category Distribution</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Total Revenue ({selectedPeriod})
          </h4>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(
              revenueData.reduce((sum, item) => sum + item.revenue, 0)
            )}
          </p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <i className="fas fa-arrow-up mr-1"></i>
              12%
            </span>
            <span className="text-gray-500 ml-2">vs previous {selectedPeriod}</span>
          </div>
        </motion.div>

        {/* Total Enrollments Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Total Enrollments ({selectedPeriod})
          </h4>
          <p className="text-2xl font-bold text-gray-900">
            {enrollmentData.reduce((sum, item) => sum + item.enrollments, 0)}
          </p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <i className="fas fa-arrow-up mr-1"></i>
              8%
            </span>
            <span className="text-gray-500 ml-2">vs previous {selectedPeriod}</span>
          </div>
        </motion.div>

        {/* Average Revenue Per Enrollment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Avg. Revenue Per Enrollment
          </h4>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(
              revenueData.reduce((sum, item) => sum + item.revenue, 0) /
                Math.max(
                  enrollmentData.reduce((sum, item) => sum + item.enrollments, 0),
                  1
                )
            )}
          </p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-red-500 flex items-center">
              <i className="fas fa-arrow-down mr-1"></i>
              3%
            </span>
            <span className="text-gray-500 ml-2">vs previous {selectedPeriod}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardCharts;
