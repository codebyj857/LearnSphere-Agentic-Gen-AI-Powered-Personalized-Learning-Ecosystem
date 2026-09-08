# 🏗️ LEARNSPHERE ARCHITECTURE CORE

## 📊 **SYSTEM ARCHITECTURE OVERVIEW**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           LEARNSPHERE ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   BROWSER   │    │   DOCKER    │    │   CLOUD/    │    │   DEPLOY    │      │
│  │             │    │  CONTAINER  │    │  SERVER     │    │   SERVICE   │      │
│  │  React UI   │◄──►│             │◄──►│             │◄──►│             │      │
│  │  (Port 80)  │    │  Frontend   │    │  (AWS/GCP)  │    │ (Render/    │      │
│  │             │    │  (Port 3000)│    │             │    │  Vercel)    │      │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘      │
│         │                   │                   │                   │         │
│         └───────────────────┼───────────────────┼───────────────────┘         │
│                             │                   │                             │
│  ┌─────────────────────────┼───────────────────┼─────────────────────────┐  │
│  │                         │                   │                         │  │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │  │
│  │  │    NGINX    │    │   FLASK     │    │   DATABASE  │              │  │
│  │  │             │    │   BACKEND   │    │             │              │  │
│  │  │  Reverse    │◄──►│             │◄──►│   SQLite/   │              │  │
│  │  │   Proxy     │    │  (Port 5001)│    │ PostgreSQL  │              │  │
│  │  │  (Port 80)  │    │             │    │             │              │  │
│  │  └─────────────┘    └─────────────┘    └─────────────┘              │  │
│  │                         │                   │                         │  │
│  │                         │                   │                         │  │
│  │  ┌─────────────────────────────────────────────────────────────┐    │  │
│  │  │                    EXTERNAL APIS                           │    │  │
│  │  │                                                         │    │  │
│  │  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │    │  │
│  │  │  │   GEMINI    │    │   GOOGLE    │    │   OPENAI    │    │    │  │
│  │  │  │     AI      │    │   CLOUD    │    │     AI      │    │    │  │
│  │  │  │  (Chatbot)  │    │ (Storage)  │    │ (Optional)  │    │    │  │
│  │  │  └─────────────┘    └─────────────┘    └─────────────┘    │    │  │
│  │  └─────────────────────────────────────────────────────────────┘    │  │
│  └─────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────┘
```

## 🔧 **TECHNICAL STACK BREAKDOWN**

### **FRONTEND LAYER**
```
┌─────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   APP.TSX   │    │ COMPONENTS  │    │    UTILS    │         │
│  │             │    │             │    │             │         │
│  │  Main Entry │    │  • Pages    │    │  • API      │         │
│  │  Router     │    │  • Auth     │    │  • Helpers  │         │
│  │  Error      │    │  • UI       │    │  • Hooks    │         │
│  │  Boundary   │    │  • Forms    │    │             │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    STATE MANAGEMENT                         │ │
│  │                                                             │ │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │ │
│  │  │   CONTEXT   │    │   LOCAL     │    │   SESSION   │    │ │
│  │  │             │    │   STORAGE   │    │   STORAGE   │    │ │
│  │  │  Auth       │    │  Settings   │    │  Tokens     │    │ │
│  │  │  User       │    │  Cache      │    │  Session    │    │ │
│  │  │  Theme      │    │  Favorites  │    │  Data       │    │ │
│  │  └─────────────┘    └─────────────┘    └─────────────┘    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### **BACKEND LAYER**
```
┌─────────────────────────────────────────────────────────────────┐
│                     FLASK BACKEND                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  APP_SIMPLE │    │    MODELS   │    │   ROUTES    │         │
│  │     .PY     │    │             │    │             │         │
│  │             │    │  • User     │    │  • Auth     │         │
│  │  Main App   │    │  • Feedback │    │  • API      │         │
│  │  Config     │    │  • Survey   │    │  • Admin    │         │
│  │  Errors     │    │  • Stats    │    │  • Health   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    MIDDLEWARE LAYER                         │ │
│  │                                                             │ │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │ │
│  │  │     CORS    │    │   ERROR     │    │    AUTH     │    │ │
│  │  │             │    │  HANDLER    │    │             │    │ │
│  │  │  Cross-     │    │  Global     │    │  JWT/       │    │ │
│  │  │  Origin     │    │  Exception  │    │  Session    │    │ │
│  │  │  Security   │    │  Handler    │    │  Tokens     │    │ │
│  │  └─────────────┘    └─────────────┘    └─────────────┘    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### **DATABASE LAYER**
```
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   SQLITE    │    │ POSTGRESQL  │    │     REDIS   │         │
│  │             │    │             │    │             │         │
│  │  Development│    │ Production  │    │   Caching    │         │
│  │  Local      │    │  Scalable   │    │  Sessions    │         │
│  │  Embedded   │    │  Persistent │    │  Pub/Sub     │         │
│  │  File DB    │    │  ACID       │    │  Memory      │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    DATA MODELS                              │ │
│  │                                                             │ │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │ │
│  │  │     USER    │    │  FEEDBACK   │    │   SURVEY    │    │ │
│  │  │             │    │             │    │             │    │ │
│  │  │  ID, Email  │    │  User ID    │    │  User ID    │    │ │
│  │  │  Password   │    │  Course     │    │  Answers    │    │ │
│  │  │  Profile    │    │  Rating     │    │  Results    │    │ │
│  │  │  Settings   │    │  Feedback   │    │  Timestamp  │    │ │
│  │  └─────────────┘    └─────────────┘    └─────────────┘    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 **DATA FLOW ARCHITECTURE**

