# Modern error handling and logging architecture for Python and TypeScript projects

In August 2025, the observability landscape has matured significantly with OpenTelemetry as the de facto standard, AI-powered error analysis becoming mainstream, and sophisticated integration between error handling, logging, and performance monitoring. For teams using Python 3.13.7 with uv 0.8.14 and TypeScript with Bun 1.2.21, the ecosystem offers production-ready solutions that balance performance, developer experience, and cost optimization.

## Python logging with structlog 25.4.0 dominates the ecosystem

Python's logging landscape in 2025 centers around **structlog 25.4.0**, which has achieved full compatibility with Python 3.13.7's enhanced error messages and free-threaded build mode. The library now includes native support for Python's new `merge_extra` LoggerAdapter functionality and colorized exception tracebacks, providing exceptional developer experience while maintaining production performance of **80,000 requests per second**.

Installation with uv 0.8.14 leverages parallel dependency resolution for optimal speed:

```bash
uv add structlog "structlog[dev]" rich
```

The recommended production configuration integrates seamlessly with Ruff 0.12.11's enhanced logging rules:

```python
import structlog
import os
from contextlib import asynccontextmanager

def setup_logging(environment: str = "production"):
    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
    ]

    if environment == "development":
        processors.append(structlog.dev.ConsoleRenderer())
    else:
        processors.extend([
            structlog.processors.EventRenamer("message"),
            structlog.processors.JSONRenderer()
        ])

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.stdlib.AsyncBoundLogger,  # For async support
        cache_logger_on_first_use=True,
    )

logger = structlog.get_logger()
```

Ruff 0.12.11 provides automated enforcement of logging best practices through specific rules that detect anti-patterns like f-string logging (G004) and improper exception handling (TRY400-TRY401). The linter now auto-fixes common logging issues, significantly reducing code review overhead.

## TypeScript excellence with Pino and Bun 1.2.21

For TypeScript projects running on Bun 1.2.21, **Pino emerges as the clear performance leader** with 85,000 requests per second - 5x faster than Winston. Bun's native optimizations for JSON serialization and file I/O operations make it particularly well-suited for high-throughput logging scenarios.

The optimal Bun configuration leverages native APIs while maintaining compatibility:

```typescript
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: process.env.SERVICE_NAME || 'unknown-service',
    version: process.env.SERVICE_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'production',
  },
  formatters: {
    level: (label: string) => ({ level: label.toUpperCase() }),
  },
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss.l',
    }
  } : undefined,
  redact: {
    paths: ['password', 'token', 'authorization', '*.apiKey'],
    censor: '[REDACTED]'
  }
});

export default logger;
```

Biome 2.2.2 integration ensures code quality through sophisticated error handling rules. While Biome's type inference currently covers \~75% of TypeScript error patterns, it effectively enforces critical patterns like proper Error object throwing and promise handling:

```json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noExplicitAny": "error",
        "noFloatingPromises": "error"
      },
      "style": {
        "useThrowOnlyError": "error"
      }
    }
  }
}
```

## Error tracking platforms undergo significant disruption

The error tracking landscape in 2025 shows **Sentry facing strong competition** after community backlash over AI training policies. Organizations are increasingly adopting alternatives that offer better cost predictability and data control. **SigNoz**, an OpenTelemetry-native solution, provides full-stack observability with self-hosting options starting at $49/month, offering superior data ownership compared to Sentry's $26-29/month base pricing that can escalate quickly at scale.

For frontend-heavy applications, **LogRocket** at $69/month for 10,000 sessions delivers unmatched session replay capabilities with mobile SDK optimization. **Better Stack** at $29/month offers exceptional log management with built-in incident response, making it ideal for teams prioritizing operational excellence. Enterprise organizations gravitate toward **DataDog** or **New Relic**, with the latter's data ingestion model ($0.35/GB after 100GB free) providing more predictable costs than DataDog's complex host-based pricing.

OpenTelemetry has achieved **production maturity** with version 1.7.0 of OTLP, featuring stable traces, metrics, and logs support across all major languages. The JavaScript SDK 2.0 release brings significant performance improvements with minimum Node.js 18.19.0 requirement, while Python SDK 1.36.0 supports Python 3.9+ with production-stable telemetry. AWS leads cloud integration with ADOT (AWS Distro for OpenTelemetry) providing native CloudWatch OTLP endpoints, while Google Cloud Trace and Azure Application Insights offer comparable native support.

## Structured logging best practices emphasize correlation and cost control

