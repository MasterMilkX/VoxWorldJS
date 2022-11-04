# Converts a 3d numpy .npy file to a txt file (for use with the web app)
# code from: https://pynative.com/python-serialize-numpy-ndarray-into-json/
# usage: python3 npy2json.py <npy file input> (<txt file output>)
#        note -> txt name is optional, otherwise it will be the same as the npy file

import numpy as np
from json import JSONEncoder
import json
import sys

class NumpyArrayEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return JSONEncoder.default(self, obj)

# directly convert a npy array to a JSON string
def npy2txt(arr):
    return json.dumps(arr, cls=NumpyArrayEncoder)

        
#below was entirely written by Github Copilot (thanks!)
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: python3 npy2txt.py <npy file input> (<txt file output>)")
        exit(1)
    npy_file = sys.argv[1]
    txt_file = npy_file.split('.')[0] + '.txt' if len(sys.argv) < 3 else sys.argv[2]
    npy = np.load(npy_file)
    json.dump(npy, open(txt_file, 'w+'), cls=NumpyArrayEncoder)