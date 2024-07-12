import json
from matplotlib import cm
import numpy as np

cmap = cm.get_cmap("viridis")

# # read react component from file
# with open("NewVisualization.js", "r") as f:
#     js_code = f.read()


def generate_html(textColors, tokens, metrics):
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <script src="https://d3js.org/d3.v7.min.js"></script>
        <style>
            #text-container {{
                font-family: monospace;
                line-height: 1.5em;
                font-size: 1.5em;
                margin-bottom: 20px;
            }}
        </style>
    </head>
    <body>
        <div style="margin: 0 auto; max-width: 800px;">
            <div id="text-container"></div>
            <div id="chart-container"></div>
        </div>
        <script src="NewVisualization.js"></script>
        <script>
            const text = {json.dumps(textColors)};
            const tokens = {json.dumps(tokens)};
            const metrics = {json.dumps(metrics)};
            
            createVisualization(text, tokens, metrics);
        </script>
    </body>
    </html>
    """
    return html


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

html_output = generate_html(textColors, tokens, metrics)

with open("visualization.html", "w") as f:
    f.write(html_output)
