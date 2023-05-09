# Offline Rendering Examples

This repository holds a set of small examples using Elementary Audio in Node.js to process
audio files. Each subdirectory contains a self-contained script to execute and a README
explaining what the process does and how to use it from your command line.

If you're new to Elementary Audio, [**Elementary**](https://elementary.audio) is a JavaScript/C++ library for building audio applications.

* **Declarative:** Elementary makes it simple to create interactive audio processes through functional, declarative programming. Describe your audio process as a function of your application state, and Elementary will efficiently update the underlying audio engine as necessary.
* **Dynamic:** Most audio processing frameworks and tools facilitate building static processes. But what happens as your audio requirements change throughout the user journey? Elementary is designed to facilitate and adapt to the dynamic nature of modern audio applications.
* **Portable:** By decoupling the JavaScript API from the underlying audio engine (the "what" from the "how"), Elementary enables writing portable applications. Whether the underlying engine is running in the browser, an audio plugin, or an embedded device, the JavaScript layer remains the same.

Find more in the [Elementary repository on GitHub](https://github.com/elemaudio/elementary) and the documentation [on the website](https://elementary.audio/).

## Examples

Before attempting to run the examples below, make sure you first `npm install` in this root
directory to fetch the necessary dependencies.

* [HOA Encoder](https://github.com/elemaudio/offline-examples/tree/master/hoa-encoder)
* [Multi-Channel Convolver](https://github.com/elemaudio/offline-examples/tree/master/convolver)


## License

[ISC](LICENSE.md)
