// ========================================================
// VECTRA // RESILIENT SUPABASE INTEGRATION SERVICE
// ========================================================

class SupabaseService {
  constructor() {
    this.url = process.env.SUPABASE_URL || '';
    this.key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.isConnected = false;
    this.totalLogsCount = 0;
    this.lastLogTimestamp = null;

    this.checkConnection();
  }

  async checkConnection() {
    try {
      const res = await fetch(`${this.url}/rest/v1/`, {
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`
        }
      });
      this.isConnected = res.ok;
      return this.isConnected;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Registra cada interacción de voz/texto y cálculo vectorial en Supabase
   */
  async logInteraction(userMessage, responseData, metadata = {}) {
    if (!userMessage) return null;

    const payload = {
      action: 'VECTRA_QUERY',
      target_type: responseData.visualizacion?.tipo || 'conversacion',
      target_id: 'vectra-jarvis-ai',
      details: JSON.stringify({
        pregunta: userMessage,
        habla: responseData.habla,
        emocion: responseData.emocion,
        resultado: responseData.resultado?.texto,
        num_pasos: responseData.pasos?.length || 0,
        proveedor: responseData._meta?.providerName || metadata.provider || 'VECTRA AI',
        latencia_ms: responseData._meta?.latencyMs || 0,
        verificado_motor: responseData._meta?.verifiedByMathEngine || false,
        timestamp: new Date().toISOString()
      })
    };

    try {
      const res = await fetch(`${this.url}/rest/v1/admin_audit_logs`, {
        method: 'POST',
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.isConnected = true;
        this.totalLogsCount += 1;
        this.lastLogTimestamp = new Date().toISOString();
        return true;
      }
    } catch (err) {
      // No interrumpir nunca la presentación si Supabase tiene problemas de red
      this.isConnected = false;
    }
    return false;
  }

  getStatus() {
    return {
      connected: this.isConnected,
      url: this.url,
      totalLogsCount: this.totalLogsCount,
      lastLogTimestamp: this.lastLogTimestamp
    };
  }
}

export const supabaseService = new SupabaseService();
