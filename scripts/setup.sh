#!/bin/bash

# create temporary directory
mkdir tmp

# Download Stanford CoreNLP
wget -P tmp "https://downloads.cs.stanford.edu/nlp/software/stanford-ner-4.2.0.zip"

# Unzip to tmp/folder
unzip tmp/stanford-ner-4.2.0.zip -d tmp/