### **REQUEST FLOW**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   USER      │    │   REACT     │    │   NGINX     │    │   FLASK     │
│             │    │   APP       │    │   PROXY     │    │   BACKEND   │
│  Clicks     │──► │  Component  │──► │  Route      │──► │  Endpoint  │
│  Forms      │    │  API Call   │    │  Forward    │    │  Handler   │
│  Navigation │    │  State      │    │  CORS       │    │  Logic     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                           │                   │                   │
                           │                   │                   │
                           ▼                   ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │   RETRY     │    │   ERROR     │    │  DATABASE   │
                   │   LOGIC     │    │  HANDLING   │    │  QUERY     │
                   │             │    │             │    │             │
                   │  2x Retries │    │  Global     │    │  CRUD      │
                   │  Backoff    │    │  Handler    │    │  Retry     │
                   │  Timeout    │    │  Logging    │    │  Pool      │
                   └─────────────┘    └─────────────┘    └─────────────┘
```

### **RESPONSE FLOW**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  DATABASE   │    │   FLASK     │    │   NGINX     │    │   REACT     │
│             │    │   BACKEND   │    │   PROXY     │    │   APP       │
│  Data       │──► │  Serialize  │──► │  Compress   │──► │  Update    │
│  Results    │    │  JSON       │    │  Cache      │    │  State     │
│  Status     │    │  Headers    │    │  Headers    │    │  UI        │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## 🤖 **AI INTEGRATION ARCHITECTURE**

### **GEMINI AI CHAIN**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   USER      │    │   FLASK     │    │   GEMINI    │    │   RESPONSE  │
│   INPUT     │    │   BACKEND   │    │     AI      │    │   PROCESSOR  │
│             │    │             │    │             │    │             │
│  Question   │──► │  Prompt     │──► │  Generate   │──► │  Format     │
│  Context    │    │  Engineer   │    │  Content    │    │  JSON       │
│  History    │    │  API Key    │    │  Model      │    │  Response   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                           │                   │                   │
                           ▼                   ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │   ERROR     │    │   TIMEOUT   │    │   CACHE     │
                   │  HANDLING   │    │  PROTECTION │    │  LAYER     │
                   │             │    │             │    │             │
                   │  Fallback   │    │  30s Limit  │    │  Redis      │
                   │  Logging    │    │  Thread     │    │  Memory     │
                   │  Retry      │    │  Safety     │    │  Session    │
                   └─────────────┘    └─────────────┘    └─────────────┘
```

## 🐳 **DOCKER CONTAINER ARCHITECTURE**

### **MULTI-STAGE BUILD**
```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCKER BUILD STAGES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  STAGE 1: BACKEND BUILD                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   PYTHON    │    │  REQUIRE-  │    │   FLASK     │         │
│  │   BASE      │    │  MENTS     │    │   APP       │         │
│  │   IMAGE     │    │  INSTALL   │    │   COPY      │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│  STAGE 2: FRONTEND BUILD                                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │    NODE     │    │   NPM       │    │   REACT     │         │
│  │   BASE      │    │   INSTALL   │    │   BUILD     │         │
│  │   IMAGE     │    │   DEPS      │    │   OUTPUT    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│  STAGE 3: PRODUCTION COMBINE                                    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │    NGINX    │    │   FLASK     │    │   START     │         │
│  │   FRONTEND  │    │   BACKEND   │    │   SCRIPT    │         │
│  │   SERVE     │    │   SERVE     │    │   ORCHESTR   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### **SERVICE ORCHESTRATION**
```
┌─────────────────────────────────────────────────────────────────┐
│                  DOCKER COMPOSE NETWORK                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  FRONTEND   │    │   BACKEND   │    │  DATABASE   │         │
│  │  CONTAINER  │    │  CONTAINER  │    │  CONTAINER  │         │
│  │             │    │             │    │             │         │
│  │  Port: 3000 │    │  Port: 5001 │    │  Port: 5432 │         │
│  │  Nginx +    │    │  Flask +    │    │  PostgreSQL │         │
│  │  React      │    │  Gunicorn   │    │  + Redis    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             │                                   │
│  ┌─────────────────────────┼─────────────────────────┐           │
│  │                         │                         │           │
│  ▼                         ▼                         ▼           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │
│  │   DOCKER    │    │   HEALTH    │    │   VOLUME    │           │
│  │   NETWORK   │    │   CHECKS    │    │   STORAGE   │           │
│  │             │    │             │    │             │           │
│  │  Internal   │    │  Automatic  │    │  Persistent  │           │
│  │  Bridge     │    │  Restart    │    │  Data       │           │
│  └─────────────┘    └─────────────┘    └─────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

