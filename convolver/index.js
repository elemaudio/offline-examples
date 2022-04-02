import minimist from 'minimist';
import wavefile from 'wavefile';
import { readFileSync, writeFileSync } from 'fs';

import OfflineRenderer from '@elemaudio/offline-renderer';
import { el } from '@elemaudio/core';


// Parsing our input arguments
const argv = minimist(process.argv.slice(2));
const [inFile, irFile, outFile] = argv._;
const {normalize = false} = argv;

// A quick helper function for reading wav files into Float32Array buffers
function decodeAudioData(path) {
  const wav = new wavefile.WaveFile(readFileSync(path));
  const bitRate = wav.fmt.bitsPerSample;
  const sampleRate = wav.fmt.sampleRate;
  const channelData = wav.getSamples().map(function(chan) {
    return Float32Array.from(chan, x => x / (2 ** (bitRate - 1)));
  });

  return {
    bitRate,
    sampleRate,
    channelData,
  };
}

// We wrap the main bit of work in an async main function basically
// just so that we can `await` the core.initialize call below.
(async function main() {
  console.log(`Convolving ${inFile} with ${irFile}...`);

  let core = new OfflineRenderer();

  let inputData = decodeAudioData(inFile);
  let irData = decodeAudioData(irFile);

  if (inputData.sampleRate !== irData.sampleRate) {
    throw new Error('Trying to convolve an input file by an IR with different sample rates! Aborting.');
  }

  if (normalize) {
    let maxSumMagSquared = irData.channelData.reduce(function(max, chan) {
      let chanSumMagSquared = chan.reduce(function(acc, val) {
        return acc + (val * val);
      }, 0);

      return Math.max(max, chanSumMagSquared);
    }, 0);

    let normFactor = (0.125 / Math.sqrt(maxSumMagSquared));

    // Apply the normalization factor
    for (let i = 0; i < irData.channelData.length; ++i) {
      for (let j = 0; j < irData.channelData[i].length; ++j) {
        irData.channelData[i][j] *= normFactor;
      }
    }
  }

  // Like the web audio renderer, we have to initialize the OfflineRenderer by
  // pre-loading any sample data we want to use through the virtual file system.
  // In this case, the sample data we're interested in pre-loading is just the
  // impulse response that will be referenced by the convolver.
  let virtualFileSystem = irData.channelData.reduce(function(acc, next, i) {
    return Object.assign(acc, {
      // This name can be anything you want, we just need to reference it by the
      // same name in our graph below
      [`/virtual/impulse.wav:${i}`]: next,
    });
  }, {});

  await core.initialize({
    // We only take mono input, either by using a mono input file or the just first channel of the input
    numInputChannels: 1,
    // We produce N channels, where N is the number of channels in the IR file
    numOutputChannels: irData.channelData.length,
    sampleRate: inputData.sampleRate,
    virtualFileSystem,
  });

  core.updateVirtualFileSystem(virtualFileSystem);

  // Our processing graph
  core.render(...irData.channelData.map(function(chan, i) {
    // For each channel, we just convolve the first input channel with the
    // appropriate impulse response channel using the named lookup from our
    // virtual file system
    return el.convolve({path: `/virtual/impulse.wav:${i}`}, el.in({channel: 0}));
  }));

  // Pushing samples through the graph
  let inps = [inputData.channelData[0]];
  let outs = Array.from({length: irData.channelData.length}).map(_ => new Float32Array(inps[0].length));

  core.process(inps, outs);

  // Fill our output wav buffer with the process data and write to disk.
  // Here we convert back to 16-bit PCM before write.
  const outputWav = new wavefile.WaveFile();

  outputWav.fromScratch(outs.length, inputData.sampleRate, '16', outs.map(function(chan) {
    return Int16Array.from(chan, x => x * (2 ** 15));
  }));

  writeFileSync(outFile, outputWav.toBuffer());
})();
