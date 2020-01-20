#!/bin/sh

pip install pep8
python -m compileall app && find test/ -name '*.py' | xargs python && pep8 app/
