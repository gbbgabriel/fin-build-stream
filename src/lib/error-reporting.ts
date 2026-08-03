/**
 * Ponto único de captura de erros de error boundary.
 *
 * O React em produção não relança erros capturados por boundary para
 * window.onerror, então nenhuma telemetria os enxerga por conta própria —
 * é por isso que os boundaries chamam esta função explicitamente.
 *
 * Hoje ela apenas normaliza o erro e registra no console. Para enviar a um
 * serviço de observabilidade (Sentry, Highlight, GlitchTip…), faça a chamada
 * aqui: todos os boundaries da aplicação passam por este ponto.
 */

type ErrorContext = Record<string, unknown>;

function describe(error: unknown): { message: string; stack?: string } {
  // Loaders e server functions costumam lançar um Response cru; String(it)
  // vira o opaco "[object Response]", então extraímos status e URL.
  if (error instanceof Response) {
    return {
      message: `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      ...(error.stack !== undefined && { stack: error.stack }),
    };
  }

  return { message: String(error) };
}

export function reportError(error: unknown, context: ErrorContext = {}) {
  if (typeof window === "undefined") return;

  const { message, stack } = describe(error);

  console.error("[error-boundary]", message, {
    route: window.location.pathname,
    ...(stack !== undefined && { stack }),
    ...context,
  });
}
