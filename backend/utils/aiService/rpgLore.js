export const LORE = {
    STRENGTH: {
        realm: "Templo del Hierro",
        actions: ["entrenar", "forjar", "fortalecer"],
        enemies: ["pereza", "debilidad"],
        weapons: ["determinación", "disciplina"],
        places: ["gimnasio", "campo de entrenamiento"]
    },
    DEXTERITY: {
        realm: "Taller de Creación",
        actions: ["crear", "craftear", "perfeccionar", "dominar"],
        enemies: ["caos", "torpeza"],
        weapons: ["habilidad", "precisión"],
        places: ["estudio", "cocina", "taller"]
    },
    WISDOM: {
        realm: "Biblioteca Ancestral",
        actions: ["estudiar", "aprender", "descubrir"],
        enemies: ["ignorancia", "confusión"],
        weapons: ["conocimiento", "sabiduría"],
        places: ["biblioteca", "aula"]
    },
    CHARISMA: {
        realm: "Corte Real",
        actions: ["inspirar", "conectar", "liderar"],
        enemies: ["timidez", "silencio"],
        weapons: ["carisma", "presencia"],
        places: ["reunión", "escenario"]
    }
}

export const DIFFICULTY = {
    QUICK: { prefix: "Rápida", intensity: "misión" },
    STANDARD: { prefix: "Noble", intensity: "aventura" },
    LONG: { prefix: "Épica", intensity: "campaña" },
    EPIC: { prefix: "Mítica", intensity: "saga" }
}