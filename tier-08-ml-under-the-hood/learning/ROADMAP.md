# Roadmap: Tier 8, Machine learning under the hood

Repo: ml-lab, in Python. Uses data from the Tier 6 wallet and the Tier 5 feed.

## Phase 39: ML foundations
Classic machine learning on a real problem: spotting fraud in wallet transactions, in Python.

### 39.1 Python setup and exploring data
Goal: A Python project and a clear picture of the transaction data.
Build:
- The `ml-lab` repo with uv, pandas and notebooks for exploration
- Transactions exported from your Tier 6 wallet, or a realistic synthetic set
- Basic exploration: distributions, missing values, fraud rate
Understand:
- Notebooks for exploring, scripts for anything you keep
- Why understanding the data comes before any model
- Data leakage, which starts at this step
Break it:
- Create a feature that uses information from after the transaction and notice the leak
Quiz focus:
- What is data leakage, and why does it make models look better than they are?
Done when: You can describe the data's shape, quirks and fraud rate.

### 39.2 Regression from scratch
Goal: Linear and logistic regression built with NumPy before using a library.
Build:
- Gradient descent written by hand
- Loss functions for regression and classification
- The same models in scikit-learn, compared
Understand:
- Gradient descent and learning rate
- Why features need scaling
- What the loss function measures
Break it:
- Set the learning rate too high and watch it diverge
- Skip feature scaling
Quiz focus:
- Why does a too-high learning rate make training blow up?
Done when: Your hand-written model matches scikit-learn closely.

### 39.3 Splits, overfitting and better models
Goal: Honest evaluation, then stronger models.
Build:
- Time-based train, validation and test splits
- Cross-validation and regularization
- Decision trees and gradient boosting with LightGBM
Understand:
- Overfitting and underfitting
- Why time-ordered data needs time-based splits
- Why gradient boosting dominates tabular problems
Break it:
- Split randomly instead of by time and compare the inflated score
Quiz focus:
- Why is a random split wrong for transaction data?
Done when: Your test score is one you'd bet on.

### 39.4 Metrics for rare events
Goal: Fraud models judged by metrics that reflect real cost.
Build:
- Precision, recall, F1, PR-AUC and ROC-AUC
- Threshold selection from the cost of missed fraud vs false alarms
Understand:
- The accuracy trap with rare classes
- Choosing thresholds by business cost
Break it:
- Score a model that always predicts "not fraud"
Quiz focus:
- Your model is 99.5% accurate and useless. How?
- How do you pick the threshold?
Done when: The threshold is chosen from rupees, not defaults.

### 39.5 Serving a model
Goal: The fraud model scores live transactions from your Node services.
Build:
- A FastAPI scoring endpoint
- The wallet calling it with a timeout and a safe fallback
- One shared feature definition for training and serving
Understand:
- Training-serving skew
- What the wallet should do when the model is down
Break it:
- Compute one feature differently at serving time and watch scores shift
Quiz focus:
- The model scored well offline but badly in production. What's the first suspect?
Done when: Live scores match offline scores for the same input.

Phase 39 milestone: 8–10 questions across Phase 39, including: design fraud detection for a payments app, from data to live decisions.

## Phase 40: Neural networks and transformers
How the models behind every AI feature actually work, built small enough to run on a laptop.

### 40.1 A neural network from scratch
Goal: A tiny neural network with backpropagation written by hand.
Build:
- A small automatic differentiation engine
- A two-layer network trained on a toy problem
Understand:
- Forward pass, loss and backward pass
- The chain rule as backpropagation
- Why networks need non-linear activations
Break it:
- Forget to reset gradients between steps
Quiz focus:
- Explain backpropagation without equations.
Done when: You can trace one gradient through the network by hand.

