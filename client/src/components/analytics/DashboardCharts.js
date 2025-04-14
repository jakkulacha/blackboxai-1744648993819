import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const ProgressChart = ({ data }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold mb-4">Learning Progress</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="progress" stroke="#3B82F6" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const EngagementChart = ({ data }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold mb-4">Student Engagement</h3>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="activeStudents" stroke="#10B981" fill="#D1FAE5" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const CourseCompletionChart = ({ data }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold mb-4">Course Completion Rates</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="course" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="completionRate" fill="#6366F1" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const TimeSpentChart = ({ data }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold mb-4">Time Spent Learning</h3>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="hours" stroke="#8B5CF6" fill="#EDE9FE" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
