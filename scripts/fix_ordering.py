import numpy as np
import pandas as pd
import os
import re
from pprint import pprint


# The original list of structures, in order, coming from the "16x16x16_binary_outliersremoved.npy" file
# (craftassist_0.npy is the first element of this, and craftassist_1038.npy is the last element)

og_order_filenames = []
for i in range(0, 1039):
    og_order_filenames.append(i)

# then, these are converted to gif files using os.listdir on the craftassist_npys_raw directory, which goes by alphabetical order
npys_dir = 'C:/Users/timme/Documents/Renderer/VoxWorldJS/craftassist_npys_raw/'
npys_alph_order = []
dict = {}
i = 0
for npy_file in os.listdir(npys_dir):
    if npy_file.endswith('.npy'):
        npy_file_name = os.path.basename(npy_file)
        match = re.search(r'(\d+)', npy_file_name)
        idx = match.group(1)
        dict[i] = int(idx)
        i += 1
        # npys_alph_order.append(int(idx))

# zip these two together to get the mapping
# zipped = zip(og_order_filenames, npys_alph_order)
#
# dict = {}
# for i in range(len(og_filenames))
# print(list(zipped))
# l = [list(x) for x in zipped]
# print(l)
# df = pd.DataFrame(list(zipped),
#                columns =['gif', 'npy'])
# df.to_csv("mapping.csv", index=False)


# bads = [44, 50, 72, 74, 79, 81, 98, 110, 115, 117, 154, 157, 175, 177, 190, 192, 194, 200, 202, 207, 218, 228, 232, 237, 238, 250, 268, 284, 303, 304, 305, 320, 322, 334, 335, 340, 344, 357, 372, 391, 406, 422, 450, 478, 486, 491, 522, 539, 552, 553, 564, 568, 570, 574, 590, 594, 597, 605, 607, 609, 613, 616, 618, 625, 635, 650, 655, 656, 659, 660, 677, 683, 696, 705, 733, 739, 741, 743, 744, 751, 766, 783, 798, 809, 840, 841, 850, 854, 881, 883, 891, 902, 906, 908, 909, 913, 919, 921, 924, 929, 937, 940, 942, 951, 958, 979, 985, 995, 999, 1003, 1006, 1017, 1019, 1026]
# maybes = [19, 20, 21, 38, 42, 49, 51, 61, 65, 67, 86, 95, 116, 119, 126, 136, 140, 150, 159, 171, 178, 186, 188, 204, 209, 236, 249, 266, 272, 277, 280, 282, 289, 302, 339, 352, 354, 358, 359, 361, 362, 363, 367, 376, 378, 379, 393, 400, 408, 412, 427, 437, 451, 468, 477, 480, 481, 490, 499, 508, 541, 544, 549, 550, 556, 560, 565, 567, 586, 603, 604, 611, 644, 651, 653, 657, 658, 662, 663, 679, 684, 684, 686, 691, 701, 707, 708, 718, 725, 732, 740, 761,  771, 793, 824, 845, 847, 857, 863, 866, 876, 878, 886, 915, 925, 930, 945, 949, 956, 966, 970, 972, 975, 978, 984, 988, 993, 998, 1004, 1010, 1011, 1030, 1033, 1034, 1035, 1038]
# comb  = bads + maybes
goods = [1, 3, 9, 14, 27, 37, 39, 43, 54, 62, 70, 85, 101, 97, 127, 145, 144, 158, 156, 179, 166, 201, 183, 217, 216, 215, 203, 235, 234, 231, 229, 226, 225, 223, 248, 243, 271, 267, 264, 262, 258, 291, 288, 286, 281, 279, 275, 274, 273, 308, 306, 299, 324, 318, 316, 315, 314, 311, 341, 333, 331, 327, 366, 364, 355, 347, 375, 371, 402, 398, 395, 389, 388, 416, 411, 407, 404, 403, 433, 431, 430, 426, 452, 447, 443, 442, 438, 436, 464, 463, 485, 484, 479, 474, 472, 471, 470, 501, 500, 488, 516, 510, 531, 529, 523, 543, 562, 561, 571, 572, 573, 582, 585, 588, 591, 593, 596, 600, 601, 606, 610, 623, 628, 629, 630, 637, 638, 643, 645, 647, 665, 666, 669, 670, 672, 675, 681, 688, 692, 693, 700, 709, 711, 712, 713, 715, 717, 721, 724, 726, 731, 734, 747, 748, 750, 752, 754, 755, 756, 758, 760, 764, 765, 777, 778, 781, 786, 787, 791, 799, 804, 805, 806, 810, 812, 816, 817, 820, 826, 828, 830, 832, 838, 842, 852, 860, 864, 868, 873, 879, 885, 888, 897, 898, 901, 905, 910, 912, 927, 935, 936, 941, 943, 944, 947, 957, 961, 962, 963, 967, 976, 983, 991, 992, 996, 1009, 1014, 1018, 1036]
remove_idxs = [dict[x] for x in goods]
print(remove_idxs)
print(len(remove_idxs))
