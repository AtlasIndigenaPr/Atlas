
// Camada fixa de contorno do Estado
export const STATE_BOUNDARY_CONFIG = {
    id: "limite_parana",
    title: "Limite Estadual do Paraná",
    url: "data/Limites.json", // Seu GeoJSON com o contorno do Estado
    style: {
        color: '#1a1a1a',       // Cor grafite escuro / preto para destaque
        weight: 2.2,            // Borda mais espessa que a dos municípios
        opacity: 0.9,
        fill: false,            // Sem preenchimento interno
        interactive: false      // IMPORTANTE: ignora eventos de mouse (pass-through)
    }
};

export const LAYERS_CONFIG = {

terras_indigenas_fase: {
        id: "terras_indigenas_fase",
        title: "Situação Jurídica da Terra Indígena",
        type: "categorical", // <-- Define o tipo como categórico
        url: "data/terras.json",
        propValue: "fase_ti",  // Atributo texto no GeoJSON (ex: 'Homologada')
        categories: {
            "Regularizada": "#004a11",
            "Declarada": "#dcc008",
            "Delimitada": "#e67300",
        },

         fields: [
            { key: 'terrai_nom', label: 'Nome da TI' },
        ],
        blocks: [
    { 
        title: 'Informações Gerais', // O título que vai aparecer no topo desse grupo
        keys: [
            { key: 'etnia_nome', label: 'Povo / Etnia' },
            { key: 'fase_ti', label: 'Fase de Demarcação' },
            { key: 'modalidade', label: 'Modalidade' }
        ] 
    }
],
        defaultColor: '#cccccc', // Cor para categorias não mapeadas ou nulas
        hideDefaultInLegend: true, // <--- ADICIONE ESTA LINHA AQUI
        activeByDefault: false
    },
};
