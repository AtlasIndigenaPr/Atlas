
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

   Noticias: {
        id: "Noticias",
        title: "Notícias Indígenas por Município",
        type: "categorical", // <-- Define o tipo como categórico
        url: "data/Noticias.json",
        fields: [
            { key: 'nome', label: 'Município' },
            { key: 'etnia_nome', label: 'Povo / Etnia' },
            { key: 'fase_ti',    label: 'Fase de Demarcação' },
            { key: 'municipio',     label: 'Município' }
        ],
        propValue: "Noticias por municipio",  // Atributo texto no GeoJSON (ex: 'Homologada')
        categories: {
            "1": "#0059e7",
            "2": "#00e7e7",
            "3": "#0cae75",
            "4": "#f2e205",
            "5": "#f28f05",
            "6": "#f20505",
        },
        defaultColor: '#7977779b', // Cor para categorias não mapeadas ou nulas
        
       blocks: [
        // Aqui você customiza o label do popup/sidebar livremente sem afetar o fields!
        { title: 'Principais Temas', keys: [{ key: 'Tema', label: 'Temas' }] },
        { title: 'Principais Notícias',  keys: [{ key: 'Titulo', label: 'Títulos' }] },
    ],
        activeByDefault: true
    },




populacao_indigena: {
        id: "populacao_indigena",
        title: "População Indígena",
        url: "data/Popuind.json",
        type: 'choropleth',
        // Atributos do seu GeoJSON
        propValue: "PopuInd",     // Coluna numérica das faixas
        // A sua régua de cores antiga do getColor(), estruturada em arrays
      // ...
        grades: [0, 1, 50, 200, 1000, 2500],
        colors: ['#7977779b', '#FFEDA0', '#FEB24C', '#ff5232', '#E31A1C', '#591c12'],
        labels: [
            'Sem presença indígena', 
            '1 a 50 habitantes', 
            '51 a 200 habitantes', 
            '201 a 1000 habitantes', 
            '1001 a 2500 habitantes', 
            'Mais de 2500 habitantes'
        ],
          fields: [
            { key: 'nome', label: 'Município' },
            { key: 'etnia_nome', label: 'Povo / Etnia' },
            { key: 'fase_ti',    label: 'Fase de Demarcação' },
            { key: 'PopuInd', label: 'População Indígena' },
        ],
         blocks: [
             { title: '', keys: ['PopuInd'] },
        ],
        activeByDefault: false,
},


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
