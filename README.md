# ABBA Website Generator

This website generator maps over lists of data to generate pages using different templates and data. It uses a Lodash-like library called Ramda to process data.

The generator uses maps within maps (instead of loops) to generate all the pages. However, it tries to keep the nesting of maps as flat as possible by using a switcher, and also by using a separate system to pass data around. Firstly it maps over a list of page types, using a switcher to call a different generator function for each different pagetype. These generators each include their own maps to map over the pages within that pagetype. One generator - the city region generator - calls a nested generator. This is because each city region has its own suburbs that need to inherit data from their city region parent.

The generators each collate a large object of data for each page. This data is contextually specific to the page being generated. They then pass this object to a function that turns it into a series of regular expressions. These regexes are then applied to the particular template of this page type. They replace moustache tokens in the template files, which are denoted like this: {{token}}. After this, the output is written to the 'public' folder as a finished page.

The data is called a 'context', and it is created by piping together multiple functions that each take a context then merge it with new data to create a new context. These are are ‘reducer’ functions. The starting point of the data is just a handful of key data that you can see in the `generators.js` file being fed into each `R.pipe` function.

For performance reasons, these map functions output only side-effects, and they discard the list that they operate over. The generator's 'outputs' function combines all of the side-effects of these generators: the outputted page, writing to the sitemap, and the console log.

Here is an overview of the hierarchy of mapping in this program:

```
1. Map pageTypes
1.1. Home
1.2. About
1.3. Contact
1.4. Country
1.4.1. Map Buy/Sell
1.5. State
1.5.1. Map Buy/Sell
1.6. Map state regions
1.6.1. Map Buy/Sell
1.7. City page
1.7.1. Map Buy/Sell
1.8. Map city regions
1.8.1. Map Buy/Sell
1.8.1.1. Map city region suburbs
1.9. Directory (uses several levels of mapping internally)
```

The Nearby Suburbs feature relies on a cached JSON file of nearby suburbs for each suburb, and this is generated by the locations-gen folder.

The page-gen folder contains the page generator itself. It contains:

* public/ - output folder
* src/ - templates and data files.
* gen.js - the start and end point for the program
* gen-config.js - the settings file
* generators.js - the generators that generate the pages by using mapping
* utilities.js - reusable functions
* data-paths.js - the paths that point to templates and data contained in the src folder. There is also some piecemeal raw data in this data-paths file
* contexts.js - the object makers that create the contextual data used in the page templates

This entire page-gen folder has been rewritten because before it used to use simple loops within loops which proved to be inflexible. Therefore, some of the src folder contains files and data that are leftover from the previous version and aren't used anymore.

The locations-gen folder is quite unmaintained. The locations-cache.json file that it generates isn't the correct format anymore, It should be of the form:

```
[
    suburb: [
        suburbs
    ],
    ...
]
```

Also, most of the files in the locations-gen folder are not used anymore.

Essentially, the locations-gen scripts use Google Maps API to sort the list of suburbs into order of geographic nearness for each suburb, then takes the first members of each list and serialises this into a JSON file.
