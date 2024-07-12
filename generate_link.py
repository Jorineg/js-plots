import json
from matplotlib import cm
import numpy as np

cmap = cm.get_cmap("viridis")


# Example usage
text = "This is a sample text for visualization. It contains multiple sentences. You'd use a proper tokenizer in practice."
tokens = text.split()  # Simple tokenization, you'd use a proper tokenizer in practice
metrics = [
    {
        "predicted_return": np.random.rand(len(tokens)).tolist(),
        "actual_return": np.random.rand(len(tokens)).tolist(),
    },
    {
        "reward": ((np.random.rand(len(tokens))-0.5) * 5).tolist(),
    },
]

textColors = [cmap(i) for i in metrics[0]["predicted_return"]]
# convert to html
textColors = [
    f"rgb({int(r * 255)}, {int(g * 255)}, {int(b * 255)})" for r, g, b, _ in textColors
]

data = {
    "textColors": textColors,
    "tokens": tokens,
    "metrics": metrics,
}

