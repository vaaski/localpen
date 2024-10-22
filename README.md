# Localpen

Quickly run and evaluate code with the speed of [Bun][bun].

![Localpen demo](./.github/localpen.gif)

### Synopsis

I like to just run some one-off code snippets sometimes.
There are browser-based solutions like [CodePen](https://codepen.io) or [Stackblitz](https://stackblitz.com), but they come with their own editor and are inherently slow.

Localpen is a CLI tool that allows you to run and evaluate code with the speed of [Bun][bun]. It creates a project folder in a temporary directory, opens it in VSCode and immediately runs the code in Bun using the bun watch command.

Opening in VSCode uses the `--wait` flag, so that closing the editor will tell Localpen to stop the evaluation and show a prompt to delete the temporary directory.

### Usage

- Install [bun][bun]:

  ```bash
  # Linux & macOS
  curl -fsSL https://bun.sh/install | bash
  ```

  ```bash
  # Windows
  powershell -c "irm bun.sh/install.ps1 | iex"
  ```

- Run `localpen`:

  ```bash
  bunx localpen
  ```

- Install `localpen`:
  ```bash
  bun add -g localpen
  ```

### Templates

Currently, there are three templates available:

- `TypeScript`/`ts`
- `JavaScript`/`js`
- `Vite`/`v`

> [!TIP]
> You can also specify any vite template directly, e.g. `vue-ts`

To use a template, run `localpen` with the `-t` flag:

```bash
localpen -t ts
```

### Deletion behavior

By default, Localpen will prompt you to delete the temporary directory after the evaluation is complete.

This prompt can be skipped by passing the `--keep` (`-k`) or the `--delete` (`-d`) flag.

### Todo

- [ ] ensure all the vite templates work
- [x] list the vite templates in the help message

[bun]: https://bun.sh
