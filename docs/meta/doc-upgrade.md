---
id: doc-upgrade
title: '**An Architectural Blueprint for Autonomous Documentation**'
type: reference
version: 1.0.0
created: '2025-09-16'
updated: '2025-09-16'
author: Journal Team
tags:
- react
priority: medium
status: approved
visibility: internal
schema_version: v1
last_verified: '2025-09-16'
---

# **An Architectural Blueprint for Autonomous Documentation**

### **Executive Summary: An Architectural Blueprint for Autonomous Documentation**

The pervasive challenge of LLM models generating disorganized, wordy, and unreliable documentation is a significant impediment to scalable agentic development. The core of the problem, as described, lies in information that becomes "misaligned" and "forgotten" and an inability for agents to adhere to "strict policies and contracts" in large-context scenarios. This report posits that these issues are not minor operational flaws but rather symptoms of a fundamental architectural limitation. Traditional, single-stack approaches that rely on a large language model (LLM) for both reasoning and data persistence are inherently brittle.

This analysis presents a comprehensive architectural blueprint for an autonomous documentation system, designed to transition from non-deterministic, free-form output to structured, verifiable, and persistent knowledge. The proposed solution is a multi-layered, hybrid system built upon four core pillars:

1. **Mandatory Structured Output:** Enforcing machine-readable formats, such as JSON, through schema and grammar-based decoding transforms the LLM from a free-form text generator into a reliable data producer. This provides the foundational primitive for system interoperability and verifiability.
2. **Hybrid Knowledge and Memory:** A sophisticated, hierarchical memory system that combines the rapid retrieval capabilities of vector databases with the rich relational context of knowledge graphs. This hybrid approach ensures that information is not only findable but also contextually grounded and interconnected, preventing it from becoming disorganized and misaligned.
3. **External Policy Control:** A deterministic policy engine, separate from the LLM's non-deterministic reasoning, acts as a robust guardrail. This external control plane ensures unwavering compliance with strict policies and contracts, mitigating the risk of agents "forgetting" crucial rules.
4. **Self-Correcting Feedback Loops:** The system is engineered to minimize human management through autonomous feedback loops. These mechanisms enable agents to self-critique, iteratively refine their outputs, and learn from past failures, thereby achieving a continuous cycle of improvement without constant human intervention.

The integrated architecture outlined in this report is more than a solution for documentation; it is a blueprint for building reliable, auditable, and production-grade AI agent systems that are prepared for the rigor of enterprise deployment.

### **Part 1: Deconstructing the Problem of Disorganized Documentation**

#### **The Technical Roots of "Wordiness" and "Disalignment"**

The user's description of agent-generated documentation as "wordy" and "disorganized" stems from the inherent nature of large language models. LLMs are trained on a vast corpus of human text and are, by design, non-deterministic generators of natural language. Without explicit, structured directives, they default to a verbose and free-form style of communication. This output, while conversational, lacks the machine-readable structure necessary for seamless integration into software pipelines. The "disorganized loose information" that gets "forgotten about" is a direct consequence of the limited and transient nature of the LLM's context window. An agent's short-term memory is constrained by the length of its prompt history. As a task or conversation progresses, earlier details are pushed out of the context window and are effectively "forgotten," making it impossible for the agent to maintain a coherent, long-term state. This explains why information becomes misaligned over time, as the agent operates on an incomplete and shifting view of past events.

The user's observation that agents "often forget when context is large" even when provided with explicit rules highlights a critical architectural flaw. Relying on an LLM to follow "hard security compliance rules" or business policies through simple prompt instructions is a fundamentally unreliable practice.1 An LLM's reasoning is probabilistic and non-deterministic, making it prone to "hallucinations" and a failure to follow instructions perfectly. For mission-critical tasks that demand unwavering compliance, this non-deterministic behavior poses a direct threat to system integrity and operational stability. The documentation problem is not a simple issue of poor formatting; it is a symptom of a foundational architectural mismatch between the probabilistic nature of LLMs and the deterministic requirements of enterprise systems.

#### **Why Naive Solutions Fail at Enterprise Scale**

