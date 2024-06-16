# Ethertone

An experimental modular audio playground built with [React] and [Elementary Audio].

[React]: https://react.dev
[Elementary Audio]: https://elementary.audio

## Vision

Ethertone will be the easiest way to make unique music.

It aims to:
- Have a shallow learning curve
- Be optimised for casual users
- Pack the expressive power of a DAW
- Allow anyone with basic coding skills to extend it - no DSP required

The user experience:
- Build your composition by stringing _modules_ together on multiple tracks
- Modules are things like: a synth, an audio effect, a sequencer
- Modules have audio and midi input and output
- Signals implicitly flow left to right

## Current state

We have:

- A module system
- A global transport and metronome
- Example modules for:
  - A sequencer (produces midi)
  - A synth (produces audi from midi)
  - An audio effect (processes audio)
  - A visualisation (produces UI from audio)
- Computer keyboard to midi (play the top two rows of letters)
- Auto save to local storage

## Development

### Requirements

- Node.js

### Build and run

    yarn
    yarn dev
