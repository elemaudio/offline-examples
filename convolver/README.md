# Multi-Channel Convolver

A simple command line utility for processing a mono sound file into a multi-channel output file by
convolving the input with each channel of a multi-channel impulse response file.

## Usage

First make sure you've installed the dependencies in the parent directory above this example.

```bash
node index.js <input_file> <ir_file> <output_file> [--normalize=<boolean>]
```

## Example

Try the following command using the included drum sample and hall impulse to produce a 2-channel output file.

```bash
node index.js ./85_DnBDrums_03_592.wav ./KnightsHall.wav ./out.wav --normalize=true
```
