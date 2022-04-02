import minimist from 'minimist';
import wavefile from 'wavefile';
import { readFileSync, writeFileSync } from 'fs';

import * as jshlib from 'spherical-harmonic-transform';

import OfflineRenderer from '@elemaudio/offline-renderer';
import { el } from '@elemaudio/core';


// Parsing our input arguments
const argv = minimist(process.argv.slice(2));
const [inFile, outFile] = argv._;
const {azim = 0, elev = 0, order = 1} = argv;

// Preparing our wav file assets
const inputWav = new wavefile.WaveFile(readFileSync(inFile));
const outputWav = new wavefile.WaveFile();

console.log(`Encoding HOA output file with azim: ${azim}, elev: ${elev}, order: ${order}`);

// This function encodes a mono point source with a given azimuth and
// elevation into an Nth order HOA channel array.
//
// Order, azim, and elev are all expected to be primitive numbers. Azim
// and elev are in degrees, not radians. The return value is an array of
// elementary nodes of length (order + 1)^2.
function ambipan(order, azim, elev, xn) {
  let gains = jshlib.computeRealSH(order, [
    [azim * Math.PI / 180, elev * Math.PI / 180],
  ]);

  return gains.map(function(g, i) {
    return el.mul(el.sm(el.const({key: `g${i}`, value: g[0]})), xn);
  });
}

// We wrap the main bit of work in an async main function basically
// just so that we can `await` the core.initialize call below.
(async function main() {
  let core = new OfflineRenderer();
  let numOuts = (order + 1) * (order + 1);

  await core.initialize({
    numInputChannels: 1,
    numOutputChannels: numOuts,
    sampleRate: inputWav.fmt.sampleRate,
  });

  // Our sample data for processing. We expect that the input wav is
  // a mono file, but if it's not we just take the first channel of data
  //
  // We also have to convert from integer PCM to 32-bit float here.
  let inps = [Float32Array.from(inputWav.getSamples()[0], x => x / (2 ** (inputWav.fmt.bitsPerSample - 1)))];
  let outs = Array.from({length: numOuts}).map(_ => new Float32Array(inps[0].length));;

  // Our processing graph
  core.render(...ambipan(order, azim, elev, el.in({channel: 0})));

  // Pushing samples through the graph
  core.process(inps, outs);

  // Fill our output wav buffer with the process data and write to disk.
  // Here we convert back to 16-bit PCM before write.
  outputWav.fromScratch(numOuts, inputWav.fmt.sampleRate, '16', outs.map(function(chan) {
    return Int16Array.from(chan, x => x * (2 ** 15));
  }));

  writeFileSync(outFile, outputWav.toBuffer());
})();
