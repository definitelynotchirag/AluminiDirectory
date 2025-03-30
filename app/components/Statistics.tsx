'use client'
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js';
import { Alumni } from '../types/alumni';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface StatisticsProps {
  data: Alumni[];
}

export function Statistics({ data }: StatisticsProps) {
  // Process data for companies
  const companyStats = data.reduce((acc, curr) => {
    if (curr.current_company) {
      acc[curr.current_company] = (acc[curr.current_company] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Get top 10 companies
  const topCompanies = Object.entries(companyStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  // Process data for locations
  const locationStats = data.reduce((acc, curr) => {
    if (curr.location_name) {
      acc[curr.location_name] = (acc[curr.location_name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Get top 5 locations
  const topLocations = Object.entries(locationStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Process graduation years
  const gradYearStats = data.reduce((acc, curr) => {
    const year = curr.education_end_1?.split('.')?.[0] || curr.education_end_1;
    if (year) {
      acc[year] = (acc[year] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Sort years and create graduation trend data
  const sortedYears = Object.entries(gradYearStats)
    .sort(([a], [b]) => Number(a) - Number(b));

  // Process roles
  const roleCategories = {
    'Engineering': ['engineer', 'developer', 'architect', 'programmer'],
    'Management': ['manager', 'lead', 'head', 'director', 'cto', 'ceo'],
    'Data': ['data', 'analyst', 'scientist', 'ml', 'ai'],
    'Product': ['product', 'designer', 'ux', 'ui'],
    'Other': []
  };

  const roleStats = data.reduce((acc, curr) => {
    const role = curr.current_company_position?.toLowerCase() || '';
    let category = 'Other';
    
    for (const [cat, keywords] of Object.entries(roleCategories)) {
      if (keywords.some(keyword => role.includes(keyword))) {
        category = cat;
        break;
      }
    }
    
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate average experience (rough estimate based on first graduation)
  const currentYear = new Date().getFullYear();
  const totalExperience = data.reduce((acc, curr) => {
    const gradYear = Number(curr.education_end_1?.split('.')?.[0]);
    if (!isNaN(gradYear)) {
      return acc + (currentYear - gradYear);
    }
    return acc;
  }, 0);
  const avgExperience = (totalExperience / data.length).toFixed(1);

  // Chart configurations
  const companyChartData = {
    labels: topCompanies.map(([company]) => company),
    datasets: [{
      label: 'Number of Alumni',
      data: topCompanies.map(([,count]) => count),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    }]
  };

  const locationChartData = {
    labels: topLocations.map(([location]) => location),
    datasets: [{
      data: topLocations.map(([,count]) => count),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF'
      ],
    }]
  };

  const gradYearChartData = {
    labels: sortedYears.map(([year]) => year),
    datasets: [{
      label: 'Graduates',
      data: sortedYears.map(([,count]) => count),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const roleChartData = {
    labels: Object.keys(roleStats),
    datasets: [{
      data: Object.values(roleStats),
      backgroundColor: [
        '#FF9F40',
        '#4BC0C0',
        '#FF6384',
        '#36A2EB',
        '#9966FF'
      ],
    }]
  };

  return (
    <div className="mb-8 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Statistics</h2>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm text-blue-600 font-medium">Total Alumni</h4>
          <p className="text-2xl font-bold text-gray-800">{data.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm text-green-600 font-medium">Average Experience</h4>
          <p className="text-2xl font-bold text-gray-800">{avgExperience} years</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="text-sm text-purple-600 font-medium">Unique Companies</h4>
          <p className="text-2xl font-bold text-gray-800">{Object.keys(companyStats).length}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-800">Top Companies</h3>
          <Bar
            data={companyChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-800">Graduation Year Trend</h3>
          <Line 
            data={gradYearChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-800">Alumni by Location</h3>
          <Doughnut
            data={locationChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'right' as const }
              }
            }}
          />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-800">Role Distribution</h3>
          <Doughnut 
            data={roleChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'right' as const }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
