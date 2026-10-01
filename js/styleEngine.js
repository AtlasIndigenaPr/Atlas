// js/styleEngine.js

export function getColor(value, config) {
    if (value === undefined || value === null) {
        return config.defaultColor || '#CCCCCC';
    }

    // 1. Dados Categóricos / Qualitativos (Texto)
    if (config.type === 'categorical') {
        return config.categories[value] || config.defaultColor || '#CCCCCC';
    }

    // 2. Dados Numéricos / Intervalos (Choropleth)
    if (config.type === 'choropleth') {
        if (value < config.grades[0]) return config.defaultColor;

        for (let i = config.grades.length - 1; i >= 0; i--) {
            if (value >= config.grades[i]) {
                return config.colors[i];
            }
        }
        return config.colors[0];
    }

    return config.defaultColor || '#CCCCCC';
}

export function getFeatureStyle(feature, config) {
    const val = feature.properties[config.propValue];
    return {
        fillColor: getColor(val, config),
        weight: 0.8,            // Espessura fina nativa do SVG
        opacity: 1,
        color: '#ffffff',       // Divisa branca para separar áreas
        fillOpacity: 0.75
    };
}