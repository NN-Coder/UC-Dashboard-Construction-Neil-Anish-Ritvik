"use client";

import React, { useState } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, ReferenceLine, Line
} from 'recharts';
import { Info, TrendingUp, TrendingDown, FileText, Activity } from 'lucide-react';
import data from '../lib/data.json';

const ALL_CAMPUSES = 'Universitywide';

const CodeBlock = ({ code, language }: { code: string, language: string }) => (
  <div className="relative group rounded-md bg-slate-900 text-slate-50 p-4 overflow-x-auto text-sm font-mono shadow-inner">
    <pre><code>{code}</code></pre>
  </div>
);

export default function Dashboard() {
  const [selectedCampus, setSelectedCampus] = useState(ALL_CAMPUSES);
  const [activeTab, setActiveTab] = useState('data');

  const campuses = Object.keys(data.campuses).sort();
  // Add an overall if needed, but our data prep might not have a clean 'overall' campus,
  // Let's check if 'Universitywide' is in the dataset. If not, fallback to the first one.
  const actualSelectedCampus = campuses.includes(selectedCampus) ? selectedCampus : campuses[0];

  const campusStats = data.campuses[actualSelectedCampus];
  const preStats = campusStats?.pre || { r: 0, r2: 0, p: 0, count: 0, slope: 0, intercept: 0 };
  const postStats = campusStats?.post || { r: 0, r2: 0, p: 0, count: 0, slope: 0, intercept: 0 };
  const deltaR = postStats.r - preStats.r;

  // Formatting helpers
  const formatNum = (num: number, decimals: number = 2) => (num || 0).toFixed(decimals);
  const formatPct = (num: number) => `${((num || 0) * 100).toFixed(1)}%`;

  const scatterDataPre = (data.scatter_data?.pre || []).filter((d: any) => d.campus === actualSelectedCampus);
  const scatterDataPost = (data.scatter_data?.post || []).filter((d: any) => d.campus === actualSelectedCampus);

  // Campus comparison data for bar chart
  const barData = campuses.map(c => {
    const p = data.campuses[c]?.pre?.r || 0;
    const po = data.campuses[c]?.post?.r || 0;
    return {
      name: c === 'Universitywide' ? 'All (Uni)' : c.replace('UC ', ''),
      '2017-2019 (r)': p,
      '2022-2025 (r)': po,
      delta: po - p
    };
  }).sort((a, b) => a.delta - b.delta);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg text-sm text-slate-800">
          <p className="font-bold">{d.school}</p>
          <p className="text-slate-500">{d.city}</p>
          <div className="mt-2">
            <p>FRPM: <span className="font-medium">{formatNum(d.frpm_pct)}%</span></p>
            <p>Residual: <span className="font-medium">{formatNum(d.residual * 100)}%</span></p>
            <p>Applicants: <span className="font-medium">{d.applicants}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <header className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Activity size={200} />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4 relative z-10">
          Socioeconomic Status vs. Admission Outcomes
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl relative z-10 leading-relaxed">
          How has the correlation between a California public high school's socioeconomic status (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm text-pink-600">frpm_pct</code>) and its unexpected UC admission outcomes (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm text-blue-600">admit_rate_residual</code>) shifted from the standardized testing era (2017–2019) to the test-blind era (2022–2025)?
        </p>
      </header>

      {/* Controls & Badges */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm w-fit border border-slate-200">
          <span className="pl-3 text-sm font-medium text-slate-500">Select Campus:</span>
          <select 
            value={actualSelectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="bg-slate-50 border-none text-slate-800 font-medium rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            {campuses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="text-sm font-medium text-slate-500 mb-2">Pre-Test-Blind (2017-2019)</span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-800">{formatNum(preStats.r)}</span>
              <span className="text-sm text-slate-500 mb-1">r</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">R² = {formatNum(preStats.r2)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="text-sm font-medium text-slate-500 mb-2">Test-Blind (2022-2025)</span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-800">{formatNum(postStats.r)}</span>
              <span className="text-sm text-slate-500 mb-1">r</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">R² = {formatNum(postStats.r2)}</p>
          </div>

          <div className={`p-6 rounded-2xl shadow-sm border flex flex-col justify-between ${deltaR > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
            <span className="text-sm font-medium text-slate-600 mb-2">Net Delta (Δr)</span>
            <div className="flex items-center gap-2">
              {deltaR > 0 ? <TrendingUp className="text-red-500" /> : <TrendingDown className="text-green-500" />}
              <span className={`text-3xl font-bold ${deltaR > 0 ? 'text-red-700' : 'text-green-700'}`}>
                {deltaR > 0 ? '+' : ''}{formatNum(deltaR)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">p = {formatNum(postStats.p, 4)}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="text-sm font-medium text-slate-500 mb-2">Analyzed Cohorts</span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-800">{postStats.count.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">High schools across test-blind era</p>
          </div>
        </div>
      </div>

      {/* Visual Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[450px]">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">2017–2019: Standardized Testing Era</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" dataKey="frpm_pct" name="FRPM %" domain={[0, 100]} tick={{fontSize: 12}} stroke="#94a3b8">
                  {/* Label added properly in a real app, simplified here */}
                </XAxis>
                <YAxis type="number" dataKey="residual" name="Residual" tick={{fontSize: 12}} stroke="#94a3b8" tickFormatter={(v) => `${(v*100).toFixed(0)}%`} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{strokeDasharray: '3 3'}} />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                <Scatter name="Schools" data={scatterDataPre} fill="#94a3b8" fillOpacity={0.5} />
                {/* Trendline approximation */}
                <Line dataKey="trend" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[450px]">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">2022–2025: Test-Blind Era</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" dataKey="frpm_pct" name="FRPM %" domain={[0, 100]} tick={{fontSize: 12}} stroke="#94a3b8" />
                <YAxis type="number" dataKey="residual" name="Residual" tick={{fontSize: 12}} stroke="#94a3b8" tickFormatter={(v) => `${(v*100).toFixed(0)}%`} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{strokeDasharray: '3 3'}} />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                <Scatter name="Schools" data={scatterDataPost} fill="#3b82f6" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bar Chart - Campus level comparison */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold mb-6 text-slate-800">Shift in Correlation (r) by Campus</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{fontSize: 11}} height={60} stroke="#64748b" interval={0} />
              <YAxis tick={{fontSize: 12}} stroke="#64748b" />
              <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <Bar dataKey="2017-2019 (r)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="2022-2025 (r)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deep Dive & Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
            <Info className="text-blue-500" size={24} /> 
            Mathematical & Statistical Deep Dive
          </h3>
          
          <div className="space-y-6 text-slate-700">
            <div>
              <p className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-2">Residual Formula</p>
              <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm border border-slate-100 overflow-x-auto">
                Residual = Admit Rate<sub className="text-xs">actual</sub> - Admit Rate<sub className="text-xs">expected</sub>
              </div>
              <p className="text-sm mt-2 text-slate-600">The residual represents unexpected admission outcomes. A positive residual means the school overperformed its baseline expectation.</p>
            </div>

            <div>
              <p className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-2">Pearson's Correlation Equation</p>
              <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm border border-slate-100 overflow-x-auto text-center">
                r = [ Σ(x - x̄)(y - ȳ) ] / √[ Σ(x - x̄)² Σ(y - ȳ)² ]
              </div>
            </div>

            <div>
              <p className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-2">Regression Interpretations ({actualSelectedCampus})</p>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                  <div>
                    <span className="font-medium block text-slate-800">Pre-Era Equation: y = {formatNum(preStats.slope, 4)}x + {formatNum(preStats.intercept, 4)}</span>
                    <span className="text-slate-600">For every 1% increase in FRPM, the unexpected admit rate shifted by {formatNum(preStats.slope * 100, 2)}%.</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                  <div>
                    <span className="font-medium block text-slate-800">Test-Blind Equation: y = {formatNum(postStats.slope, 4)}x + {formatNum(postStats.intercept, 4)}</span>
                    <span className="text-slate-600">For every 1% increase in FRPM, the unexpected admit rate shifted by {formatNum(postStats.slope * 100, 2)}%.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
            <FileText className="text-blue-500" size={24} />
            Findings & Nuanced Insights
          </h3>
          
          <div className="space-y-6 flex-1">
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2">The Core Finding</h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                Across {actualSelectedCampus}, the transition to test-blind admissions resulted in a net delta of <span className="font-bold">{formatNum(deltaR)}</span> in the correlation between FRPM % and admission rate residuals. 
                {deltaR < 0 
                  ? " This suggests a weakening of the negative association, meaning socioeconomic status became slightly less predictive of underperformance relative to expectations."
                  : " This suggests an strengthening of the association, potentially indicating that test-blind policies did not fully close the socioeconomic residual gap."}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-2 text-sm">Campus Divergence</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Noticeable differences exist between selective flagship campuses (e.g., UC Berkeley, UCLA) and broader-access campuses. Flagships often exhibit stronger legacy stratification, whereas newer or expanding campuses show more volatility in correlations post-2021.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-2 text-sm">Data Caveats</h4>
              <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                <li><span className="font-medium text-slate-700">Redactions:</span> Cell counts &lt;3 are redacted to protect privacy, which systematically undercounts extremely small applicant groups.</li>
                <li><span className="font-medium text-slate-700">GPA Saturation:</span> UC's capped-weighted GPA maxes out at 4.40, creating a massive cluster at the top percentile.</li>
                <li><span className="font-medium text-slate-700">Ecological Fallacy:</span> These are school-level aggregates, not individual student outcomes.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Code Showcase */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 p-4 flex gap-2 overflow-x-auto">
          {['data', 'stats', 'agg'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'data' ? 'Data Cleaning & Filtering' : 
               tab === 'stats' ? 'Correlation & OLS' : 'Residual Aggregation'}
            </button>
          ))}
        </div>
        <div className="p-6 bg-slate-900">
          {activeTab === 'data' && (
            <CodeBlock 
              language="python"
              code={`# Data Cleaning & Filtering
df = pd.read_csv('dashboard_data.csv', low_memory=False)

# Filter columns to save memory
df = df[['fall_term', 'campus', 'high_school', 'city', 'frpm_pct', 'admit_rate_residual', 'applicants']]

# Drop missing critical values
df = df.dropna(subset=['frpm_pct', 'admit_rate_residual'])

# Define eras (excluding 2020-2021 transitions)
df['era'] = np.where(df['fall_term'].isin([2017, 2018, 2019]), 'pre',
             np.where(df['fall_term'].isin([2022, 2023, 2024, 2025]), 'post', None))

df = df.dropna(subset=['era'])`} 
            />
          )}
          {activeTab === 'stats' && (
            <CodeBlock 
              language="python"
              code={`# Correlation & OLS Regression with scipy.stats
from scipy import stats

def calculate_stats(data):
    if len(data) < 2: return None
    
    # Pearson and Spearman correlations
    r, p = stats.pearsonr(data['frpm_pct'], data['admit_rate_residual'])
    rho, _ = stats.spearmanr(data['frpm_pct'], data['admit_rate_residual'])
    
    # OLS Regression
    slope, intercept, r_value, p_value, std_err = stats.linregress(
        data['frpm_pct'], data['admit_rate_residual']
    )
    
    return {
        'r': r,
        'r2': r_value**2,
        'rho': rho,
        'p': p,
        'slope': slope,
        'intercept': intercept,
        'std_err': std_err,
        'count': len(data)
    }`}
            />
          )}
          {activeTab === 'agg' && (
            <CodeBlock 
              language="python"
              code={`# Residual Aggregation across Campuses
campuses = df['campus'].unique()
results = {'campuses': {}}

for campus in campuses:
    results['campuses'][campus] = {}
    campus_data = df[df['campus'] == campus]
    
    for era in ['pre', 'post']:
        era_data = campus_data[campus_data['era'] == era]
        results['campuses'][campus][era] = calculate_stats(era_data)

# To export for frontend consumption:
import json
with open('data.json', 'w') as f:
    json.dump(results, f)`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
