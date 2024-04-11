#!/bin/bash

for file in /h/Painter_Samples/painter_test2/epoch_10/*.json; do
  node mass_render.js $file GIF /h/Painter_Samples/painter_test2/epoch_10/
done