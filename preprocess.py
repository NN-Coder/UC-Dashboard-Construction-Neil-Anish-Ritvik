import pandas as pd
import numpy as np
from scipy import stats
import json

df = pd.read_csv('dashboard_data.csv', low_memory=False)

df = df[['fall_term', 'campus', 'high_school', 'city', 'frpm_pct', 'admit_rate_residual', 'applicants']]
df = df.dropna(subset=['frpm_pct', 'admit_rate_residual'])

df['era'] = np.where(df['fall_term'].isin([2017, 2018, 2019]), 'pre',
             np.where(df['fall_term'].isin([2022, 2023, 2024, 2025]), 'post', None))
df = df.dropna(subset=['era'])

results = {
    'summary': {},
    'campuses': {},
    'scatter_data': {
        'pre': [],
        'post': []
    }
}

def calculate_stats(data):
    if len(data) < 2:
        return None
    r, p = stats.pearsonr(data['frpm_pct'], data['admit_rate_residual'])
    rho, _ = stats.spearmanr(data['frpm_pct'], data['admit_rate_residual'])
    slope, intercept, r_value, p_value, std_err = stats.linregress(data['frpm_pct'], data['admit_rate_residual'])
    return {
        'r': r,
        'r2': r_value**2,
        'rho': rho,
        'p': p,
        'slope': slope,
        'intercept': intercept,
        'std_err': std_err,
        'count': len(data)
    }

for era in ['pre', 'post']:
    era_data = df[df['era'] == era]
    results['summary'][era] = calculate_stats(era_data)

campuses = df['campus'].unique()
for campus in campuses:
    results['campuses'][campus] = {}
    campus_data = df[df['campus'] == campus]
    for era in ['pre', 'post']:
        era_data = campus_data[campus_data['era'] == era]
        results['campuses'][campus][era] = calculate_stats(era_data)

scatter_df = df.groupby(['era', 'campus', 'high_school', 'city']).agg({
    'frpm_pct': 'mean',
    'admit_rate_residual': 'mean',
    'applicants': 'sum'
}).reset_index()

scatter_records = scatter_df.to_dict(orient='records')
for record in scatter_records:
    results['scatter_data'][record['era']].append({
        'campus': record['campus'],
        'school': record['high_school'],
        'city': record['city'],
        'frpm_pct': record['frpm_pct'],
        'residual': record['admit_rate_residual'],
        'applicants': record['applicants']
    })

with open('dashboard_data.json', 'w') as f:
    json.dump(results, f)
print("Data preprocessed successfully.")