The most common approach to providing external knowledge to an agent is Retrieval-Augmented Generation (RAG) using a vector database. While this method is effective for fast semantic search and basic question-answering, it falls short when dealing with the complex, relational data typical in enterprise environments.3 The process of converting documents or text into vector embeddings, a mathematical representation of their semantic meaning, often results in a significant loss of context. The explicit relationships and hierarchical structures between data points are not preserved in the high-dimensional vector space. This can lead to a "garbage-in, garbage-out" problem, where an agent retrieves factually correct but contextually irrelevant information, which is a key contributor to the "misaligned information" problem.

Furthermore, pure vector-based RAG architectures can face severe scalability and performance issues at enterprise scale. As datasets grow large and complex, vector searches can become inefficient and resource-intensive, a problem exacerbated by the "curse of dimensionality" in high-dimensional spaces.3 This makes a single-stack, vector-only approach inadequate for building robust and reliable autonomous systems that require deep contextual understanding and verifiable, interconnected knowledge.

### **Part 2: The Foundational Layer: From Chaos to Structure**

#### **Mandating Structure: The Case for JSON Schema and Grammars**

The first and most critical step in solving the problem of disorganized documentation is to compel the LLM to generate its output in a machine-readable, structured format. This transforms the model from a probabilistic "text generator" into a reliable "data producer." The most effective method for this is the use of JSON Schema enforcement and grammar-based decoding, which ensure that the output adheres to a predefined, consistent pattern.5

By constraining the model to a schema, the system gains several benefits:

* **Guaranteed Format Validity:** The output is guaranteed to include all required fields and follow the correct structure, without omitting components or adding unexpected ones.5
* **Easy Validation and Parsing:** The structured output can be automatically validated using standard tools, eliminating the need for complex, custom parsing code and reducing the risk of runtime errors in downstream applications.5
* **Interoperability:** JSON is a ubiquitous data format, making the LLM's output immediately usable by any service or tool that understands JSON.5

While some cloud services primarily use schema for data ingestion 7, the same principle has been extended to output generation, with providers offering features that not only ensure the output is valid JSON but also that it conforms to a specified custom schema.6 This provides a robust and reliable method for standardizing agent output, a necessary precursor to any autonomous documentation system.

#### **Operationalizing Structured Output for Agentic Workflows**

The importance of structured output extends far beyond mere formatting. It serves as the core interoperability primitive that allows non-deterministic LLMs to become reliable components of larger software systems. The concept of "function calling," for instance, is a specialized case of structured output where the LLM produces a JSON object containing a function name and its parameters.8 This capability is what enables LLMs to interface with classical software, execute actions, and participate in multi-step workflows.

Furthermore, structured output is essential for creating testable agentic systems. It is notoriously difficult to conduct unit, integration, and regression testing on systems that produce free-form text. By mandating a structured format, the system can be programmatically validated against expected schemas and content, allowing for automated testing at scale. This addresses a significant piece of the technical debt that plagues nascent LLM-powered applications. To provide the agent with the necessary context to generate accurate structured documentation, the system must also be capable of extracting and organizing metadata from structured sources like databases and spreadsheets, a key step in a multi-step agent workflow.9

### **Part 3: The Knowledge Engine: Architecting a Hierarchical Memory System**

#### **Beyond Embeddings: The Rationale for a Knowledge Graph-Centric Approach**

The inherent limitation of pure vector-based RAG—the loss of contextual relationships—is a significant barrier to creating intelligent, documentation-producing agents. While vector databases excel at finding semantically similar concepts, they fail to model the explicit, nuanced connections between entities, events, and processes.3 This is precisely why information can become "misaligned." A knowledge graph (KG), on the other hand, is a structured representation that models entities as nodes and relationships as edges, allowing for the preservation and traversal of complex, interconnected data.10

For documentation, a KG provides several crucial advantages:

* **Enhanced Retrieval Accuracy:** By accounting for the relationships between data points, KGs can improve search relevance and lead to more accurate responses than a generic semantic search across all available data.4
* **Multi-Hop Reasoning:** A KG enables the agent to perform multi-hop reasoning, following connections between disparate entities to uncover complex relationships and provide richer, more insightful answers than a single-document retrieval could.11
* **Temporal Context:** Frameworks like Zep and Graphiti demonstrate how a KG can be "temporally-aware," dynamically synthesizing conversational data and structured business data while maintaining historical relationships. This allows the agent to understand not just what was said but when it occurred, preventing information from becoming "forgotten" and misaligned.10

