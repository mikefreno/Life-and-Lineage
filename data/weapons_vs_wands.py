import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import json

with open('../assets/json/items/weapons.json') as f:
    weapons_data = json.load(f)

with open('../assets/json/items/wands.json') as f:
    wands_data = json.load(f)

weapons_df = pd.json_normalize(weapons_data)
wands_df = pd.json_normalize(wands_data)

plt.scatter(weapons_df['baseValue'], weapons_df['stats.damage'], color='red', label='Weapons')
plt.scatter(wands_df['baseValue'], wands_df['stats.damage'], color='blue', label='Wands')

# Compute regression for weapons
slope, intercept = np.polyfit(weapons_df['baseValue'], weapons_df['stats.damage'], deg=1)
r_squared = np.corrcoef(weapons_df['baseValue'], weapons_df['stats.damage'])[0][1]**2
range_x_line = np.linspace(weapons_df['baseValue'].min(), weapons_df['baseValue'].max(), 100)
plt.plot(range_x_line, slope*range_x_line + intercept, color='red', label=f'Weap: y={slope:.6f}x+{intercept:.2f}, $R^2$={r_squared:.6f}')

# Compute regression for wands
slope, intercept = np.polyfit(wands_df['baseValue'], wands_df['stats.damage'], deg=1)
r_squared = np.corrcoef(wands_df['baseValue'], wands_df['stats.damage'])[0][1]**2
range_x_line = np.linspace(wands_df['baseValue'].min(), wands_df['baseValue'].max(), 100)
plt.plot(range_x_line, slope*range_x_line + intercept, color='blue', label=f'Wand: y={slope:.6f}x+{intercept:.2f}, $R^2$={r_squared:.6f}')

plt.xlabel('Base Value')
plt.ylabel('Damage')
plt.title('Base Value vs Damage for Weapons and Wands')
plt.legend()

plt.show()

