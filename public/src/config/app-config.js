// Application configuration and constants
export const APP_CONFIG = {
    // Theme configuration
    theme: {
        storageKey: 'portfolio-theme',
        default: 'dark'
    },

    // Content configuration
    content: {
        basePath: {
            en: 'data/content.json',
            ar: '../data/content.ar.json'
        },
        cacheBustParam: true
    },

    // Animation configuration
    animation: {
        typing: {
            words: ['LLM Specialist', 'AI Researcher', 'Problem Solver'],
            typeSpeed: 120,
            deleteSpeed: 80,
            delay: 1200
        },

        // Starfield configuration
        starfield: {
            starCount: 4000,
            starSpeed: 0.0002,
            rotationSpeed: 0.0001,
            mouseInfluence: 0.00005
        },

        // Particles configuration
        particles: {
            baseCount: 32,
            idleTimeout: 5000,
            speedRange: [0.0006, 0.0012],
            sizeRange: [1, 2]
        }
    },

    // Skills configuration
    skills: {
        filterStorageKey: 'portfolio-skill-filters-v1',
        categoryColors: {
            'ML/AI': '#d92323',
            LLM: '#ff5858',
            Data: '#ff914d',
            DevOps: '#8a8a8a',
            VectorDB: '#ff6b6b',
            Retrieval: '#d92323',
            Orchestration: '#ff914d',
            Agents: '#8a8a8a',
            'OCR/Parsing': '#ff5858',
            OCR: '#ff5858',
            MLOps: '#ff914d',
            Generative: '#d92323'
        }
    },

    // Admin/Dev configuration
    admin: {
        token: 'dev',
        enabled: () => {
            const hash = window.location.hash;
            const token =
                hash === '#admin'
                    ? 'dev'
                    : hash.startsWith('#admin=')
                      ? hash.split('=')[1] || ''
                      : null;
            const isProduction = /github\.io$/i.test(window.location.hostname);
            return !isProduction && token === 'dev';
        }
    },

    // Build configuration
    build: {
        version: window.BUILD_VERSION || '',
        assetVersionMeta: 'asset-version'
    }
};

// Performance and accessibility preferences
export const PERFORMANCE_CONFIG = {
    // Intersection Observer thresholds
    observers: {
        fadeIn: { threshold: 0.2, rootMargin: '0px 0px -50px 0px' },
        sections: { threshold: 0.35, rootMargin: '0px 0px -10%' },
        hero: { threshold: 0.05 },
        skills: { threshold: 0.25 }
    },

    // Animation preferences
    prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,

    // Debounce delays
    debounce: {
        search: 300,
        resize: 150,
        scroll: 100
    }
};

// Icon mappings
export const SKILL_ICONS = {
    Python: 'images/skills/python.svg',
    PyTorch: 'images/skills/pytorch.svg',
    TensorFlow: 'images/skills/tensorflow.svg',
    'Scikit-learn': 'images/skills/scikit-learn.svg',
    Pandas: 'images/skills/pandas.svg',
    Docker: 'images/skills/docker.svg',
    SQL: 'images/skills/sql.svg',
    'Apache Spark': 'images/skills/spark.svg',
    MLflow: 'images/skills/mlflow.svg',
    'Hugging Face Transformers': 'images/skills/huggingface.svg',
    Diffusers: 'images/skills/diffusers.svg',
    'Neural Networks': 'images/skills/neural-networks.svg',
    Ollama: 'images/skills/ollama.svg',
    'PEFT/LoRA': 'images/skills/peft-lora.svg',
    LlamaIndex: 'images/skills/llamaindex.svg',
    ChromaDB: 'images/skills/chromadb.svg',
    Milvus: 'images/skills/milvus.svg',
    LangGraph: 'images/skills/langgraph.svg',
    CrewAI: 'images/skills/crewai.svg',
    Docling: 'images/skills/docling.svg',
    Tesseract: 'images/skills/tesseract.svg'
};