#### **A Multi-Modal Memory Framework: Integrating Episodic, Semantic, and Procedural Knowledge**

To achieve a truly robust and human-like memory system, the knowledge engine must be capable of distinguishing between and storing different types of information. This can be conceptualized as a multi-modal memory framework that integrates episodic, semantic, and procedural knowledge.13

* **Episodic Memory:** Stores specific past experiences and events, such as a customer interaction, a code deployment, or an incident resolution. A knowledge graph can model this by linking events, actions, and outcomes with temporal markers, allowing the agent to recall specific histories for case-based reasoning.10
* **Semantic Memory:** Contains generalized factual knowledge, definitions, and rules. This can be represented by a core ontology within the knowledge graph, providing the agent with a grounded source of truth about company policies, product specifications, and domain expertise.13
* **Procedural Memory:** Stores learned behaviors and successful workflows. This can be represented in the KG as a sequence of optimized actions and tool calls, allowing the agent to automate complex tasks and reduce computation time.13

A hybrid architecture that leverages both vector databases and knowledge graphs provides the optimal solution. The vector database can serve as a fast initial search layer, using semantic similarity to quickly identify relevant nodes or entities. The agent can then use these "entry points" to traverse the knowledge graph, leveraging its explicit relationships for deep, contextual reasoning and verification. This symbiotic relationship overcomes the individual limitations of each technology, ensuring that the system is both fast and factually grounded.

| Architecture | Core Technology | Strengths | Weaknesses | Relevance to Autonomous Documentation |
| :---- | :---- | :---- | :---- | :---- |
| **Standard RAG** | Vector Database | Speed, semantic search, scalability for large datasets.4 | Loses relational context, struggles with complex queries, limited results.3 | Good for simple fact retrieval but leads to misaligned information in complex, relational domains. |
| **Pure Knowledge Graph** | Graph Database | Models complex relationships, multi-hop reasoning, enhanced accuracy, and explainability.10 | Slower for simple semantic search, more complex to build and maintain, requires deep technical expertise.3 | Superior for modeling complex, interconnected knowledge and relationships. Can be slow for simple retrieval tasks. |
| **Hybrid (Vector DB \+ KG)** | Vector Database and Graph Database (e.g., Graphiti) | Combines the speed of vector search with the contextual depth of a KG.11 Overcomes weaknesses of each. | Increased architectural complexity.11 | The optimal solution for enterprise documentation, ensuring speed, accuracy, and deep contextual grounding for persistent knowledge. |

#### **The Strategic Role of Vector Databases in a Hybrid Architecture**

The design of a robust knowledge engine for autonomous documentation should not be framed as an exclusive choice between a vector database and a knowledge graph. A more powerful approach is to use them in tandem. The vector database can function as a "Retriever Router," a sophisticated agent that analyzes an incoming query and decides the most appropriate course of action.15 For example, the agent can use a fast semantic search on the vector database to find a starting point—the most semantically relevant document or entity. Once a candidate set of nodes is identified, the agent can then transition to the knowledge graph to perform deep, multi-hop reasoning, exploring the explicit relationships between the initial nodes and other relevant entities.

This symbiotic model is the key to creating a system that is both fast and accurate. It leverages the strengths of each technology while mitigating their weaknesses. This process is a prime example of Agentic RAG, where an intelligent agent orchestrates the retrieval process dynamically, choosing the right tool and retrieval strategy for the specific query, thereby moving beyond a fixed, linear pipeline.15

### **Part 4: The Deterministic Control Plane: Ensuring Policy and Integrity**

#### **Implementing a Rule-Based Policy Engine for Unwavering Compliance**

A central concern is the need for agents to adhere to "strict policies and contracts." As established, LLMs cannot be trusted to follow these rules deterministically. The solution is to separate policy enforcement from the agent's non-deterministic reasoning. This is achieved by implementing a rule-based policy engine that operates externally to the LLM.1

The policy engine is founded on three core principles:

1. **Structured State Management:** All policy-related data is kept in a structured, strongly-typed state, separate from the LLM's chat history. This state serves as the single source of truth, impervious to LLM hallucinations or failures.1
2. **Controlled State Updates:** Updates to this structured state can only occur during deterministic tool calls. The agent's requests to update the state are validated by the policy engine, and the new state is then fed back to the LLM as an LLM-friendly message, keeping it aware of the current, verifiable state.1
3. **Pre-execution Rule Checking:** Before a tool call is executed, the policy engine performs a compliance check. This prevents the LLM from causing real-world side effects even if its reasoning is flawed. If a violation is detected, the engine returns an explainable reason, allowing the agent to replan its actions or seek human guidance.1

