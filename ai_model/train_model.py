import torch
from datasets import load_dataset
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, Trainer, TrainingArguments
import os

# 1. Load the fake-news dataset (Modern and reliable)
print("--- Step 1: Downloading Dataset ---")
dataset = load_dataset("mrm8488/fake-news")['train'].train_test_split(test_size=0.1)

# 2. Preprocessing
# This dataset already has 0 for fake and 1 for real.
# We just need to ensure the columns match DistilBERT expectations.
# The dataset has 'text' and 'label' columns.

# 3. Tokenization (Converting text to numbers)
model_name = "distilbert-base-uncased"
tokenizer = DistilBertTokenizer.from_pretrained(model_name)

def tokenize_function(examples):
    # Ensure we use 'text' column
    return tokenizer(examples["text"], padding="max_length", truncation=True)

print("--- Step 3: Tokenizing Data ---")
tokenized_datasets = dataset.map(tokenize_function, batched=True, keep_in_memory=True)

# 4. Load Pre-trained DistilBERT
print("--- Step 4: Loading Base Model ---")
model = DistilBertForSequenceClassification.from_pretrained(model_name, num_labels=2)

# 5. Training Arguments (Optimized for Laptop/Colab)
training_args = TrainingArguments(
    output_dir="./results",
    eval_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    num_train_epochs=1,
    weight_decay=0.01,
    save_total_limit=1,
)

# 6. The Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"].shuffle(seed=42).select(range(1000)), 
    eval_dataset=tokenized_datasets["test"].select(range(200)),
)

# 7. Start Training
print("--- Step 5: Training Starting (This takes 5-10 mins) ---")
trainer.train()

# 8. Save the final model
print("--- Step 6: Saving Model ---")
model.save_pretrained("./truthshield_model")
tokenizer.save_pretrained("./truthshield_model")

print("\nSuccess! Your model is saved in the 'truthshield_model' folder.")
print("You can now show this to your professor as your custom-trained AI.")
