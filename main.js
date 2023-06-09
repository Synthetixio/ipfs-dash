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
    const $peersHeader = document.querySelector('#peersHeader');
    if ($peersHeader) {
      $peersHeader.innerText = state.peers.length === 1 ? '1 Node' : `${state.peers.length} Nodes`;
    }
    const $peers = document.querySelector('#peers tbody');
    if ($peers) {
      $peers.innerHTML = '';
      state.peers.forEach((peer) => {
        const $tr = document.createElement('tr');
        $tr.id = peer.id;
        $tr.appendChild(Object.assign(document.createElement('td'), { innerText: peer.id }));
        $tr.appendChild(Object.assign(document.createElement('td'), { innerText: peer.version }));
        $peers.appendChild($tr);
      });
    }
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
