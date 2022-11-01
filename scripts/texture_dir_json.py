# CONVERT LIST OF TEXTURES TO A JSON FILE THAT CAN BE USED BY THE RENDERER
# usage: python texture_dir_json.py <path to texture directory> <path to output json file>
import os
import json
import sys

#get the parameters (if there are any)
tdir = sys.argv[1] if len(sys.argv) > 1 else './textures'
jfile = sys.argv[2] if len(sys.argv) > 2 else f'{tdir}/textures.json'

#import the list of texture pngs
t = os.popen(f"ls {tdir} -1 | sed -e 's/\.png$//'").read()
t_list = [t for t in t.split("\n") if "." not in t and t != ""]
#print(t_list)

#export to the json
tjson = {"textures": t_list}
with open(jfile, "w") as f:
    json.dump(tjson, f, indent=4)