// js/legendControl.js

export class LegendControl {
    constructor() {
        this.control = L.control({ position: 'bottomright' });
        this._div = null;
        
        // Injeta um CSS rápido para deixar a barra de rolagem da legenda elegante
        const style = document.createElement('style');
        style.innerHTML = `
            .custom-legend-scroll::-webkit-scrollbar { width: 5px; }
            .custom-legend-scroll::-webkit-scrollbar-track { background: transparent; }
            .custom-legend-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
            .custom-legend-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }
        `;
        document.head.appendChild(style);
        
        this.control.onAdd = () => {
            this._div = L.DomUtil.create('div', 'info legend-container');
            
            // Design mais compacto
            this._div.style.background = 'rgba(255, 255, 255, 0.85)';
            this._div.style.backdropFilter = 'blur(12px)';
            this._div.style.webkitBackdropFilter = 'blur(12px)';
            this._div.style.border = '1px solid rgba(255, 255, 255, 0.6)';
            this._div.style.padding = '12px 14px'; // Padding reduzido
            this._div.style.borderRadius = '8px';
            this._div.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.06)';
            
            this._div.style.fontFamily = "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
            this._div.style.fontSize = '11.5px'; // Fonte sutilmente menor
            this._div.style.lineHeight = '1.4';
            this._div.style.color = '#334155';
            this._div.style.minWidth = '130px';
            
            L.DomEvent.disableClickPropagation(this._div);
            
            this.update(); 
            return this._div;
        };
    }

    addTo(map) {
        this.control.addTo(map);
    }

    update(config) {
        if (!this._div) return;

        if (!config || (!config.categories && !config.grades)) {
            this._div.style.display = 'none';
            return;
        }

        this._div.style.display = 'block';
        
        let html = `<h4 style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 6px;">
            ${config.title || 'Legenda'}
        </h4>`;
        
        // Container com rolagem automática (Scroll) limitando a altura
        html += `<div class="custom-legend-scroll" style="display: flex; flex-direction: column; gap: 5px; max-height: 220px; overflow-y: auto; padding-right: 4px;">`;

        if (config.categories) {
            for (const [key, color] of Object.entries(config.categories)) {
                html += this.gerarItemLegenda(color, key);
            }
            
            // LÓGICA DO NULO: Só aparece se a cor existir E o "hideDefaultInLegend" NÃO for verdadeiro
            if (config.defaultColor && !config.hideDefaultInLegend) {
                html += `<div style="margin-top: 2px; border-top: 1px solid rgba(0,0,0,0.04); padding-top: 4px;">`;
                html += this.gerarItemLegenda(config.defaultColor, 'Outros / Nulo', true);
                html += `</div>`;
            }
        } 
        // 2. Dados Numéricos/Coropléticos
        else if (config.grades && config.colors) {
            for (let i = 0; i < config.grades.length; i++) {
                const corAtual = config.colors[i];
                const valorAtual = config.grades[i];
                const proximoValor = config.grades[i + 1];
                
                let rotulo = "";

                // 1º Prioridade: Se você definiu rótulos manuais no config.js, o código usa eles
                if (config.labels && config.labels[i]) {
                    rotulo = config.labels[i];
                } 
                // 2º Prioridade: Lógica automática inteligente
                else {
                    // Se o valor atual for 0 e o próximo for 1, a classe representa APENAS o zero
                    if (valorAtual === 0 && proximoValor === 1) {
                        rotulo = "0";
                    } else {
                        const valorFormatado = valorAtual.toLocaleString('pt-BR');
                        
                        // Se houver próximo valor, renderiza o intervalo. Senão, adiciona o "+"
                        if (proximoValor !== undefined && proximoValor !== null) {
                            // Subtrai 1 do próximo valor apenas no rótulo para evitar sobreposição matemática (ex: 1 a 49, 50 a 99)
                            const maxIntervalo = proximoValor > valorAtual + 1 ? proximoValor - 1 : proximoValor;
                            rotulo = `${valorFormatado} &ndash; ${maxIntervalo.toLocaleString('pt-BR')}`;
                        } else {
                            rotulo = `${valorFormatado}+`;
                        }
                    }
                }
                    
                html += this.gerarItemLegenda(corAtual, rotulo);
            }
        }

        html += `</div>`;
        this._div.innerHTML = html;
    }

    gerarItemLegenda(cor, texto, isItalic = false) {
        const fontStyle = isItalic ? 'font-style: italic; color: #94a3b8;' : 'font-weight: 500;';
        
        return `
            <div style="display: flex; align-items: center; gap: 8px; transition: transform 0.2s ease; cursor: default;" 
                 onmouseover="this.style.transform='translateX(3px)'" 
                 onmouseout="this.style.transform='translateX(0)'">
                
                <span style="width: 13px; height: 13px; background-color: ${cor}; flex-shrink: 0; display: inline-block; border-radius: 3px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);"></span>
                
                <span style="${fontStyle} line-height: 1.2;">${texto}</span>
            </div>
        `;
    }
}