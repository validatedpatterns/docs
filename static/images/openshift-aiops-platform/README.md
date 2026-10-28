# OpenShift AIOps Platform Images

This directory contains diagrams and images for the OpenShift AIOps Self-Healing Platform pattern documentation.

## Required Architecture Diagrams

The following diagrams are referenced in the documentation but need to be created:

### 1. `aiops-logical-architecture.png`
**Purpose**: Overview of hub-and-spoke architecture

**Content**:
- Hub cluster with components: OpenShift AI, ACM, GitOps, Observability
- Multiple spoke clusters connected to hub
- Git repositories for configuration
- Model registry and serving infrastructure
- Data flow arrows showing observability data (spoke → hub) and remediation (hub → spoke via Git)

**Suggested Tools**: Draw.io, Lucidchart, or diagrams.net

---

### 2. `aiops-dataflow.png`
**Purpose**: End-to-end self-healing workflow

**Content**:
Flow diagram showing:
1. Event Detection (Prometheus alerts on spoke)
2. Aggregation (ACM observability to hub)
3. Analysis (Decision engine feature extraction)
4. Decision (Hybrid engine: runbooks + ML)
5. Execution (Git commit → ArgoCD sync)
6. Feedback (Outcome recorded for ML training)

**Style**: Sequential flow diagram with boxes and arrows

---

### 3. `aiops-decision-flow.png`
**Purpose**: Hybrid decision engine logic

**Content**:
Decision tree showing:
- Incident arrives
- Pattern Matching stage (check runbooks)
  - Match found → Execute (confidence 100%)
  - No match → ML Inference
- ML Inference stage (model prediction)
  - Confidence ≥85% → Execute + Notify
  - Confidence 60-84% → Create PR for review
  - Confidence <60% → Escalate to ops team

**Style**: Flowchart/decision tree

---

### 4. `aiops-ml-pipeline.png`
**Purpose**: MLOps workflow for model lifecycle

**Content**:
Pipeline showing:
1. Data Storage (incident history, metrics, logs)
2. Kubeflow Pipeline
   - Data extraction
   - Feature engineering
   - Training
   - Validation
3. Model Registry (MLflow)
4. KServe Serving (inference API)
5. Monitoring (Prometheus metrics, drift detection)
6. Feedback loop back to data storage

**Style**: Horizontal pipeline diagram

---

## Optional Screenshots (can be added post-deployment)

### `oaiops-operators.png`
Screenshot of OpenShift Console showing installed operators:
- OpenShift GitOps
- OpenShift AI
- Advanced Cluster Management
- OpenShift Pipelines
- OpenShift Data Foundation

### `oaiops-applications.png`
Screenshot of ArgoCD UI showing synced applications:
- openshift-aiops-hub
- openshift-ai-operators
- advanced-cluster-management
- aiops-observability
- aiops-mlops-pipeline

---

## Diagram Style Guidelines

- Use Red Hat/OpenShift brand colors where appropriate
- Keep diagrams clean and readable
- Include legends for icons and colors
- Use consistent iconography (OpenShift logo, Kubernetes icons, etc.)
- Ensure text is legible at standard documentation sizes
- Save as PNG with transparent background if possible

## Image Specifications

- **Format**: PNG
- **Resolution**: Minimum 1200px width for architecture diagrams
- **DPI**: 150+ for crisp rendering
- **File size**: Optimize to <500KB per image

## Temporary Workarounds

Until diagrams are created, the documentation will:
- Display broken image placeholders in browsers
- Show alt text describing the diagram
- Still build successfully in Hugo

The pattern documentation is functional without these images but will be significantly enhanced once they are added.

## Contributing

If you create these diagrams, please:
1. Follow the content guidelines above
2. Add them to this directory
3. Submit a pull request to the validatedpatterns/docs repository
4. Include source files (`.drawio`, `.svg`, etc.) for future edits

## Contact

For questions about diagram creation, contact:
- Pattern maintainers: https://github.com/KubeHeal/openshift-aiops-platform
- Validated Patterns community: https://validatedpatterns.io
