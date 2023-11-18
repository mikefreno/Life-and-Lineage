import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import json

time_discount_factor = 0.75

with open('../assets/json/spells.json') as f:
    data = json.load(f)

df = pd.json_normalize(data)

df['manaCost'] = df['manaCost'].astype(float)

# Adjust 'effects.damage' considering 'duration' and discount factor
df['effects.damage'] = df.apply(lambda row: row['effects.damage'] * row['duration'] * time_discount_factor if pd.notnull(row['duration']) else row['effects.damage'], axis=1)

df = df.dropna(subset=['effects.damage'])  # remove null damages

# Create a color dictionary
color_dict = {"water": "blue", "air": "gray", "earth": "brown", "fire": "red"}

# Calculate and plot regression line for all data
slope, intercept = np.polyfit(df['manaCost'], df['effects.damage'], 1)
x_line_range = np.linspace(df['manaCost'].min(), df['manaCost'].max(), 100)
y_line_range = slope * x_line_range + intercept
plt.plot(x_line_range, y_line_range, color='black', label=f'All: y = {slope:.2f}x + {intercept:.2f}')

# Calculate and plot regression line for each element
for element in df['element'].unique():
    df_element = df[df['element'] == element]
    slope, intercept = np.polyfit(df_element['manaCost'], df_element['effects.damage'], 1)
    x_line_range = np.linspace(df_element['manaCost'].min(), df_element['manaCost'].max(), 100)
    y_line_range = slope * x_line_range + intercept
    plt.plot(x_line_range, y_line_range, color=color_dict[element], label=f'{element.capitalize()}: y = {slope:.2f}x + {intercept:.2f}')

# Scatter plot with color codes
plt.scatter(df['manaCost'], df['effects.damage'], c=df['element'].apply(lambda x: color_dict[x]))
for i, spell_name in enumerate(df['name']):
    plt.annotate(spell_name, (df['manaCost'].iloc[i], df['effects.damage'].iloc[i]))

# Name axis and title
plt.xlabel('manaCost')
plt.ylabel('damage')
plt.title('ManaCost vs Damage for Spells')

plt.legend()  # show legend

plt.show()
