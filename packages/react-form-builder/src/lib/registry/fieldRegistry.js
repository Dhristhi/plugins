let registry = [];

export const initFieldRegistry = (types = []) => {
  registry = Array.isArray(types) ? [...types] : [];
};

export const registerFieldTypes = (types = []) => {
  const map = new Map(registry.map((t) => [t.id, t]));
  for (const t of types) {
    map.set(t.id, t);
  }
  registry = Array.from(map.values());
};

export const getFieldTypes = () => registry.slice();

export const getFieldTypeById = (id) => registry.find((t) => t.id === id);