This architecture acts as a robust and unwavering guardrail, ensuring that no matter how large the context or how complex the task, the agent cannot violate a codified policy.

| Principle | Description | Impact on Compliance |
| :---- | :---- | :---- |
| **Structured State Management** | Policy-related data is stored in a strongly-typed, separate database, protecting it from LLM hallucinations.1 | Creates a single source of truth for all critical business rules, ensuring integrity. |
| **Controlled State Updates** | Updates to the structured state are only permitted during deterministic tool calls, with the new state reflected back to the agent.1 | Prevents the agent from bypassing or hallucinating state changes, ensuring a verifiable audit trail. |
| **Pre-execution Rule Checking** | Compliance rules are checked before any action is taken. If a violation occurs, the agent is notified to replan.1 | Acts as a final, hard guardrail that prevents the agent from causing real-world harm or policy violations. |

#### **Automated Self-Correction via Feedback Loops and Observability**

The requirement for a solution "without constant human management" is met by building a self-correcting system. This is achieved by integrating autonomous feedback loops into the agent's workflow.17 A powerful example of this is a code-generating agent that uses a

Code Reviewer Tool and a Unit Test Runner Tool to iteratively refine its output.18 The same principle can be applied to documentation. An agent can generate a document, and a dedicated "reviewer" agent or a set of "unit tests" can then critique the output for quality, accuracy, and adherence to specific standards. This feedback is then sent back to the original agent, which uses the information to correct its mistakes and improve its performance.

This iterative process of self-correction relies heavily on robust observability tooling.19 Platforms like AgentOps and Arize provide LLM-specific telemetry, logging every significant event, tracking decision paths, and measuring quality metrics.19 This creates a comprehensive, auditable data trail that allows developers to debug the system and flag when an agent's performance or outputs deviate from expected norms. The system's ability to monitor its own performance and alert humans only when a critical failure or policy violation occurs fundamentally redefines the human role from one of constant management to one of strategic oversight.2

### **Part 5: The Integrated Solution: An End-to-End Autonomous Documentation Pipeline**

#### **A Detailed Workflow: From Agent Action to Knowledge Base Ingestion**

The proposed architecture can be instantiated as a comprehensive, end-to-end autonomous documentation pipeline. The workflow integrates the foundational layers of structured output and hybrid memory with the deterministic control of the policy engine, all managed by a continuous feedback loop.

| Step | Component | Description |
| :---- | :---- | :---- |
| **Step 1: Agent Action & Output Generation** | LLM Agent, Prompting Layer, JSON Schema Enforcer | An agent completes a task (e.g., an incident ticket is resolved). It is then prompted to generate documentation in a machine-readable format that is enforced by a JSON schema.5 |
| **Step 2: Pre-Ingestion Validation** | Deterministic Policy Engine (Structured State) | The generated structured documentation is validated against pre-defined policies and contracts. The policy engine performs a pre-execution rule check to ensure all rules are met before the next step.1 |
| **Step 3: Knowledge Extraction & Ingestion** | Knowledge Extraction Layer (LLM), Hybrid Memory System (KG \+ Vector DB) | The validated, structured output is ingested. An LLM-based layer extracts entities and relationships, which are then used to update the temporal knowledge graph.10 Embeddings are also stored in the vector database.20 |
| **Step 4: Autonomous Self-Correction** | Autonomous Feedback Loop, Reviewer Agent/Tool | The ingestion triggers a feedback loop. A separate agent or a dedicated tool reviews the newly ingested documentation (e.g., for consistency or completeness) and provides feedback to the original agent for improvement.17 |
| **Step 5: Monitoring & Auditing** | Observability Tooling (e.g., AgentOps, Arize) | The entire process is continuously monitored. Observability tools track every step—from agent decisions to token usage—creating a comprehensive, auditable trail that can be used for debugging and compliance verification.19 |

#### **The Crucial Role of Human-in-the-Loop in a Self-Sustaining System**

