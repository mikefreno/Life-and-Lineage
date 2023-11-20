import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import json

with open('../assets/json/items/weapons.json') as f:
    data = json.load(f)

df = pd.json_normalize(data)

df['baseValue'] = df['baseValue'] / 1000

df_one_hand = df[df['slot'] == 'one-hand']
df_two_hand = df[df['slot'] == 'two-hand']

plt.scatter(df_one_hand['baseValue'], df_one_hand['stats.damage'], color='blue')
for i, weapon_name in enumerate(df_one_hand['name'].tolist()):
    plt.annotate(weapon_name, (df_one_hand['baseValue'].tolist()[i], df_one_hand['stats.damage'].tolist()[i]))

slope, intercept = np.polyfit(df_one_hand['baseValue'], df_one_hand['stats.damage'], 1)
x_line_range = np.linspace(df_one_hand['baseValue'].min(), df_one_hand['baseValue'].max(), 100)
y_line_range = slope * x_line_range + intercept
plt.plot(x_line_range, y_line_range, color='blue', label=f'One-hand: y = {slope:.2f}x + {intercept:.2f}')

plt.scatter(df_two_hand['baseValue'], df_two_hand['stats.damage'], color='red')
for i, weapon_name in enumerate(df_two_hand['name'].tolist()):
    plt.annotate(weapon_name, (df_two_hand['baseValue'].tolist()[i], df_two_hand['stats.damage'].tolist()[i]))

slope, intercept = np.polyfit(df_two_hand['baseValue'], df_two_hand['stats.damage'], 1)
x_line_range = np.linspace(df_two_hand['baseValue'].min(), df_two_hand['baseValue'].max(), 100)
y_line_range = slope * x_line_range + intercept
plt.plot(x_line_range , y_line_range, color='red', label=f'Two-hand: y = {slope:.4f}x + {intercept:.2f}')

plt.xlabel('baseValue in (1000s)')
plt.ylabel('damage')
plt.title('BaseValue vs Damage for Weapons')

plt.legend()

plt.show()
