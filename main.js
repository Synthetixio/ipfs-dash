function init() {
  const state = JSON.parse(document.querySelector('#state').innerText);

  async function updateState() {
    const res = await fetch('api');
    if (!res.ok) {
      const text = await res.text();
      console.error(new Error(text));
      return;
    }
    const payload = await res.json();
    if (JSON.stringify(state) !== JSON.stringify(payload)) {
      Object.assign(state, payload);
      window.postMessage('state updated');
    }
  }

  function render() {
    const $peers = document.querySelector('#peers');
    const $tbody = $peers.querySelector('tbody');
    $tbody.innerHTML = '';
    state.peers.forEach((peer) => {
      const $tr = document.createElement('tr');
      $tr.id = peer.id;
      $tr.appendChild(Object.assign(document.createElement('td'), { innerText: peer.id }));
      $tr.appendChild(Object.assign(document.createElement('td'), { innerText: peer.version }));
      $tr.appendChild(Object.assign(document.createElement('td'), { innerText: peer.peername }));
      $tbody.appendChild($tr);
    });
  }

  window.addEventListener('message', (e) => {
    if (e.data === 'state updated') {
      render();
    }
  });

  render();

  setInterval(updateState, 5_000);
}

document.addEventListener('DOMContentLoaded', init);
