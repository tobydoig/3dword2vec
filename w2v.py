import gensim
import numpy as np
# in pycharm umap is actually umap-learn, or "Uniform Manifold Approximation and Projection"
import umap
import datetime
import urllib.request
import os.path
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans

#from sklearn.manifold import TSNE
#import matplotlib.pyplot as plt
#from mpl_toolkits.mplot3d import Axes3D

# https://distill.pub/2016/misread-tsne/
# https://github.com/lmcinnes/umap

# to use a different word2vec model you simply need to change these 2 lines.
# the model doesn't have to be a .gz, it can just be a bin file. something that the gensim library can read.
MODEL_URL = "https://s3.amazonaws.com/dl4j-distribution/GoogleNews-vectors-negative300.bin.gz"
MODEL_FILENAME = "GoogleNews-vectors-negative300.bin.gz"

# THIS IS IMPORTANT - this governs how fast we generate the final data and how quickly/easily the final plot loads
# and renders. A value of 0.02 will take minutes whereas 0.30 can take an hour.
# the google model has 3m search phrases which is too many for us to plot. we randomly sample the data.
SAMPLE_SIZE = 0.15

# we use pca to reduce the number of features per search term from 300 to the value below. this isn't the final number
# of features. it's just that umap is too slow to handle the full 300 features.
INTERIM_COMPONENTS = 50

# since we're targeting a 3d plot then we want 3 components. if you wanted a 2d plot change to 2.
TARGET_COMPONENTS = 3

# just to add some colour to make the final plot prettier, we simply use k-means to identify clusters. this says
# how many clusters. in the graphit.html file, if you're using the "palette" variable to define the colours then you
# want to match the number of colours (10) below. if you use the "lut" variable then you can have as many as you like
# but the contrast between colours is weaker.
CLUSTERS = 10

# this is where we write our final data which the graphit.html file will consume (so if you change the name you need
# to update the SCRIPT reference in that file too).
OUTPUT_FILENAME = 'coords-umap.txt'

# download the word2vec model if we don't have it locally
if (not os.path.isfile(MODEL_FILENAME)):
    print (datetime.datetime.time(datetime.datetime.now()), f'First time we\'re running so downloading the word2vec model {MODEL_FILENAME} which will take some time (it\'s 1.5GB)')
    urllib.request.urlretrieve(MODEL_URL, "./" + MODEL_FILENAME)
else:
    print (datetime.datetime.time(datetime.datetime.now()), f'Found word2vec model {MODEL_FILENAME} locally so no need to download')

# load model into memory
print (datetime.datetime.time(datetime.datetime.now()), 'Loading model into memory...(a minute or so)')
model = gensim.models.KeyedVectors.load_word2vec_format('GoogleNews-vectors-negative300.bin.gz', binary=True)

# the model has 3m keywords, and each has 300 data points.
# we'll pick a random sample of the data because 3m is too many to plot
print (datetime.datetime.time(datetime.datetime.now()), f'Sampling {SAMPLE_SIZE * 100}% the data...')
c = int(len(model.vectors) * SAMPLE_SIZE)
f = len(model.vectors[0])
vectors = np.ndarray((c, f), np.float32)
indices = np.random.choice(len(model.vectors), c)
for i, val in enumerate(indices):
    vectors[i] = model.vectors[val]

# reduce each data point from 300 features down to INTERIM_COMPONENTS
print (datetime.datetime.time(datetime.datetime.now()), f'Reducing data to {INTERIM_COMPONENTS} features using PCA...(few seconds)')
pca = PCA(n_components=INTERIM_COMPONENTS)
pc = pca.fit_transform(vectors)

# now use UMAP (instead of t-sne which is much slower and doesn't look as good, imho) to reduce to TARGET_COMPONENTS features
print (datetime.datetime.time(datetime.datetime.now()), f'Reducing data to {TARGET_COMPONENTS} features using UMAP...(be patient)')
um = umap.UMAP(n_neighbors=15, min_dist=0.1, metric='euclidean', n_components=TARGET_COMPONENTS)
pc = um.fit_transform(pc)

#print (datetime.datetime.time(datetime.datetime.now()), 'T-SNE-ing...')
#ts = TSNE(n_components=TARGET_COMPONENTS)
#pc = ts.fit_transform(pc)

# use k-means to generate some basic colour groups. this is nothing more than trying to make the result prettier.
# the groups (colours) aren't meant to be significant...although visually inspecting the keywords does show correlation
print (datetime.datetime.time(datetime.datetime.now()), f'Using KMeans to generate {CLUSTERS} groups so the final graph is prettier...')
clusters = KMeans(n_clusters=CLUSTERS).fit_predict(pc)

# now we write the data to a text file (json) so the HTML page can consume it
print (datetime.datetime.time(datetime.datetime.now()), f'Writing data to {OUTPUT_FILENAME}...')
f = open(OUTPUT_FILENAME, "w", encoding='utf-8')
f.write('var W2VDATA=[\n')
for i, val in enumerate(indices):
    kw = model.index2word[val]
    if len(kw) > 1:
        v = pc[i]
        f.write('["')
        f.write(kw.replace('"', '\\"')) # keyword
        f.write('",')
        f.write(str(v[0]))  # x
        f.write(',')
        f.write(str(v[1]))  # y
        f.write(',')
        f.write(str(v[2]))  # z
        f.write(',')
        f.write(str(clusters[i])) # colour group (just an integer)
        f.write('],\n')
f.write('];\n')
f.close()

print (datetime.datetime.time(datetime.datetime.now()), 'Finished. Now open graphit.html')

# everything below here is not important. they're just snippets of code i want to "remember"

#NOTE - causes model.vectors_norm to be calculated which is needed lower down
#print (model.most_similar(positive=['woman', 'king'], negative=['man'], topn=1))

#x = np.flipud(np.rot90(pc, k=1, axes=(0, 1)))
#hist, bins = np.histogram(x[3])
#indices = np.digitize(x[3], bins, right=True)

# x = pc[:1000]
# x = [1000 + x * 1000 for x in x]
# x = np.flipud(np.rot90(x, k=1, axes=(0, 1)))
#
# plt.autoscale(True)
# plt.plot(x[0], x[1], 'ro')
#
#
# fig = plt.figure(figsize=(8, 8))
# ax = fig.add_subplot(111, projection='3d')
# ax.scatter(x[0], x[1], x[2])
# plt.show()
# plt.pause(5)

# x = np.flipud(np.rot90(pc[:], k=1, axes=(0, 1)))
# plt.scatter(x[0], x[1], c=clusters, marker=".")
# plt.show()
# plt.pause(5)
