// Este archivo será el cerebro de nuestra PWA más adelante.
// Por ahora, solo comprobamos que el script está enlazado correctamente.
console.log('App Shell de DevConnect inicializado correctamente.');

// Evento de prueba para el botón de recargar
document.getElementById('btn-sync').addEventListener('click', () => {
    alert('Pronto aquí implementaremos la sincronización con Background Sync.');
});

// Evento de prueba para el botón flotante de nueva publicación
document.getElementById('btn-new-post').addEventListener('click', () => {
    alert('Pronto podrás crear publicaciones aquí (y se guardarán offline).');
});
// 1. Verificamos si el navegador soporta Service Workers
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registro => {
                console.log('Service Worker registrado con scope:', registro.scope);
            })
            .catch(error => {
                console.error('Error al registrar el Service Worker:', error);
            });
    });
}