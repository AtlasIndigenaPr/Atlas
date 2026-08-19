// js/main.js
import { STATE_BOUNDARY_CONFIG } from './config.js';
import { LayerManager } from './layerManager.js';
import { LegendControl } from './legendControl.js'; // 1. NOVO: Importe a classe da legenda

// 1. Inicializa o Mapa
const map = L.map('map').setView([-24.757, -51.761], 8);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// 2. Cria um "Pane" personalizado no Leaflet para o Limite Estadual
map.createPane('stateBoundaryPane');
map.getPane('stateBoundaryPane').style.zIndex = 650; 
map.getPane('stateBoundaryPane').style.pointerEvents = 'none'; 

// 3. Carrega o Limite do Estado de forma fixa/crônica
function carregarLimiteEstadual() {
    fetch(STATE_BOUNDARY_CONFIG.url)
        .then(res => res.json())
        .then(data => {
            L.geoJson(data, {
                style: STATE_BOUNDARY_CONFIG.style,
                pane: 'stateBoundaryPane' 
            }).addTo(map);
        })
        .catch(err => console.error("Erro ao carregar o limite estadual:", err));
}

carregarLimiteEstadual();

// 4. Painel de Informações (Tooltip de Hover)
const info = L.control({ position: 'topright' });

info.onAdd = function () {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props, config) {
    if (!props || !config) {
        this._div.innerHTML = '<h4>Atlas Indígena do Paraná</h4><p style="font-size: 13px;">Passe o cursor sobre um território</p>';
        return;
    }

    let html = `<h4>${config.title}</h4>`;
    const colunasIgnoradas = ['OBJECTID', 'Tema','FID', 'SHAPE_AREA', 'SHAPE_LEN', 'Shape_Length', 'Shape_Area', 'id'];

    if (config.fields && Array.isArray(config.fields)) {
        config.fields.forEach(field => {
            const valor = props[field.key];
            if (valor !== undefined && valor !== null && valor !== '') {
                html += `<b>${field.label}:</b> ${valor}<br />`;
            }
        });
    } else {
        for (let chave in props) {
            let valor = props[chave];
            if (!colunasIgnoradas.includes(chave) && valor !== null && valor !== undefined && valor !== '') {
                let rotulo = chave.replace(/_/g, ' ');
                rotulo = rotulo.charAt(0).toUpperCase() + rotulo.slice(1);
                html += `<b>${rotulo}:</b> ${valor}<br />`;
            }
        }
    }
    this._div.innerHTML = html;
};

info.addTo(map);

// ---------------------------------------------------------
// 5. INSERÇÃO DA LEGENDA
// ---------------------------------------------------------
// Cria a legenda e adiciona à tela (ela vai ficar invisível até o LayerManager mandar os dados)
const legendControl = new LegendControl();
legendControl.addTo(map);

// 6. Gerenciador de Camadas Alternáveis
// ---------------------------------------------------------
// ATUALIZAÇÃO: Passe o `legendControl` como terceiro argumento
const layerManager = new LayerManager(map, info, legendControl); 
layerManager.init();