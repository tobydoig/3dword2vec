# 3dword2vec
3d plot of a word2vec model using [UMAP](https://umap-learn.readthedocs.io/en/latest/) for dimensionality reduction (PCA and T-SNE also supported) and [three.js](https://threejs.org/) for plotting.

 ![Screenshot](screenshot.png)

    Left drag - rotate
    Right drag - move model
    Left click - add keyword label
    Mouse wheel - zoom
    WASD - was meant to move the camera but does weird things (for now)

We support the [GoogleNews](https://code.google.com/archive/p/word2vec/) and [FastText](https://fasttext.cc/docs/en/english-vectors.html) models.

Note, we randomly sample a portion of the data to reduce the amount being plotted, but also to reduce the overall processing time.

# Install
Use pip (or your IDE) to install the relevant Python libraries (I'm using python 3 and PyCharm)

    pip install umap-learn gensim numpy mapplotlib

Note - the umap library is called "umap-learn"

# Run
When running it will download (and optionally unzip) the underlying model if it doesn't find it locally. The models can be quite large so be patient.

    python w2v.py

If you already have the model file downloaded the output might look like:

    15:07:48.002947 Downloading model from https://s3-us-west-1.amazonaws.com/fasttext-vectors/wiki-news-300d-1M.vec.zip
    15:10:32.547626 Unzipping local model archive wiki-news-300d-1M.vec.zip
    15:10:46.094952 Loading local model wiki-news-300d-1M.vec
    15:14:24.301819 Sampling 15.0% of 999994 vectors
    15:14:24.532119 Reducing data to 50 features using PCA (fast)
    15:14:27.685862 Reducing data to 3 features using UMAP (slow-ish)
    15:19:04.151343 Using KMeans to generate 10 groups so the final graph is prettier...
    15:19:12.115986 Writing data to ./keyword-data.js...
    15:19:13.427344 Finished, now open graphit.html

Open graphit.html with a browser (directly, no need to go a via webserver).

# Compare
For comparison here we use some different algorithms to generate the 3d data points from a 2% sampling of the GoogleNews model.

Here we're using PCA to reduce to 50 and then UMAP to 3. This is my favourite reduction as I think it accentuates certain branches.

 ![UMAP Plot](pca-umap.png)

Here we used PCA and t-SNE. You can see the separation but it still looks clumpy. t-SNE is slow to compute so starting with PCA speeds things up a bit.

  ![PCA + t-SNE plot](pca-tsne.png)

Here we use just PCA, which is fast but not as pretty.

  ![PCA plot](pca.png)

