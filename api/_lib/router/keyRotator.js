// ========================================================
// VECTRA // KEY ROTATOR FOR API CREDENTIALS
// ========================================================

class KeyRotator {
  constructor() {
    this.keyIndices = new Map(); // providerId -> currentKeyIndex
  }

  /**
   * Obtiene la siguiente clave disponible para un proveedor
   */
  getKey(providerId, envVarName) {
    if (!envVarName || envVarName === 'NONE') return null;
    const rawKeys = process.env[envVarName] || '';
    const keys = rawKeys.split(',').map((k) => k.trim()).filter(Boolean);

    if (keys.length === 0) return null;

    let currentIndex = this.keyIndices.get(providerId) || 0;
    if (currentIndex >= keys.length) {
      currentIndex = 0;
    }

    const selectedKey = keys[currentIndex];
    // Preparar el siguiente turno
    this.keyIndices.set(providerId, (currentIndex + 1) % keys.length);
    return selectedKey;
  }

  /**
   * Indica si el proveedor tiene al menos una clave configurada
   */
  hasKeys(envVarName) {
    if (!envVarName || envVarName === 'NONE') return true; // Para Ollama / Demo
    const rawKeys = process.env[envVarName] || '';
    return rawKeys.split(',').map((k) => k.trim()).filter(Boolean).length > 0;
  }
}

export const keyRotator = new KeyRotator();
