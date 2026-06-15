let loaderDiv = document.getElementById('global-loader');

if (!loaderDiv) {
  loaderDiv = document.createElement('div');
  loaderDiv.id = 'global-loader';
  loaderDiv.className = 'loader-overlay';

  loaderDiv.innerHTML = `
    <img src="../css/loading/loading.gif" class="loader-gif" alt="Carregando">
    <p class="loader-text">Carregando tudo pra você!!!</p>
  `;

  document.body.prepend(loaderDiv);
}

export function showLoader() {
  const loader = document.getElementById('global-loader');
  if (loader) {
    loader.classList.remove('hidden');
  }
}

export function hideLoader() {
  const loader = document.getElementById('global-loader');
  if (loader) {
    loader.classList.add('hidden');
  }
}

window.addEventListener('load', () => {
  hideLoader();
});

window.addEventListener('beforeunload', () => {
  showLoader();
});

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const link = target.closest('a');

  if (link && link.href && !link.href.startsWith('javascript:') && !link.getAttribute('href')?.startsWith('#') && link.target !== '_blank') {
    showLoader();
  }
}); 