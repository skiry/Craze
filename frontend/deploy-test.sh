#!/bin/bash

npm install --save
npm install -g eslint eslint-config-airbnb eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks
eslint src/ --max-warnings 0

