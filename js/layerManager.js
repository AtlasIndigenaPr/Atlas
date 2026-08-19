// js/layerManager.js
import { LAYERS_CONFIG } from './config.js';
import { getFeatureStyle } from './styleEngine.js';

export class LayerManager {
    constructor(map, infoControl, legendControl) {
        this.map = map;
        this.infoControl = infoControl;
        this.legendControl = legendControl; // <--- Recebe a legenda
        this.leafletLayers = {};
        this.loadedData = {};
        this.camadaDestacada = null;
        this.camadaDestacadaGroup = null;
    }

    init() {
        const baseMaps = {}; 

        Object.keys(LAYERS_CONFIG).forEach(key => {
            const config = LAYERS_CONFIG[key];
            
            const layerGroup = L.geoJson(null, {
                style: (feature) => getFeatureStyle(feature, config),
                onEachFeature: (feature, layer) => this.attachEvents(feature, layer, config)
            });

            this.leafletLayers[key] = layerGroup;
            baseMaps[config.title] = layerGroup; 
        });

        L.control.layers(baseMaps, null, { position: 'topleft', collapsed: false }).addTo(this.map);

        this.setupMapEvents();

        // Ativa a camada padrão do config, carrega os dados e pinta a legenda inicial
        Object.keys(LAYERS_CONFIG).forEach(key => {
            if (LAYERS_CONFIG[key].activeByDefault) {
                this.leafletLayers[key].addTo(this.map);
                this.loadLayerData(key);
                this.legendControl.update(LAYERS_CONFIG[key]); // <--- Legenda inicial
            }
        });
    }

    setupMapEvents() {
        this.map.on('baselayerchange', (e) => {
            const configKey = this.findConfigKeyByTitle(e.name);
            if (configKey) {
                this.loadLayerData(configKey);
                this.legendControl.update(LAYERS_CONFIG[configKey]); // <--- Atualiza a legenda ao trocar de camada
            }
            this.infoControl.update();
        });

        // Captura a abertura do Popup (AGORA COM PROTEÇÃO DE DOM E CLIQUE)
        this.map.on('popupopen', (e) => {
            // 1. setTimeout de 50ms: garante que o HTML do popup já foi 100% desenhado na tela
            setTimeout(() => {
                const popupNode = e.popup.getElement();
                if (!popupNode) return;

                const buttons = popupNode.querySelectorAll('.popup-tab-btn');
                const blocks = popupNode.querySelectorAll('.popup-block');

                if (buttons.length === 0) return;

                buttons.forEach(btn => {
                    // 2. Usar onclick direto evita eventos duplicados ou perdidos
                    btn.onclick = (ev) => {
                        ev.preventDefault(); // Impede qualquer atualização de página não desejada
                        
                        // 3. Impede que o clique "vaze" pro mapa do Leaflet embaixo da janela
                        if (L && L.DomEvent) {
                            L.DomEvent.stopPropagation(ev);
                        }

                        // 4. Lemos o data-block direto do próprio elemento 'btn' (seguro contra miss-clicks)
                        const targetBlock = btn.getAttribute('data-block');
                        
                        if (!targetBlock) return; // Trava de segurança

                        // Alterna o estilo visual dos botões
                        buttons.forEach(b => {
                            b.style.background = '#f8f9fa';
                            b.style.color = '#333';
                            b.style.borderColor = '#ccc';
                        });
                        btn.style.background = '#d9534f';
                        btn.style.color = 'white';
                        btn.style.borderColor = '#d9534f';

                        // Mostra apenas o bloco correspondente ao botão clicado
                        blocks.forEach(block => {
                            if (block.getAttribute('data-block-content') === targetBlock) {
                                block.style.display = 'block';
                            } else {
                                block.style.display = 'none';
                            }
                        });
                    };
                });
            }, 50); // Fim do setTimeout
        });
    }

