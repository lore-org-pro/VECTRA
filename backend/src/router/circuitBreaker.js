// ========================================================
// VECTRA // CIRCUIT BREAKER & USAGE TRACKER
// ========================================================

class CircuitBreaker {
  constructor() {
    this.providersState = new Map();
  }

  initProvider(provider) {
    if (!this.providersState.has(provider.id)) {
      this.providersState.set(provider.id, {
        id: provider.id,
        name: provider.name,
        status: provider.active ? 'ACTIVE' : 'DISABLED', // ACTIVE | COOLDOWN | EXHAUSTED | DISABLED
        failureCount: 0,
        cooldownUntil: 0,
        rpmCount: 0,
        rpdCount: 0,
        lastMinuteReset: Date.now(),
        lastDayReset: Date.now(),
        latencies: [],
        averageLatencyMs: 0,
        lastError: null
      });
    }
  }

  checkLimits(provider) {
    this.initProvider(provider);
    const state = this.providersState.get(provider.id);

    if (state.status === 'DISABLED') return { allowed: false, reason: 'Desactivado manualmente' };

    const now = Date.now();

    // Comprobar cooldown
    if (state.status === 'COOLDOWN') {
      if (now >= state.cooldownUntil) {
        state.status = 'ACTIVE';
        state.failureCount = 0;
        state.lastError = null;
      } else {
        const remainingSec = Math.ceil((state.cooldownUntil - now) / 1000);
        return { allowed: false, reason: `En enfriamiento (${remainingSec}s restantes)` };
      }
    }

    // Reinicio de ventana de 1 minuto
    if (now - state.lastMinuteReset > 60000) {
      state.rpmCount = 0;
      state.lastMinuteReset = now;
    }

    // Reinicio de ventana de 1 día (24h)
    if (now - state.lastDayReset > 86400000) {
      state.rpdCount = 0;
      state.lastDayReset = now;
      if (state.status === 'EXHAUSTED') state.status = 'ACTIVE';
    }

    // Verificar límites declarados en providers.json
    if (provider.limits) {
      if (provider.limits.rpm && state.rpmCount >= provider.limits.rpm) {
        return { allowed: false, reason: `Límite RPM alcanzado (${state.rpmCount}/${provider.limits.rpm})` };
      }
      if (provider.limits.rpd && state.rpdCount >= provider.limits.rpd) {
        state.status = 'EXHAUSTED';
        return { allowed: false, reason: `Límite diario RPD agotado (${state.rpdCount}/${provider.limits.rpd})` };
      }
    }

    return { allowed: true };
  }

  recordSuccess(providerId, latencyMs) {
    const state = this.providersState.get(providerId);
    if (!state) return;

    state.rpmCount++;
    state.rpdCount++;
    state.failureCount = 0;
    state.status = 'ACTIVE';
    state.lastError = null;

    // Actualizar latencia media (últimas 10 solicitudes)
    state.latencies.push(latencyMs);
    if (state.latencies.length > 10) state.latencies.shift();
    const sum = state.latencies.reduce((a, b) => a + b, 0);
    state.averageLatencyMs = Math.round(sum / state.latencies.length);
  }

  recordFailure(providerId, errorType, errorMsg, statusCode = null) {
    const state = this.providersState.get(providerId);
    if (!state) return;

    state.failureCount++;
    state.lastError = `${errorType}: ${errorMsg}`;

    const now = Date.now();

    // 429: Rate limit transitorio -> cooldown de 60 segundos
    if (statusCode === 429) {
      state.status = 'COOLDOWN';
      state.cooldownUntil = now + 60000;
    } 
    // 401 / 403: Clave inválida o sin créditos -> cooldown de 30 minutos
    else if (statusCode === 401 || statusCode === 403) {
      state.status = 'COOLDOWN';
      state.cooldownUntil = now + 1800000;
    } 
    // Timeout o 5xx repetidos (3 seguidos) -> cooldown de 45 segundos
    else if (state.failureCount >= 2) {
      state.status = 'COOLDOWN';
      state.cooldownUntil = now + 45000;
    }
  }

  toggleProvider(providerId, active) {
    const state = this.providersState.get(providerId);
    if (state) {
      state.status = active ? 'ACTIVE' : 'DISABLED';
    }
  }

  getAllStates() {
    return Array.from(this.providersState.values());
  }
}

export const circuitBreaker = new CircuitBreaker();