### 40.2 PyTorch
Goal: The same ideas in PyTorch, training a real model.
Build:
- Tensors, modules and a training loop
- Batching with data loaders
- Running on CPU, Apple GPU or CUDA
Understand:
- What PyTorch automates
- Training vs evaluation mode
- Device placement
Break it:
- Put the model and data on different devices
- Evaluate without switching to evaluation mode
Quiz focus:
- Why does evaluation mode change results for some layers?
Done when: You can write a training loop from memory.

### 40.3 Tokenization
Goal: A BPE tokenizer built from scratch and compared with a real one.
Build:
- Byte-pair encoding trained on a small corpus
- A comparison with a production tokenizer
Understand:
- Why models see tokens, not characters
- Why some languages need more tokens, which you saw in Tier 3
Break it:
- Tokenize Hindi, code and emoji, and compare counts
Quiz focus:
- Why does tokenization affect both cost and quality?
Done when: You can explain any token count you see.

### 40.4 Attention and a tiny GPT
Goal: A small transformer trained from scratch that generates text.
Build:
- Self-attention, positional information and transformer blocks
- A character-level model trained on a small text
- Sampling with temperature and top-k
Understand:
- What attention computes
- Why the causal mask matters
- How sampling settings change output
Break it:
- Remove the causal mask and watch training "cheat"
Quiz focus:
- What does the causal mask prevent?
- Why does attention get expensive with long context?
Done when: Your model generates text in the style of its training data.

### 40.5 Scale intuition
Goal: Back-of-envelope maths for model size, memory and compute.
Build:
- Calculations for parameters, memory and training compute for several model sizes
- Notes on why long contexts are costly
Understand:
- Parameters vs memory
- Why training costs far more than running a model
Break it:
- Estimate whether a 7-billion-parameter model fits in your machine's memory
Quiz focus:
- How much memory does a 7B model need at 16-bit, 8-bit and 4-bit?
Done when: You can size a model for hardware without looking it up.

Phase 40 milestone: 8–10 questions across Phase 40, including: explain how a GPT produces its next token, from input text to output.

## Phase 41: Fine-tuning
Training an existing model on your task, and proving with evals whether it was worth it.

### 41.1 When to fine-tune
Goal: A clear decision, with a baseline to beat.
Build:
- A chosen task, such as support-intent classification or product attribute extraction
- A baseline using prompting and RAG, scored with your Tier 4 evals
Understand:
- Prompting vs RAG vs fine-tuning
- What fine-tuning can and can't add
Break it:
- List what a fine-tune would not fix for your assistant
Quiz focus:
- A team wants to fine-tune so the model "knows" their docs. What do you say?
Done when: You have a baseline score to beat.

### 41.2 Dataset preparation
Goal: A clean, deduplicated training set in the right format.
Build:
- Collected and labelled examples
- Instruction-format conversion
- Deduplication and a held-out evaluation split
Understand:
- Data quality over data quantity
- Leakage between train and eval sets
Break it:
- Leave duplicates across train and eval and see the inflated score
Quiz focus:
- Why can duplicates make a fine-tune look great and fail in production?
Done when: No example appears in both training and evaluation.

### 41.3 LoRA and QLoRA
Goal: A small open model fine-tuned on a free or cheap GPU.
Build:
- A LoRA or QLoRA run with Hugging Face PEFT on Colab or Kaggle
- Training and validation loss curves
Understand:
- Why LoRA trains a small fraction of the weights
- Key hyperparameters
- Reading loss curves
Break it:
- Train too long and watch validation loss rise
Quiz focus:
- How does LoRA make fine-tuning affordable?
Done when: You have a fine-tuned adapter and loss curves you can explain.

### 41.4 Did it work?
Goal: Base, fine-tuned and prompted models compared on the same evals.
Build:
- Evals on all three
- Cost and latency comparison
- A check for capabilities the fine-tune lost
Understand:
- Catastrophic forgetting
- Total cost including training and hosting
Break it:
- Test the fine-tuned model on general questions outside its task
Quiz focus:
- Your fine-tune beats the base model. Is it worth deploying?
Done when: You have a written, evidence-based verdict.

