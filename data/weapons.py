import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import json

with open('../assets/json/items/weapons.json') as f:
    data = json.load(f)

df = pd.json_normalize(data)

plt.scatter(df['baseValue'], df['stats.damage'])
for i, wand_name in enumerate(df['name']):
    plt.annotate(wand_name, (df['baseValue'].iloc[i], df['stats.damage'].iloc[i]))

polynomial_coeffs = np.polyfit(df['baseValue'], df['stats.damage'], 2)
x_line_range = np.linspace(df['baseValue'].min(), df['baseValue'].max(), 100)
y_line_range = polynomial_coeffs[0]*x_line_range**2 + polynomial_coeffs[1]*x_line_range + polynomial_coeffs[2]

plt.plot(x_line_range, y_line_range, color='red', label=f'y = {polynomial_coeffs[0]:.10f}x² + {polynomial_coeffs[1]:.6f}x + {polynomial_coeffs[2]:.2f}')

plt.xlabel('baseValue')
plt.ylabel('damage')
plt.title('BaseValue vs Damage for Weapons')

plt.legend()

plt.show()
