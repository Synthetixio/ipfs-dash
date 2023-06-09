async function updateState() {
  const res = await fetch('/api');
  if (!res.ok) {
    const text = await res.text();
    console.error(new Error(text));
    return;
  }
  window.postMessage({ type: 'state', payload: await res.json() });
}

function render() {
  document.querySelector('#state').innerText = JSON.stringify(window.state, null, 2);
}

function init() {
  console.log('DOM loaded');

  window.addEventListener('message', (e) => {
    if (e.data.type === 'state') {
      window.state = e.data.payload;
      render();
    }
  });

  render();

  setInterval(updateState, 5_000);
}

document.addEventListener('DOMContentLoaded', init);