### 41.5 Preference tuning and distillation
Goal: Hands-on with DPO and distillation at small scale.
Build:
- A small DPO run on preference pairs
- Distilling a large model's outputs into a small model
Understand:
- Supervised fine-tuning vs preference tuning
- How RLHF works, at a high level
- Why distillation makes models cheaper
Break it:
- Use noisy preference pairs and compare results
Quiz focus:
- What does preference tuning teach that supervised fine-tuning doesn't?
Done when: You can explain how modern chat models get their behaviour.

Phase 41 milestone: 8–10 questions across Phase 41, including: should this company fine-tune? Make the call from their situation.

## Phase 42: Serving and inference
Running models yourself and understanding what makes inference fast or expensive.

### 42.1 Local models
Goal: Open models running on your machine, measured.
Build:
- Ollama or llama.cpp with quantized models
- Tokens per second measured
- Quality compared with an API model on your evals
Understand:
- Quantized model formats
- What limits speed on a laptop
Break it:
- Run a model too big for your memory
Quiz focus:
- Why does a quantized model run on a laptop when the original won't?
Done when: You know what runs well locally and how good it is.

### 42.2 Inference internals
Goal: You can explain where inference time and memory go.
Build:
- Measurements of prefill vs decode time
- Memory estimates including the KV cache
Understand:
- Prefill vs decode
- The KV cache and why it grows with context
- Why output tokens are slower and pricier
Break it:
- Double the context length and measure memory
Quiz focus:
- Why are output tokens more expensive than input tokens?
Done when: You can estimate GPU memory for a model and context length.

### 42.3 vLLM
Goal: A model served with vLLM and load tested.
Build:
- vLLM on a short-lived rented GPU
- An OpenAI-compatible endpoint
- Throughput vs latency measured under load
Understand:
- Continuous batching
- Why batching raises throughput but can hurt latency
Break it:
- Push concurrency past what the KV cache can hold
Quiz focus:
- Why can a GPU serve 50 users at once almost as fast as one?
Done when: You have throughput numbers for your setup, and the GPU is shut down.

### 42.4 Quantization and cost
Goal: Self-hosting vs API decided with real numbers.
Build:
- 16-bit, 8-bit and 4-bit compared on quality and speed
- A break-even calculation against API pricing
Understand:
- What quantization trades away
- Hidden costs of self-hosting
Break it:
- Find the quantization level where your evals start failing
Quiz focus:
- At what usage does self-hosting beat the API for you?
Done when: You can defend self-hosting or not with numbers.

### 42.5 Into the gateway
Goal: Your self-hosted model is one more provider behind the Tier 4 gateway.
Build:
- The self-hosted model added as a gateway provider
- Routing selected tasks to it
- Failover to an API model
Understand:
- Mixing self-hosted and API models
Break it:
- Stop the self-hosted model mid-traffic
Quiz focus:
- How do you run a self-hosted model without risking availability?
Done when: Traffic shifts between self-hosted and API models without user impact.

Phase 42 milestone: 6–8 questions across Phase 42, including: design inference for 10,000 requests a minute on open models.

## Phase 43: Recommendation systems
Ranking what each user sees, applied to the social feed from Tier 5.

### 43.1 Data and baselines
Goal: Interaction data and simple baselines to beat.
Build:
- Interaction data from the Tier 5 feed, or synthetic
- Popularity and recency baselines
- Time-based splits
Understand:
- Implicit vs explicit feedback
- Why simple baselines are hard to beat
Break it:
- Split randomly instead of by time
Quiz focus:
- Why is "most popular" a strong baseline?
Done when: Baseline scores are recorded.

### 43.2 Collaborative filtering
Goal: Recommendations from user behaviour alone.
Build:
- Matrix factorization
- Handling users and items with no history
Understand:
- How shared behaviour creates recommendations
- The cold-start problem
Break it:
- Recommend for a brand-new user and a brand-new post
Quiz focus:
- How do you recommend to someone who joined a minute ago?
Done when: It beats the baselines and handles cold start.

