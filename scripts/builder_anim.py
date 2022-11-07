# create a JSON file that adds or removes blocks from a voxel structure (for construction animation)
# usage: python builder_anim.py <structure txt> (<structure 2 txt> <filename>)

import numpy as np
import json
import argparse
from tqdm import tqdm 
import os

# numpy encoder for JSON
class npenc(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(npenc, self).default(obj)


# convert the action list to a JSON string
def actlist2Json(ac):
    return json.dumps(ac,cls=npenc)

# build a 3d structure and return a JSON of the actions to take to remove or add blocks
# input: structure (3d numpy array), action (string), filename (string)
def buildStructure(struct):
    #start from nothing
    cur_struct = np.zeros(struct.shape)

    #get the non-zero blocks and their positions in 3d space
    blocks = np.nonzero(struct)
    block_ids = struct[blocks]
    blocks = np.array(blocks).T  #converts it to x,y,z coordinates

    #make list objects for the JSON file
    action_coords = []
    for bi in range(len(blocks)):
        block = blocks[bi]
        action_coords.append({"block_id":int(block_ids[bi]),"x":block[0],"y":block[1],"z":block[2]})

    #sort by lowest y value (start from the bottom of the structure)
    action_coords = sorted(action_coords, key=lambda k: k['y'], reverse=True)
    return action_coords

    

# transform one structure to another block by block
def struct2Struct(structA, structB):
    #find which blocks are different from A to B
    diff = structB - structA
    blocks = np.nonzero(diff)
    block_ids = structB[blocks]  #change those blocks from A to B
    blocks = np.array(blocks).T  #converts it to x,y,z coordinates

    #make list objects for the JSON file
    action_coords = []
    for bi in range(len(blocks)):
        block = blocks[bi]
        action_coords.append({"block_id":int(block_ids[bi]),"x":block[0],"y":block[1],"z":block[2]})

    #sort by lowest y value (start from the bottom of the structure)
    action_coords = sorted(action_coords, key=lambda k: k['y'], reverse=True)
    return action_coords


# create the full JSON file with the parameters
def makeFullJSON(struct,struct_nexts=None,options=None):
    full_json = {}

    # add the structure id (from options if available)
    if options is not None and "id" in options:
        full_json["id"] = options["id"]

    # add the structure itself
    

    #add options if they exist
    if options is not None:
        for key in options.keys():
            full_json[key] = options[key]

    # add the actions
    # if just one structure passed, build from nothing
    if struct_nexts is None or struct_nexts == []:
        print("> Building structure from nothing")
        full_json["init_structure"] = json.dumps(np.zeros(struct.shape),cls=npenc)  #convert back to txt string
        actions = buildStructure(struct)
        full_json["alterations"] = [actions]
    # if multiple structures passed, build from one to the next
    else:
        print(f"> Building structure from another ( [{len(struct_nexts)+1}] structures total )")
        full_json["init_structure"] = json.dumps(struct,cls=npenc)  #convert back to txt string
        # keep changing the structures
        alter_list = []
        struct_copy = struct.copy()
        with tqdm(total=len(struct_nexts)) as pbar:
            for i in range(len(struct_nexts)):
                alter_list.append(struct2Struct(struct_copy,struct_nexts[i]))
                struct_copy = struct_nexts[i]
                pbar.update(1)

        full_json["alterations"] = alter_list

    return json.dumps(full_json,cls=npenc,indent=2)




# run with command line arguments
if __name__ == "__main__":

    #read in all arguments
    parser = argparse.ArgumentParser(description='Create a JSON file that adds or removes blocks from a voxel structure (for construction animation)')
    parser.add_argument('structTxt', type=str, help='the structure to build')
    parser.add_argument('structNextTxt', nargs='*', type=str, help='the structure to change to (must be the same dimensions as the first structure)')

    parser.add_argument('--filename', metavar='f', type=str, help='the filename to save the JSON to')
    parser.add_argument("--texture_set", metavar='t', type=str, help="the filepath of the .txt list of textures to use")
    parser.add_argument('--id', metavar='i', type=str, help='the id name of the structure')
    parser.add_argument("--rotate", action='store_true', help="whether the structure should rotate during animation")
    parser.add_argument("--cycle_frames", metavar='c', type=int, help="the number of frames in the gif for the structure to complete a full rotation")
    parser.add_argument("--angle", metavar='a', type=int, help="the starting angle of the structure")
    parser.add_argument("--y_height", metavar='y', type=int, help="the y-value to view the structure")
    parser.add_argument("--distance", metavar='d', type=int, help="the radial distance to view the structure")
    parser.add_argument("--block_delay", metavar='b', type=int, help="the delay between each block addition")
    parser.add_argument("--struct_delay", metavar='s', type=int, help="the delay between each structure addition")

    args = parser.parse_args()

    # read in the structure (or structures if multiple)
    with open(args.structTxt) as f:
        struct = np.array(json.loads(f.read()), dtype=int)

    # if there are multiple structures, read them in
    struct_nexts = []
    if args.structNextTxt is not None:
        for struct_next_txt in args.structNextTxt:
            with open(struct_next_txt) as f:
                struct_nexts.append(np.array(json.loads(f.read()), dtype=int))

    #set the filename
    filename = args.filename if args.filename is not None else (os.path.basename(args.structTxt)).split(".")[0] + '.json'

    # save the other options
    options = {}
    if args.id is not None:
        options["id"] = args.id
    if args.rotate is not None:
        options["rotate"] = args.rotate
    if args.angle is not None:
        options["angle"] = args.angle
    if args.y_height is not None:
        options["height"] = args.y_height
    if args.distance is not None:
        options["distance"] = args.distance
    if args.cycle_frames is not None:
        options["cycle_frames"] = args.cycle_frames
    if args.block_delay is not None:
        options["block_delay"] = args.block_delay
    if args.struct_delay is not None:
        options["struct_delay"] = args.struct_delay

    # add the texture set if given
    if args.texture_set is not None:
        with open(args.texture_set) as f:
            options["texture_set"] = f.read().splitlines()


    # run the code and make the json
    out_json = makeFullJSON(struct,struct_nexts,options)
    print("> Saving JSON to " + filename)
    with open(filename, 'w+') as outfile:
        outfile.write(out_json)
