import json
import sys
import os


def arr2json(arr_set, id, tofile=False,out_file='house_set.json'):

	jset = []
	first = True
	#add each house
	for house in arr_set:    #assume already a txt format 3d array
		jdat = {'structure':house}
		jdat['id'] = "craftassist_" + str(id)
		if first:
			jdat['texture_set'] = ["air","stonebrick","dirt","planks_big_oak","sand","iron_bars","glass","iron_block","log_big_oak","wool_colored_red","stone_slab_side"]
			first = False

		jset.append(jdat)

	#write to the file
	jdump = json.dumps({'structure_set':jset}, indent=3)

	if tofile:
		with open(out_file,"w+") as f:
			f.write(jdump)
	else:
		print(jdump)
		

if __name__ == "__main__":
	#parse the file - assume each different house is on a new line
	# parse the file - assume each different house is on a new line
	print(sys.argv[1])
	if sys.argv[1].endswith('.txt'):
		infile = sys.argv[1]
		id = os.path.splitext(os.path.basename(infile))[0]
		houses = []
		with open(infile, "r") as f2:
			houses = f2.readlines()
			houses = [h.strip() for h in houses]

		# run the code
		if len(sys.argv) >= 2:
			outfile = sys.argv[2]
		else:
			outfile = "house_set.json"
		print("output file: ", outfile)
		print("id, ", id)
		arr2json(houses, id,  True, outfile)
	else:
		dir = sys.argv[1]
		i = 0
		for infile in os.listdir(dir):
			if infile.endswith(".txt"):
				with open(os.path.join(dir, infile), "r") as f2:
					houses = f2.readlines()
					houses = [h.strip() for h in houses]
					json_file = infile.split('.')[0] + '.json'
					arr2json(houses, i, True, json_file)
					i += 1