    async loadLayerData(key) {
        const config = LAYERS_CONFIG[key];
        const layerGroup = this.leafletLayers[key];

        // 1. Se já carregou ou ESTÁ no meio do processo de carregar, cancela imediatamente
        if (this.loadedData[key]) return;

        // 2. TRAVA IMEDIATA: Registra que iniciou o carregamento ANTES do fetch
        // Isso impede a duplicação dos polígonos (que causava a opacidade)
        this.loadedData[key] = 'loading';

        try {
            const response = await fetch(config.url);
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            
            const data = await response.json();
            layerGroup.addData(data);
            
            // 3. Marca como totalmente concluído
            this.loadedData[key] = 'loaded';
        } catch (error) {
            console.error(`Erro ao carregar camada ${config.title}:`, error);
            // Se der erro de internet, destrava para permitir que o sistema tente de novo depois
            this.loadedData[key] = false; 
        }
    }

    // js/layerManager.js (Trecho atualizado)

    attachEvents(feature, layer, config) {
        layer.on({
            mouseover: (e) => {
                const l = e.target;
                const currentGroup = this.leafletLayers[config.id];

                if (this.camadaDestacada && this.camadaDestacada !== l) {
                    this.camadaDestacadaGroup?.resetStyle(this.camadaDestacada);
                }

                this.camadaDestacada = l;
                this.camadaDestacadaGroup = currentGroup;

                l.setStyle({
                    weight: 2.5,
                    color: '#222222',
                    fillOpacity: 0.9
                });

                l.bringToFront();
                this.infoControl.update(l.feature.properties, config);
            },
            mouseout: (e) => {
                const l = e.target;
                const currentGroup = this.leafletLayers[config.id];

                if (currentGroup) {
                    currentGroup.resetStyle(l);
                }

                if (this.camadaDestacada === l) {
                    this.camadaDestacada = null;
                    this.camadaDestacadaGroup = null;
                }
                
                this.infoControl.update();
            },
            click: (e) => {
                const l = e.target;
                
                // 1. Dá zoom/centraliza no polígono clicado
                this.map.fitBounds(l.getBounds());

                // 2. Gera o HTML dinâmico baseado nos "fields" do config.js
                const htmlConteudo = this.gerarHtmlPopup(l.feature.properties, config);

                // 3. Abre o Popup do Leaflet na posição do clique
                l.bindPopup(htmlConteudo, { maxHeight: 300 }).openPopup();
            }
        });
    }

