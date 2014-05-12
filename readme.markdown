open source at scale

how to maintain hundreds of modules in a distributed ecosystem with tens of
thousands of edges

# scale

https://github.com/search?q=type%3Apr+user%3Asubstack+created%3A2014-01-01..2014-05-01&type=Issues&ref=searchresults

https://github.com/dashboard/pulls/public

as of 2014-05-12:

```
$ npmtop 20
rank   percent   packages   author
----   -------   --------   ------
   1    0.65 %      529     tjholowaychuk
   2    0.47 %      380     substack
   3    0.43 %      347     dominictarr
   4    0.40 %      321     juliangruber
   5    0.39 %      315     jongleberry
   6    0.37 %      302     mikolalysenko
   7    0.35 %      286     raynos
   8    0.35 %      282     jonschlinkert
   9    0.34 %      277     sindresorhus
  10    0.31 %      254     mathias
  11    0.29 %      238     forbeslindesay
  12    0.27 %      219     hughsk
  13    0.27 %      216     clewfirst
  14    0.25 %      200     fengmk2
  15    0.24 %      197     phated
  16    0.24 %      192     architectd
  17    0.23 %      187     shtylman
  18    0.23 %      186     azer
  19    0.23 %      183     kitcambridge
  20    0.22 %      182     mattmueller
```

56 people have over 100 packages on npm

# capture your motivation

you're building a system
and you need a component

* search for existing implementations

if you think 
work on it
if you have an idea:

* motivation is scarce
* motivation is fleeting - limit the scope of the first version to something
that can be built in less than 2 hours

build things because you want them to exist

* so that you can do things that
* to keep an implementation clean

# don't worry

Things you shouldn't worry about:

* publishing a 

# myths of triviality

```
It does not matter how or frivolous a project seems: everything you do adds to
your body of work.

I can’t stress this enough: you are not just creating a bunch of small things.
You are creating an ecosystem of projects.
```

http://tinysubversions.com/2014/05/thoughts-on-small-projects

# benefits of small projects

## voxeljs

## gl-modules

## mathematics

## browserify v2

* module-deps
* browser-pack
* insert-module-globals

## trumpet redesign

* html-select
* cssauron
* html-tokenize
* trumpet

# anti-patterns

* plugins that require you to require them

* automated publishing without granular versioning, independent repositories

lodash does this presently. Hopefully they will fix some of these problems.

# great collaborating

https://github.com/substack/minimist/issues/16
https://github.com/substack/minimist/pull/17