Modern structured logging in 2025 prioritizes **JSON format with OTLP transmission** for observability platforms. Organizations implement sophisticated correlation tracking using W3C Trace Context standard (128-bit trace IDs) alongside UUID v4 correlation IDs for request tracing. This dual approach enables seamless integration between application logs and distributed tracing systems.

Cost optimization becomes critical as data volumes explode. Smart sampling strategies reduce costs by 60-80% while maintaining observability quality:

```python
class LogSampler:
    def __init__(self):
        self.error_sample_rate = 1.0      # 100% of errors
        self.info_sample_rate = 0.1       # 10% of info logs
        self.debug_sample_rate = 0.01     # 1% of debug logs

    def should_sample(self, level: str, correlation_id: str) -> bool:
        if level in ['error', 'warning']:
            return True

        # Hash-based sampling for consistency
        import hashlib
        hash_value = int(hashlib.md5(correlation_id.encode()).hexdigest()[:8], 16)
        threshold = hash_value / 0xFFFFFFFF

        sample_rates = {'info': 0.1, 'debug': 0.01, 'trace': 0.001}
        return threshold < sample_rates.get(level, 1.0)
```

For TypeScript, AsyncLocalStorage provides elegant correlation tracking:

```typescript
import { AsyncLocalStorage } from 'async_hooks';
const correlationStorage = new AsyncLocalStorage<{ correlationId: string }>();

export const loggingMiddleware = (req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  correlationStorage.run({ correlationId }, () => {
    const requestLogger = logger.child({ correlationId });
    req.logger = requestLogger;
    next();
  });
};
```

## Monorepo patterns leverage shared error definitions

Monorepo architectures in 2025 benefit from **shared error type packages** that standardize error handling across Python and TypeScript services. Teams using Nx or Turborepo create centralized error definitions with consistent serialization formats, enabling seamless cross-service error propagation.

The recommended structure maintains language-specific implementations while sharing common error codes:

```typescript
// packages/shared-errors/src/index.ts
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

export class BaseError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public correlationId?: string
  ) {
    super(message);
    this.timestamp = new Date();
    this.service = process.env.SERVICE_NAME || 'unknown';
  }
}
```

Tools like **Nx provide built-in observability** through distributed task execution monitoring and dependency graph analysis for error impact assessment. Turborepo offers high-performance builds with integrated error aggregation and remote caching failure analysis, both supporting OpenTelemetry integration for comprehensive monorepo observability.

## APM landscape transforms with AI and eBPF technologies

The 2025 APM landscape shows **dramatic shifts toward AI-powered analysis and eBPF-based monitoring**. Organizations achieve 60-80% cost reductions through intelligent data collection while gaining deeper insights. **New Relic's usage-based model** provides 5X better value than traditional subscriptions, while DataDog maintains leadership in infrastructure monitoring despite complex pricing.

**eBPF technology transitions from experimental to essential**, enabling kernel-level observability without application modification. This shift moves instrumentation responsibility from application teams to platform teams, significantly reducing overhead. Major enterprises including Capital One, Adobe, and Netflix have adopted eBPF for production monitoring, with Grafana's Beyla project (now OpenTelemetry eBPF Instrumentation) leading open-source efforts.

AI integration revolutionizes root cause analysis with **97% of organizations planning AI observability investments** for 2025. Predictive observability identifies patterns before failures occur, while AIOps platforms abstract incident detection and remediation. However, only expert organizations successfully correlate operational data with business outcomes, highlighting the importance of mature observability practices.

## CI/CD integration enables shift-left observability

Modern CI/CD pipelines in 2025 **embed observability directly into deployment workflows**. GitHub Actions provides native OpenTelemetry integration through the GitHub Receiver for OTel Collector, enabling trace data collection from workflow events. Teams extract DORA metrics automatically and implement performance regression detection that triggers automated rollbacks based on error rates.

The shift-left movement brings observability into development workflows through **IDE integrations and local development tools**. Developers access production-like observability during coding, with containerized observability stacks providing "observability superpowers" without requiring deep cloud-native expertise. Performance budgets integrate directly into CI/CD pipelines, validating SLOs automatically before deployment.

## Conclusion

The error handling and logging ecosystem in August 2025 offers mature, production-ready solutions that balance performance, developer experience, and cost optimization. Python teams should adopt structlog 25.4.0 with uv and Ruff integration, while TypeScript projects benefit from Pino's superior performance on Bun 1.2.21. Organizations must prioritize OpenTelemetry adoption for vendor independence, implement intelligent sampling for cost control, and leverage AI-powered analysis for proactive error detection. Success requires treating observability as a first-class concern throughout the development lifecycle, from IDE to production, while maintaining focus on business outcomes rather than purely technical metrics.
