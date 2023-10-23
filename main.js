function humanReadableNumber(num) {
  if (Math.abs(num) >= 1_000_000_000) {
    return Math.sign(num) * (Math.abs(num) / 1_000_000_000).toFixed(2) + ' B';
  }
  if (Math.abs(num) >= 1_000_000) {
    return Math.sign(num) * (Math.abs(num) / 1_000_000).toFixed(2) + ' M';
  }
  if (Math.abs(num) >= 1_000) {
    return Math.sign(num) * (Math.abs(num) / 1_000).toFixed(2) + ' K';
  }
  return Math.sign(num) * Math.abs(num);
}

function humanReadableSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (!bytes) {
    return '0 Bytes';
  }
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

function humanReadableDuration(seconds) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * 24 * 60 * 60;
  const hrs = Math.floor(seconds / 3600);
  seconds -= hrs * 3600;
  const mnts = Math.floor(seconds / 60);
  seconds -= mnts * 60;

  if (days > 0) {
    return `${days} days, ${hrs} hours, ${mnts} minutes, and ${seconds} seconds`;
  }
  if (hrs > 0) {
    return `${hrs} hours, ${mnts} minutes, and ${seconds} seconds`;
  }
  if (mnts > 0) {
    return `${mnts} minutes, and ${seconds} seconds`;
  }
  return `${seconds} seconds`;
}

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

  function updateValue(key, value) {
    if (key in state) {
      document.querySelectorAll(`[data-value="${key}"]`).forEach(($value) => {
        $value.innerText = value;
      });
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

    updateValue('uptime', humanReadableDuration(state.uptime));
    updateValue('numObjects', humanReadableNumber(state.numObjects));
    updateValue('repoSize', humanReadableSize(state.repoSize));
    updateValue('totalIn', humanReadableSize(state.totalIn));
    updateValue('totalOut', humanReadableSize(state.totalOut));
    updateValue('dailyIn', `${humanReadableSize(state.dailyIn)} / day`);
    updateValue('hourlyIn', `${humanReadableSize(state.hourlyIn)} / hour`);
    updateValue('dailyOut', `${humanReadableSize(state.dailyOut)} / day`);
    updateValue('hourlyOut', `${humanReadableSize(state.hourlyOut)} / hour`);
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
