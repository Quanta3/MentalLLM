import { v4 as uuidv4 } from 'uuid';

const contextStore = new Map(); // In-memory store

const createContext = (data) => {
  const id = uuidv4();
  contextStore.set(id, { data, createdAt: Date.now() });
  return id;
};

const getContext = (id) => {
  return contextStore.get(id)?.data || null;
};

const updateContext = (id, newData) => {
  if (contextStore.has(id)) {
    const existing = contextStore.get(id);
    const oldData = existing.data;
    contextStore.set(id, { ...existing, data: oldData + "\n" +newData });
    return existing.data
  }
};

const deleteContext = (id) => {
  contextStore.delete(id);
};

// Optional: clean up old sessions after 30 mins
setInterval(() => {
  const THIRTY_MIN = 30 * 60 * 1000;
  const now = Date.now();
  for (const [id, context] of contextStore.entries()) {
    if (now - context.createdAt > THIRTY_MIN) {
      contextStore.delete(id);
    }
  }
}, 10 * 60 * 1000); // Run cleanup every 10 mins

// ✅ Export all functions in a single default object
export default {
  createContext,
  getContext,
  updateContext,
  deleteContext,
};