## 🔒 **SECURITY ARCHITECTURE**

### **LAYERED SECURITY**
```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   NETWORK   │    │  APPLICATION│    │    DATA     │         │
│  │   SECURITY  │    │   SECURITY  │    │   SECURITY  │         │
│  │             │    │             │    │             │         │
│  │  HTTPS/TLS  │    │  CORS       │    │  Encryption │         │
│  │  Firewall   │    │  Input      │    │  Hashing    │         │
│  │  Rate Limit │    │  Validation │    │  Backups    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    AUTHENTICATION                           │ │
│  │                                                             │ │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │ │
│  │  │     JWT     │    │   SESSION   │    │    OAUTH    │    │ │
│  │  │             │    │             │    │             │    │ │
│  │  │  Tokens     │    │  Cookies    │    │  Google     │    │ │
│  │  │  Refresh    │    │  Secure     │    │  GitHub     │    │ │
│  │  │  Expiry     │    │  HttpOnly   │    │  SSO        │    │ │
│  │  └─────────────┘    └─────────────┘    └─────────────┘    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 **MONITORING & LOGGING**

### **OBSERVABILITY STACK**
```
┌─────────────────────────────────────────────────────────────────┐
│                  MONITORING ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   LOGGING   │    │  METRICS    │    │   HEALTH    │         │
│  │             │    │             │    │             │         │
│  │  Structured │    │  Prometheus │    │  Endpoints  │         │
│  │  JSON       │    │  Grafana    │    │  Checks     │         │
│  │  ELK Stack  │    │  Custom     │    │  Alerts     │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    ERROR HANDLING                            │ │
│  │                                                             │ │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │ │
│  │  │   GLOBAL    │    │   RETRY     │    │   FALLBACK  │    │ │
│  │  │   HANDLER   │    │   LOGIC     │    │   SYSTEM    │    │ │
│  │  │             │    │             │    │             │    │ │
│  │  │  Try-Catch  │    │  Exponential│    │  Graceful   │    │ │
│  │  │  Logging    │    │  Backoff    │    │  Degrad.    │    │ │
│  │  │  Recovery   │    │  Circuit    │    │  Offline    │    │ │
│  │  └─────────────┘    └─────────────┘    └─────────────┘    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 **DEPLOYMENT ARCHITECTURE**

### **MULTI-ENVIRONMENT DEPLOYMENT**
```
┌─────────────────────────────────────────────────────────────────┐
│                  DEPLOYMENT PIPELINE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ DEVELOPMENT │    │   STAGING   │    │ PRODUCTION  │         │
│  │             │    │             │    │             │         │
│  │  Local      │    │  Test       │    │  Live       │         │
│  │  Docker     │    │  Docker     │    │  Kubernetes │         │
│  │  Hot Reload │    │  CI/CD      │    │  Auto Scale │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    INFRASTRUCTURE                             │ │
│  │                                                             │ │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │ │
│  │  │     AWS     │    │    GCP      │    │   AZURE     │    │ │
│  │  │             │    │             │    │             │    │ │
│  │  │  ECS/EKS    │    │  Cloud Run  │    │  Container  │    │ │
│  │  │  RDS        │    │  Cloud SQL  │    │  Database   │    │ │
│  │  │  S3/CF      │    │  Storage    │    │  Storage    │    │ │
│  │  └─────────────┘    └─────────────┘    └─────────────┘    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 **KEY ARCHITECTURAL DECISIONS**

### **WHY THIS ARCHITECTURE?**

1. **Decoupled Frontend/Backend**: Independent scaling, better performance
2. **Microservices Ready**: Easy to split into separate services
3. **Container-First**: Consistent deployment across environments
4. **AI Integration**: Native Gemini AI integration with fallbacks
5. **Bulletproof Error Handling**: Global error boundaries and retry logic
6. **Security-First**: Multiple layers of security and validation
7. **Observability**: Comprehensive logging, metrics, and health checks
8. **Scalable Database**: SQLite for dev, PostgreSQL for production
9. **Modern Tech Stack**: React 18, Flask, Docker, modern best practices
10. **Production Ready**: Optimized for real-world deployment scenarios

### **TRADE-OFFS & RATIONALE**

| Decision | Trade-off | Rationale |
|----------|------------|-----------|
| React vs Angular | Steeper learning curve | Better performance, modern hooks |
| Flask vs Django | Less built-in features | Lightweight, flexible, perfect for APIs |
| SQLite vs PostgreSQL | Less scalable for dev | Simpler setup, embedded, perfect for MVP |
| Docker vs VM | More complex setup | Consistent environments, container benefits |
| Gemini vs OpenAI | Newer, less tested | Better integration, cost-effective |

---

**🏗️ This architecture ensures LearnSphere is:**
- **Scalable**: Ready for growth and traffic spikes
- **Maintainable**: Clean separation of concerns
- **Secure**: Multiple layers of protection
- **Observable**: Comprehensive monitoring and logging
- **Resilient**: Bulletproof error handling and recovery
- **Production-Ready**: Optimized for real-world deployment
