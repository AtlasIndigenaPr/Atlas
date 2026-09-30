import { STATE_BOUNDARY_CONFIG } from './config2.js';
import { LayerManager } from './layerManager2.js';
import { LegendControl } from './legendControl.js';

// 1. Inicializa o Mapa
const map = L.map('map').setView([-24.757, -51.761], 7.3);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
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

// 5. INSERÇÃO DA LEGENDA
const legendControl = new LegendControl();
legendControl.addTo(map);

// 6. Gerenciador de Camadas Alternáveis
const layerManager = new LayerManager(map, info, legendControl); 
layerManager.init();

// Limpa a busca ao trocar de camada (ex: indo para Notícias)
map.on('baselayerchange', function() {
    if (searchInput) searchInput.value = '';
    if (resultsContainer) resultsContainer.innerHTML = '';
});

// =========================================================
// LÓGICA DE PESQUISA (COLOQUE AQUI, DEPOIS DO layerManager)
// =========================================================

// Manda o LayerManager baixar os dados em segundo plano
layerManager.loadLayerData('terras_indigenas_fase');

const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('search-results');

searchInput.addEventListener('input', function(e) {
    const valorBusca = e.target.value.toLowerCase();
    resultsContainer.innerHTML = '';

    if (valorBusca.length < 2) return;

    // Pega a camada diretamente de dentro do LayerManager
    const camadaTI = layerManager.getCamada('terras_indigenas_fase');
    
    // Se a internet ainda estiver baixando o dado, aborta a pesquisa
    if (!camadaTI) return; 

    let contador = 0;

    camadaTI.eachLayer(function(layer) {
        const props = layer.feature.properties;
        const nomeTerra = props.terrai_nom || props.nome || props.nom_ti || "";

        if (nomeTerra.toLowerCase().includes(valorBusca)) {
            if (contador >= 10) return;
            contador++;

            const item = document.createElement('div');
            const regex = new RegExp(`(${valorBusca})`, "gi");
            item.innerHTML = nomeTerra.replace(regex, "<strong>$1</strong>");

            // AÇÃO AO CLICAR NA SUGESTÃO DA LISTA:
            item.addEventListener('click', function() {
                searchInput.value = nomeTerra;
                resultsContainer.innerHTML = '';

                // Manda o LayerManager clicar no botão "Situação Jurídica" do menu
                layerManager.alternarCamadaAtiva('terras_indigenas_fase');

                // Simula um clique de mouse em cima do polígono para dar o zoom
                layer.fire('click');
                layer.fire('mouseover'); 
            });

            resultsContainer.appendChild(item);
        }
    });
});

// Fecha a lista de resultados ao clicar fora
document.addEventListener('click', function(e) {
    if (e.target !== searchInput && e.target !== resultsContainer) {
        resultsContainer.innerHTML = '';
    }
});

// --- LÓGICA DE RECOLHIMENTO (COLLAPSE) ---
const btnLeft = document.getElementById('toggle-left');
const sideLeft = document.getElementById('sidebar');

btnLeft.addEventListener('click', () => {
    sideLeft.classList.toggle('collapsed');
    btnLeft.innerText = sideLeft.classList.contains('collapsed') ? '▶' : '◀';
    setTimeout(() => { map.invalidateSize(); }, 400);
});