 // Substitua o método inteiro na sua classe LayerManager no arquivo js/layerManager.js

gerarHtmlPopup(props, config) {
    let blocksData = [];

    // 1. Se você definiu blocos manuais estruturados no config.js
    if (config.blocks && Array.isArray(config.blocks)) {
        blocksData = config.blocks.map(blockConfig => {
            let items = [];
            blockConfig.keys.forEach(k => {
                // Suporta tanto string simples ('Tema') quanto objeto customizado ({ key: 'Tema', label: 'Temas' })
                const key = typeof k === 'object' && k !== null ? k.key : k;
                let label = typeof k === 'object' && k !== null && k.label ? k.label : null;
                let unit = '';

                const valor = props[key];
                if (valor !== undefined && valor !== null && valor !== '') {
                    
                    // Se não foi passado um label direto no objeto, tenta achar no fields ou gera um padrão
                    if (!label) {
                        if (config.fields) {
                            const foundField = config.fields.find(f => f.key === key);
                            if (foundField) {
                                label = foundField.label;
                                unit = foundField.unitLabel ? ` ${foundField.unitLabel}` : '';
                            }
                        }
                        if (!label) {
                            label = key.replace(/_/g, ' ');
                            label = label.charAt(0).toUpperCase() + label.slice(1);
                        }
                    }

                    const valorFormatado = typeof valor === 'number' ? valor.toLocaleString('pt-BR') : valor;
                    items.push({ label, valor: `${valorFormatado}${unit}` });
                }
            });
            return { title: blockConfig.title, items };
        }).filter(b => b.items.length > 0);
    } 
    // 2. CENÁRIO B: Se NÃO há blocos, mas você declarou 'fields', usamos APENAS os fields como uma lista de escolha (Whitelist)
    else if (config.fields && Array.isArray(config.fields)) {
        let items = [];
        
        config.fields.forEach(field => {
            const valor = props[field.key];
            // Respeita estritamente apenas o que foi declarado no config.js
            if (valor !== undefined && valor !== null && valor !== '') {
                const unit = field.unitLabel ? ` ${field.unitLabel}` : '';
                const valorFormatado = typeof valor === 'number' ? valor.toLocaleString('pt-BR') : valor;
                items.push({ 
                    label: field.label, 
                    valor: `${valorFormatado}${unit}` 
                });
            }
        });

        if (items.length > 0) {
            blocksData.push({
                title: 'Detalhes',
                items: items
            });
        }
    }

    // Se no final não sobrou nada para mostrar
    if (blocksData.length === 0) {
        return `<div style="font-family: sans-serif; padding: 5px;"><h4>${config.title}</h4><p>Sem informações disponíveis.</p></div>`;
    }

    // --- MONTAGEM DO HTML FINAL DO POPUP ---
    let html = `<div class="popup-container" style="font-family: sans-serif; min-width: 220px; max-width: 300px;">`;
    html += `<h4 style="margin: 0 0 8px 0; color: #d9534f; border-bottom: 1px solid #ddd; padding-bottom: 4px; font-size: 14px;">${config.title}</h4>`;

    // Cria as abas caso haja mais de um bloco
    if (blocksData.length > 1) {
        html += `<div class="popup-tabs" style="display: flex; gap: 4px; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px;">`;
        blocksData.blocksData = blocksData || [];
        blocksData.forEach((block, idx) => {
            const activeStyle = idx === 0 
                ? 'background: #d9534f; color: white; border-color: #d9534f;' 
                : 'background: #f8f9fa; color: #333; border-color: #ccc;';
            html += `<button class="popup-tab-btn" data-block="${idx}" style="cursor: pointer; padding: 3px 8px; font-size: 11px; border-radius: 3px; border: 1px solid; font-weight: 500; ${activeStyle}">${block.title}</button>`;
        });
        html += `</div>`;
    }

    blocksData.forEach((block, idx) => {
        const displayStyle = idx === 0 ? 'display: block;' : 'display: none;';
        html += `<div class="popup-block" data-block-content="${idx}" style="${displayStyle}">`;
        
        if (blocksData.length === 1 && block.title !== 'Detalhes') {
            html += `<div style="font-weight: bold; font-size: 12px; margin-bottom: 6px; color: #555;">${block.title}</div>`;
        }

        block.items.forEach(item => {
            const valorStr = String(item.valor || '').toLowerCase();
            
            // Tratamento caso o texto possua quebras de linha (<br>) p/ múltiplos cards/notícias
            if (valorStr.includes('<br')) {
                html += `<div style="margin: 6px 0; font-size: 12px;">`;
                html += `<strong style="display: block; margin-bottom: 5px; color: #333;">${item.label}:</strong>`;
                html += `<div style="max-height: 160px; overflow-y: auto; padding-right: 2px;">`;
                
                const noticiasArray = item.valor.split(/<br\s*[\/]?>/gi).map(s => s.trim()).filter(Boolean);
                
                noticiasArray.forEach((noticia) => {
                    html += `<div style="background: #ffffff; border: 1px solid #e0e0e0; border-left: 3px solid #d9534f; padding: 6px 8px; margin-bottom: 6px; border-radius: 3px; font-size: 11px; line-height: 1.35; color: #333; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">`;
                    html += noticia;
                    html += `</div>`;
                });

                html += `</div></div>`;
                return;
            }

            // Renderização padrão de textos/números limpos
            html += `<p style="margin: 4px 0; font-size: 12px; line-height: 1.4;"><strong>${item.label}:</strong> ${item.valor}</p>`;
        });

        html += `</div>`;
    });

    html += `</div>`;
    return html;
}
    
    findConfigKeyByTitle(title) {
        return Object.keys(LAYERS_CONFIG).find(key => LAYERS_CONFIG[key].title === title);
    }
}