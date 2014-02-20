# bower-files



## Installation

```bash
$ npm install bower-files --save
```

## Usage



## Example

<!--
│
└
├
─
-->



## Troubleshooting



## Caveats



## Development

This project uses [`gulp`](http://gulpjs.com/) for task automation.

```bash
$ npm install -g gulp
```

Here are the three tasks available to use:

* `gulp hint`: runs all pertinent code against jshint. The rules are the ones
defined in [`.jshintrc`](.jshintrc)

* `gulp test`: runs all tests with
[`mocha`](http://visionmedia.github.io/mocha/) for passing and
[`instanbul`](http://gotwarlost.github.io/istanbul/) for code coverage. It
generates html files showing the code coverage.

* `gulp docs`: builds out all of the documentation using
[`docco`](http://jashkenas.github.io/docco/). Note that you need to have docco
installed (`npm install -g docco`). I at one time at docco part of the dev
dependencies, but now I don't. I may be open to putting it back, but I just
wanted to keep the package as small as possible.

You can also run `npm test`, and it does basically does the same thing as
`gulp test`, but an error will be thrown because it does some more istanbul
stuff to send data to the coverage server. When this project runs through
travis, it also sends coverage data to coveralls.io.

When forking and doing pull requests, work off of the `develop` branch. I won't
be super strict on this, but it's what I would prefer. That way we can keep
`master` clean.
