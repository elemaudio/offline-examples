# HOA Encoder

A simple command line utility for encoding a mono sound file into higher order ambisonics (HOA) with
a provided azimuth, elevation, and order.

## Usage

First make sure you've installed the dependencies in the parent directory above this example.

```bash
node index.js <input_file> <output_file> [--azim=<degrees>] [--elev=<degrees>] [--order=<integer>]
```

## Example

Try the following command using the included guitar sample to produce a 16-channel ambisonic-encoded output file.

```bash
node index.js ./84bpm_DMaj_PluckingAbout.wav ./out.wav --azim=-90 --elev=0 --order=2
```

The easiest way to test the result is to load the output file into a multi-channel audio environment such as Reaper
or Max/MSP, and send the 16 channels into a binaural decoder to adapt the spatialization to your headphones.