In this self-sustaining system, the role of human-in-the-loop is reframed. Instead of being constant managers who correct every mistake, humans become high-level overseers who are only alerted when a critical decision needs validation or a significant deviation from policy is detected.2 The autonomous feedback loops and observability system handle the vast majority of routine tasks and corrections, freeing up human resources for strategic, high-value work.

Furthermore, human intervention in complex or rare edge cases becomes a powerful form of supervised feedback.17 When an agent cannot autonomously resolve a problem, the human provides a validated solution. The agent can then store this solution in its procedural memory, learning from the experience and incorporating it into its future workflows, thereby continuously improving the system's overall performance and reliability.13

### **Conclusion & Forward-Looking Recommendations**

#### **A Paradigm Shift for Enterprise AI**

The problem of disorganized and unreliable agent-generated documentation is a fundamental architectural challenge, not a minor issue of prompt quality. The proposed multi-layered architecture—combining structured output, a hybrid knowledge engine, a deterministic policy control plane, and self-correcting feedback loops—provides a robust, scalable, and verifiable solution. This framework transforms the LLM agent from a simple tool into a reliable, auditable, and production-grade component of the enterprise ecosystem. This blueprint is not limited to documentation; it is a scalable framework for building any mission-critical AI agent system that requires adherence to strict policies and dependable, autonomous operation.

#### **Future Avenues for Advancement**

While this architectural blueprint provides a clear path forward, the field of agentic development continues to evolve. Future advancements and research avenues include:

* **Domain-Specific Ontologies:** Further exploration of domain-specific ontologies presents a significant opportunity to enhance knowledge extraction and reasoning within the knowledge graph, tailoring the system to a company's unique needs and data structures.12
* **Advanced Self-Learning:** Deeper research into end-to-end reinforcement learning on Chain-of-Thought traces could provide a clearer path for agents to self-evolve and optimize their workflows beyond simple iterative prompting.14
* **Standardized Benchmarks:** The field currently lacks robust and complex memory benchmarks that reflect real-world business applications. The development of such benchmarks is crucial for effectively evaluating and differentiating competing memory architectures and agentic frameworks.12

#### **Works cited**

