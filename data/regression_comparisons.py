import matplotlib.pyplot as plt
import numpy as np

# Define a range of x-values
x = np.linspace(0, 20, 400)

# For linear equations 'y = ax + b', define coefficients (a, b):
linear_eqs = [(2, 3)]

# For quadratic equations 'y = ax² + bx + c', define coefficients (a, b, c):
quad_eqs = [(1, -3, 2)]

# Plot linear equations
for idx, (a, b) in enumerate(linear_eqs):
    plt.plot(x, a*x + b, label=f'Linear {idx + 1}: y = {a}x + {b}')

# Plot quadratic equations
for idx, (a, b, c) in enumerate(quad_eqs):
    plt.plot(x, a*x**2 + b*x + c, label=f'Quad {idx + 1}: y = {a}x² + {b}x + {c}')

plt.xlabel('x')
plt.ylabel('y')

plt.title('Direct Equation Plotting')
plt.legend()  # Add legend to identify which line represents which equation

plt.show()
