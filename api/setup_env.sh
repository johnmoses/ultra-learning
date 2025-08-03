#!/bin/bash

# Metal support for Apple Silicon
export DYLD_LIBRARY_PATH=/opt/homebrew/lib
export LLAMA_METAL=1

# Threading control
export MKL_NUM_THREADS=4
export NUMEXPR_MAX_THREADS=4
export TOKENIZERS_PARALLELISM=false

# Stack size for model loading
ulimit -s 65532

# Run the application
python run.py