function compressText(text) {
    const compressed = pako.deflate(text);
    return btoa(String.fromCharCode.apply(null, compressed))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function decompressText(compressedText) {
    const padding = '='.repeat((4 - (compressedText.length % 4)) % 4);
    const base64 = (compressedText + padding).replace(/-/g, '+').replace(/_/g, '/');
    const charData = atob(base64).split('').map(x => x.charCodeAt(0));
    const inflated = pako.inflate(new Uint8Array(charData));
    return new TextDecoder().decode(inflated);
}

// load json from url data=json
var url = new URL(window.location.href);
var data = url.searchParams.get("data");
var showPadding = false;

try {
    var jsonData = JSON.parse(data);
} catch (e) {
    data = decompressText(data);
    var jsonData = JSON.parse(data);
}
const textColors = jsonData.textColors;
const tokens = jsonData.tokens;
const metrics = jsonData.metrics;

function redraw() {
    d3.select("#chart-container").selectAll("*").remove();
    d3.select("#text-container").selectAll("*").remove();
    createVisualization(textColors, tokens, metrics, showPadding);
}

redraw();

window.addEventListener('resize', () => {
    redraw();
});

function paddingToggle(checkbox) {
    showPadding = checkbox.checked;
    redraw();
}