### 43.3 Two-stage retrieval and ranking
Goal: Candidate generation with embeddings, then a ranking model.
Build:
- A two-tower model for user and item embeddings
- Nearest-neighbour candidate retrieval
- A gradient-boosted ranker
Understand:
- Why recommendation is split into retrieval and ranking
- Embedding-based retrieval at scale
Break it:
- Skip retrieval and rank everything, then measure time
Quiz focus:
- Why do large systems retrieve hundreds of candidates before ranking?
Done when: Recommendations are fast and better than collaborative filtering alone.

### 43.4 Features and feature stores
Goal: The same features in training and serving, without leakage.
Build:
- Offline and online features
- Point-in-time correct training data
- Online features in Redis
Understand:
- Point-in-time correctness
- What a feature store solves
Break it:
- Train with a feature computed from the future
Quiz focus:
- What does point-in-time correct mean?
Done when: Training and serving features match exactly.

### 43.5 Evaluation and feedback loops
Goal: Recommendations judged offline and online, with their side effects understood.
Build:
- Recall@k and NDCG offline
- A simulated A/B test
- A feedback-loop simulation
Understand:
- Offline metrics vs online results
- Popularity bias and filter bubbles
Break it:
- Simulate the model training on its own recommendations for several rounds
Quiz focus:
- Your offline metric improved but engagement dropped. Why might that happen?
Done when: You can explain your recommender's effects, not just its score.

Phase 43 milestone: 8–10 questions across Phase 43, including: design the recommendation system for a short-video app.

## Phase 44: MLOps
Keeping models reproducible, deployable and healthy after launch.

### 44.1 Experiment tracking
Goal: Every training run is recorded and reproducible.
Build:
- MLflow tracking for parameters, metrics and artifacts
- Seeds and data versions recorded
Understand:
- Reproducibility in ML
- What to record for each run
Break it:
- Try to reproduce last week's best model without tracking
Quiz focus:
- What do you need to reproduce a model exactly?
Done when: Any past model can be rebuilt.

### 44.2 Registry and deployment
Goal: Models move from staging to production with checks and rollback.
Build:
- A model registry with versions
- Promotion steps and a canary release on your Tier 7 Kubernetes setup
- Rollback
Understand:
- Model versioning vs code versioning
- Canary releases for models
Break it:
- Promote a worse model and roll it back
Quiz focus:
- How do you safely release a new model version?
Done when: Model releases are as safe as code releases.

### 44.3 Monitoring and drift
Goal: You notice when the world changes and the model stops fitting it.
Build:
- Input and prediction drift monitoring
- Dashboards and alerts
- Handling delayed labels
Understand:
- Data drift vs concept drift
- Why labels often arrive weeks later
Break it:
- Shift the input distribution and see if alerts fire
Quiz focus:
- How do you know a model is degrading before labels arrive?
Done when: Drift triggers an alert you trust.

### 44.4 Retraining pipeline
Goal: Models retrain on a schedule and only replace the current one if they're better.
Build:
- Scheduled retraining using your Tier 6 scheduler
- Validation gates before promotion
- Automatic promotion only when evals improve
Understand:
- Automated retraining risks
- Gates that prevent silent regressions
Break it:
- Feed bad data into retraining and confirm the gate blocks it
Quiz focus:
- What stops an automatic retrain from shipping a broken model?
Done when: Retraining runs unattended and safely.

Phase 44 milestone: 6–8 questions across Phase 44, including: design the full lifecycle for a fraud model that must stay accurate for years.

## Tier 8 finish line
The fraud model is live behind the wallet with drift monitoring, your tiny GPT generates text, a fine-tuned model has a written verdict backed by evals, a self-hosted model sits behind your gateway, and the feed recommender is evaluated offline. Run a 15-question quiz across Phases 39–44, and turn five LOG.md entries into interview stories.
