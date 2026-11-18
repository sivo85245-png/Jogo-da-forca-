export const API = window.API_URL || '';

async function requestJSON(url, options) {
    const response = await fetch(`${API}${url}`, options);
    return response.json();
}

export const getJSON = (url) => requestJSON(url);

export const postJSON = (url, dados = {}) => requestJSON(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
});