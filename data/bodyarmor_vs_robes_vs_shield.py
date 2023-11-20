import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import json

with open('../assets/json/items/bodyArmor.json') as f:
    body_armor_data = json.load(f)
with open('../assets/json/items/shields.json') as f:
    shield_data = json.load(f)
with open('../assets/json/items/robes.json') as f:
    robes_data = json.load(f)


body_armor_df = pd.json_normalize(body_armor_data)
shield_df = pd.json_normalize(shield_data)
robes_df = pd.json_normalize(robes_data)

body_armor_df['baseValue'] = body_armor_df['baseValue'] / 1000
shield_df['baseValue'] = shield_df['baseValue'] / 1000
robes_df['baseValue'] = robes_df['baseValue'] / 1000

plt.scatter(body_armor_df['baseValue'], body_armor_df['stats.armor'], color='green', label='Body Armor')
plt.scatter(shield_df['baseValue'], shield_df['stats.armor'], color='brown', label='Shields')
plt.scatter(robes_df['baseValue'], robes_df['stats.armor'], color='blue', label='Robes')

slope, intercept = np.polyfit(body_armor_df['baseValue'], body_armor_df['stats.armor'], 1)
x_line_range = np.linspace(body_armor_df['baseValue'].min(), body_armor_df['baseValue'].max(), 100)
y_line_range = slope * x_line_range + intercept
plt.plot(x_line_range, y_line_range, color='blue', label=f'Body Armor: y = {slope:.3f}x + {intercept:.2f}')

slope, intercept = np.polyfit(shield_df['baseValue'], shield_df['stats.armor'], 1)
x_line_range = np.linspace(shield_df['baseValue'].min(), shield_df['baseValue'].max(), 100)
y_line_range = slope * x_line_range + intercept
plt.plot(x_line_range, y_line_range, color='blue', label=f'Shields: y = {slope:.3f}x + {intercept:.2f}')

slope, intercept = np.polyfit(robes_df['baseValue'], robes_df['stats.armor'], 1)
x_line_range = np.linspace(robes_df['baseValue'].min(), robes_df['baseValue'].max(), 100)
y_line_range = slope * x_line_range + intercept
plt.plot(x_line_range, y_line_range, color='blue', label=f'Shields: y = {slope:.3f}x + {intercept:.2f}')

plt.xlabel('baseValue in (1000s)')
plt.ylabel('armor')
plt.title('BaseValue vs armor')

plt.legend()

plt.show()