1. Enforcing Compliance While Retaining Agency: A Rule-Based ..., accessed September 16, 2025, [https://medium.com/commbank-technology/enforcing-compliance-while-retaining-agency-a-rule-based-policy-engine-approach-for-react-agents-a9a8a1b4a88c](https://medium.com/commbank-technology/enforcing-compliance-while-retaining-agency-a-rule-based-policy-engine-approach-for-react-agents-a9a8a1b4a88c)
2. What is Agentic AI? | UiPath, accessed September 16, 2025, [https://www.uipath.com/ai/agentic-ai](https://www.uipath.com/ai/agentic-ai)
3. Vector database vs. graph database: Knowledge Graph impact \- WRITER, accessed September 16, 2025, [https://writer.com/engineering/vector-database-vs-graph-database/](https://writer.com/engineering/vector-database-vs-graph-database/)
4. Vector Databases vs. Knowledge Graphs for RAG | Paragon Blog, accessed September 16, 2025, [https://www.useparagon.com/blog/vector-database-vs-knowledge-graphs-for-rag](https://www.useparagon.com/blog/vector-database-vs-knowledge-graphs-for-rag)
5. Structured Output Generation in LLMs: JSON Schema and Grammar-Based Decoding | by Emre Karatas | Medium, accessed September 16, 2025, [https://medium.com/@emrekaratas-ai/structured-output-generation-in-llms-json-schema-and-grammar-based-decoding-6a5c58b698a6](https://medium.com/@emrekaratas-ai/structured-output-generation-in-llms-json-schema-and-grammar-based-decoding-6a5c58b698a6)
6. Enforcing JSON Schema with Anyscale & Together \- Portkey Docs, accessed September 16, 2025, [https://portkey.ai/docs/guides/use-cases/enforcing-json-schema-with-anyscale-and-together](https://portkey.ai/docs/guides/use-cases/enforcing-json-schema-with-anyscale-and-together)
7. Provide or auto-detect a schema | AI Applications | Google Cloud, accessed September 16, 2025, [https://cloud.google.com/generative-ai-app-builder/docs/provide-schema](https://cloud.google.com/generative-ai-app-builder/docs/provide-schema)
8. The Essential Guide to Large Language Models Structured Output, and Function Calling, accessed September 16, 2025, [https://pavelbazin.com/post/the-essential-guide-to-large-language-models-structured-output-and-function-calling/](https://pavelbazin.com/post/the-essential-guide-to-large-language-models-structured-output-and-function-calling/)
9. A Step-by-Step Guide to Building AI Agents for Structured and Unstructured Data \- Medium, accessed September 16, 2025, [https://medium.com/@devkapiltech/a-step-by-step-guide-to-building-ai-agents-for-structured-and-unstructured-data-7b5998411b18](https://medium.com/@devkapiltech/a-step-by-step-guide-to-building-ai-agents-for-structured-and-unstructured-data-7b5998411b18)
10. Building AI Agents with Knowledge Graph Memory: A ... \- Medium, accessed September 16, 2025, [https://medium.com/@saeedhajebi/building-ai-agents-with-knowledge-graph-memory-a-comprehensive-guide-to-graphiti-3b77e6084dec](https://medium.com/@saeedhajebi/building-ai-agents-with-knowledge-graph-memory-a-comprehensive-guide-to-graphiti-3b77e6084dec)
11. How can we use knowledge graph for LLMs? : r/Rag \- Reddit, accessed September 16, 2025, [https://www.reddit.com/r/Rag/comments/1i7id8u/how\_can\_we\_use\_knowledge\_graph\_for\_llms/](https://www.reddit.com/r/Rag/comments/1i7id8u/how_can_we_use_knowledge_graph_for_llms/)
12. Zep: A Temporal Knowledge Graph Architecture for Agent Memory \- arXiv, accessed September 16, 2025, [https://arxiv.org/html/2501.13956v1](https://arxiv.org/html/2501.13956v1)
13. What Is AI Agent Memory? | IBM, accessed September 16, 2025, [https://www.ibm.com/think/topics/ai-agent-memory](https://www.ibm.com/think/topics/ai-agent-memory)
14. AI Agents long term memory \- How and why \- AgentX, accessed September 16, 2025, [https://www.agentx.so/post/ai-agent-long-term-memory-how-and-why](https://www.agentx.so/post/ai-agent-long-term-memory-how-and-why)
15. Agentic RAG: A Guide to Building Autonomous AI Systems – n8n Blog, accessed September 16, 2025, [https://blog.n8n.io/agentic-rag/](https://blog.n8n.io/agentic-rag/)
16. Agentic RAG: How Autonomous AI Agents Are Transforming ..., accessed September 16, 2025, [https://ai.plainenglish.io/agentic-rag-how-autonomous-ai-agents-are-transforming-industry-d3e2723f51e8](https://ai.plainenglish.io/agentic-rag-how-autonomous-ai-agents-are-transforming-industry-d3e2723f51e8)
17. The Power of AI Feedback Loop: Learning From Mistakes | IrisAgent, accessed September 16, 2025, [https://irisagent.com/blog/the-power-of-feedback-loops-in-ai-learning-from-mistakes/](https://irisagent.com/blog/the-power-of-feedback-loops-in-ai-learning-from-mistakes/)
18. Self-correcting Code Generation Using Multi-Step Agent ..., accessed September 16, 2025, [https://deepsense.ai/resource/self-correcting-code-generation-using-multi-step-agent/](https://deepsense.ai/resource/self-correcting-code-generation-using-multi-step-agent/)
19. Establishing Trust in AI Agents — II: Observability in LLM Agent Systems \- Medium, accessed September 16, 2025, [https://medium.com/@adnanmasood/establishing-trust-in-ai-agents-ii-observability-in-llm-agent-systems-fe890e887a08](https://medium.com/@adnanmasood/establishing-trust-in-ai-agents-ii-observability-in-llm-agent-systems-fe890e887a08)
20. Context-Aware RAG Chatbot using Oracle 23AI Database and OCI Gen AI Agents, accessed September 16, 2025, [https://conneqtiongroup.com/blog/context-aware-rag-chatbot-using-oracle-23ai-database-and-oci-gen-ai-agents](https://conneqtiongroup.com/blog/context-aware-rag-chatbot-using-oracle-23ai-database-and-oci-gen-ai-agents)
21. What Are AI Agents? | IBM, accessed September 16, 2025, [https://www.ibm.com/think/topics/ai-agents](https://www.ibm.com/think/topics/ai-agents)
